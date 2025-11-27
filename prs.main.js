import fs from "node:fs/promises";
import Bunch from "./commons/bunch.class.js";
import {Entity} from "./models/entity.class.js";
import {Rule} from "./models/rule.class.js";
import {Snap} from "./models/snap.class.js";
import {State} from "./models/state.class.js";
import {parseArgs} from "./commons/utils.js";

const settings = {
    rulesFile: 'prs.rules.js',
    inputFile: 'input.txt',
    outputfile: 'output.json',
};

class Parser{
    constructor() {
        this.rules = Bunch.empty();
        this.nodes = Bunch.empty();
        this.entities = Bunch.empty();
        this.states = Bunch.empty();
        this.statesCount = 0;
        this.table = [];
    }

    async parseRules(rulesFile){
        const { default: rules } = await import(`./${rulesFile}`);
        const rulesList = Object
            .entries(rules)
            .flatMap(([node, rules]) => rules
                .map(rule => ({ node, seq: rule.split(" ") }))
            );
        const firstRule = { node: Entity.FIRST, seq: [rulesList[0].node] };
        
        this.entities.add(...[firstRule, ...rulesList]
            .flatMap( ({node, seq}) => [node, ...seq])
            .map(e => new Entity(e)));

        const enumed = [firstRule, ...rulesList]
            .map(({node, seq}, id) => 
                new Rule(id, this.entities.findByHash(node), seq.map(e => this.entities.findByHash(e)))
            );
        this.rules.push(...enumed);
    }

    extractNodes(){
        this.rules
            .map(rule => rule.node)
            .forEach(node => {
                const e = this.entities.findByHash(node.hash());
                e.markAsNode();
                this.nodes.add(e);
            });
        console.log("entities", this.entities.toString());
        console.log("nodes", this.nodes.toString());
        console.log("rules", this.rules.toString());
    }

    static async init(rulesFile){
        const instance = new Parser();
        await instance.parseRules(rulesFile);
        instance.extractNodes();
        return instance;
    }

    assignId(state){
        state.id = this.statesCount++;
    }

    getNodedSnaps(node){
        return this.rules
            .filter( rule => rule.node.name === node?.name)
            .map(rule => new Snap(rule))
            .unique();
    }

    ngen(snaps) {
        return snaps
            .flatMap(snap => this.getNodedSnaps(snap.pointed).asArray() )
            .unique();
    }

    convolute(state) {
        let size;
        do {
            const toAdd = this.ngen(state.snaps);
            size = state.snaps.merge(toAdd);
        } while(size !== 0);
    }

    getStateSnapsWithPointedEntity(state, entity){
        return state.snaps
            .filter(snap => snap.seq.at(snap.dp)?.name === entity?.name)
    }

    moveDots(state, entity){
        const pass = this.getStateSnapsWithPointedEntity(state, entity);
        const newSnaps = pass.map(snap => Snap.moveDot(snap));
        const iN = State.prepare(newSnaps);
        this.convolute(iN);
        return iN;
    }

    buildAutomat(){
        const i0 = State.prepare( Bunch.from( [new Snap(this.rules.first())] ));
        this.convolute(i0);
        this.assignId(i0);

        this.states = Bunch.from([i0]);
        const statesQueue = Bunch.from([i0]);

        while(statesQueue.size() > 0){
            const fromState = statesQueue.dequeue();
            const entities = fromState.pointedEntities();

            entities.forEach(entity => {
                let toState = this.moveDots(fromState, entity);
                if(this.states.has(toState) ){
                    toState = this.states.findByHash(toState.hash());
                } else {
                    this.assignId(toState);
                    this.states.push(toState);
                    statesQueue.push(toState);
                }
                this.table.push({
                    from: fromState, 
                    by: entity, 
                    to: toState, 
                    sa: entity.isNode ? 'LEAD' : 'MOVE'
                });
            });
        }

        /**/
        this.table.push(
            ...this.states
                .flatMap(state => 
                    state.snaps
                        .filter(snap => !snap.pointed)
                        .map(snap => ({
                            from: state,
                            by: Entity.ANY,
                            to: snap,
                            sa: "FOLD"
                        }))
                        .asArray()
                    )
                .asArray()
        )
        /**/
    }

}

async function main(){
    parseArgs(settings);

    const parser = await Parser.init(settings.rulesFile);
    parser.buildAutomat();

    console.log("States:", parser.states.toString());
    /*parser.states.forEach(state => {
        console.log(state.toString());
    });*/

    const table = parser.table.map( ({from, by, sa, to}) => ({
        from: `$${from.id}`, 
        by: `${by.toString()}`, 
        action: `${sa}`, 
        to:`${by === Entity.ANY ? '#' : '$'}${to.id}`
    }));
    console.log(table);
    
    await fs.writeFile(settings.outputfile, JSON.stringify(table, null, 2), 'utf-8');
}

main();