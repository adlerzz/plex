import fs from "node:fs/promises";
import Bunch from "./bunch.class.js";
import {parseArgs} from "./utils.js";

const settings = {
    rulesFile: 'prs.rules.js',
    inputFile: 'input.txt',
    outputfile: 'output.json',
};

const FIRST_NODE = "'F";

function showDP(snap) {
    const s = [...snap.rule.seq];
    s.splice(snap.dp, 0, "_");
    return s.join(" ");
}

function snapToString(snap){
    return `#${(snap.rule.id + "").padStart(4, '0')} ${snap.rule.node} : ${showDP(snap)}`;
}

function stateToString(state){
    return state.snaps.asArray()
        .toSorted( (s1,s2) => s1.rule.id - s2.rule.id)
        .map(snap => snapToString(snap));
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
        this.statesI = 0;
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

    newState(snaps){
        const id = this.statesI++;
        //console.log({id, snaps: snaps.map(snapToString).asArray().join(",")});
        return { id, snaps };
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

    esByDP(state, dp){
        return state.snaps.map(snap => snap.rule.seq?.[dp]).filter(Boolean).unique();
    }

    doShift(state, entity) {
        // console.log(`C ($${state.id}, ${entity}): `, stateToString(state));
        const snaps = state.snaps
            .filter(snap => snap.rule.seq[snap.dp] === entity)
            .map(snap => ({...snap, dp: snap.dp + 1}))
            .unique();

        const newState = this.newState(snaps);
        this.convolute(newState);
        //this.t.push( {from: stateHash(state), by: entity, to: stateHash(newState)});

        return newState;
    }

    doShifts(state, dp){
        const es = this.esByDP(state, dp);
        const sh = es.map(entity => this.doShift(state, entity));
        return sh;
    }
}

async function main(){
    parseArgs(settings);

    const parser = await Parser.init(settings.rulesFile);
    const i0 = parser.newState( Bunch.from( [{rule: parser.rules.at(0), dp: 0}], (el) => snapHash(el)));
 
    parser.convolute(i0);

    let iprev = Bunch.from([i0], state => stateHash(state));
    parser.states = iprev;
    let i = 0;
    do {
        const inext = iprev.flatMap(it => parser.doShifts(it, i).asArray());
        const hm = parser.states.merge(inext);
        if(hm === 0){
            break;
        }
        iprev = inext; 
        i++;
    } while (true);

    parser.states = parser.states
        .filter(state => state.snaps.size())
        .map( (state, id) => ({...state, id}));

    parser.states
        .forEach( state => {
            console.log(`$${state.id}`);
            console.log( stateToString(state) );
        });
    

}

main();