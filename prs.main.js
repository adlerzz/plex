import fs from "node:fs/promises";
import Bunch from "./bunch.class.js";
import {parseArgs, pad} from "./utils.js";

const settings = {
    rulesFile: 'prs.rules.js',
    inputFile: 'input.txt',
    outputfile: 'output.json',
};

const FIRST_NODE = "'F";
const DOT_POINT = "_";

function showDP(snap) {
    const s = [...snap.rule.seq];
    s.splice(snap.dp, 0, DOT_POINT);
    return s.join(" ");
}

function snapToString(snap){
    return `  #${pad(snap.rule.id, 4)} [${pad(snap.dp, 2)}] ${snap.rule.node} : ${showDP(snap)}`;
}

function stateToString(state){
    return `$${state.id}\n` + state.snaps.asArray()
        .toSorted( (s1,s2) => s1.rule.id - s2.rule.id)
        .map(snap => snapToString(snap))
        .join("\n") + "\n.";
}

function snapHash(snap){
    return `${snap.rule.id}:${snap.dp}`;
}

function stateHash(state){
    return state.snaps.asArray()
        .map(snap => snapHash(snap))    
        .toSorted()
        .join(",")
}

class Parser {
    constructor() {
        this.rules = null;
        this.nodes = null;
        this.states = null;
        this.statesCount = 0;
        this.t = null;
    }

    static async #parseRules(rulesFile) {
        const { default: rules } = await import(`./${rulesFile}`);
        const rulesList = Object
            .entries(rules)
            .flatMap(([node, rules]) => rules
                .map(rule => ({ node, seq: rule.split(" ") }))
            );
        const first = { node: FIRST_NODE, seq: [rulesList[0].node] };

        return Bunch.from([first, ...rulesList].map((it, id) => ({ id, ...it })));
    }

    static async init(rulesFile){
        const instance = new Parser();
        instance.rules = await Parser.#parseRules(rulesFile);
        instance.nodes = instance.rules
            .map(it => it.node)
            .unique();
        instance.states = Bunch.empty();
        instance.t = [];
        return instance;
    }

    isNode(entity) {
        return this.nodes.has(entity);
    }

    instantiateState(snaps){
        if(snaps.size() === 0){
            return null;
        }
        const id = null; 
        return { id, snaps };
    }

    assignId(state){
        state.id = this.statesCount++;
    }

    stateByHash(hash){
        return this.states.asArray().find( state => hash === stateHash(state));
    }

    snapsByNode(nodeName) {
        return this.rules
            .filter( rule => rule.node === nodeName)
            .map(rule => ({rule, dp: 0}))
            .unique();
    }

    stateSnapsByEntity(state, entity){
        return state.snaps
            .filter(snap => snap.rule.seq.at(snap.dp) === entity)
    }

    ngen(snaps) {
        return snaps
            .flatMap(snap => this.snapsByNode(snap.rule.seq[snap.dp]).asArray())
            .unique();
    }

    convolute(state) {
        let size;
        do {
            const toAdd = this.ngen(state.snaps);
            size = state.snaps.merge(toAdd);
        } while(size !== 0);
    }

    static esByState(state){
        return state.snaps
            .map(snap => snap.rule.seq?.[snap.dp])
            .filter(Boolean)
            .unique();
    }

    dotShift(state, entity){
        const pass = this.stateSnapsByEntity(state, entity);
        const newSnaps = pass.map(snap => ({...snap, dp: snap.dp + 1}));
        const iN = this.instantiateState(newSnaps);
        this.convolute(iN);
        return iN;
    }

    buildStates(){
        const i0 = this.instantiateState( Bunch.from( [{rule: this.rules.first(), dp: 0}], (el) => snapHash(el)));
        this.convolute(i0);
        this.assignId(i0);

        this.states = Bunch.from([i0], state => stateHash(state));
        const statesQueue = Bunch.from([i0], state => stateHash(state));

        while(statesQueue.size() > 0){
            const fromState = statesQueue.dequeue();
            const entities = Parser.esByState(fromState);

            entities.forEach(entity => {
                const newState = this.dotShift(fromState, entity);
                if(this.states.has(newState) ){
                    const toState = this.stateByHash(stateHash(newState));
                    this.t.push({fromState: `$${fromState.id}`, by: entity, toState: `$${toState.id}`})
                } else {
                    this.assignId(newState);
                    this.states.push(newState);
                    statesQueue.push(newState);
                    this.t.push({fromState: `$${fromState.id}`, by: entity, toState: `$${newState.id}`});
                }
            });
        }
    }
}

async function main(){
    parseArgs(settings);

    const parser = await Parser.init(settings.rulesFile);
    parser.buildStates();

    console.log("States:");
    parser.states
        .forEach(state => {
            console.log(stateToString(state));
        });

    console.log(parser.t);
}

main();