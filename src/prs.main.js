import Bunch from "./commons/bunch.class.js";
import { Entity } from "./models/entity.class.js";
import { Rule } from "./models/rule.class.js";
import { Snap } from "./models/snap.class.js";
import { State } from "./models/state.class.js";
import { parseArgs, writeAsJSON } from "./commons/utils.js";

const settings = {
    rulesFile: '../resources/prs.rules.js',
    inputFile: '../resources/input.txt',
    outputfile: '../resources/output.json',
};

const Action = {
    LEAD: "LEAD",
    MOVE: "MOVE",
    FOLD: "FOLD",
}

class Parser {
    constructor() {
        this.rules = Bunch.empty();
        this.nodes = Bunch.empty();
        this.entities = Bunch.empty();
        this.states = Bunch.empty();
        this.statesCount = 0;
        this.table = [];
    }

    async parseRules(rulesFile) {
        const { default: rules } = await import(`./${rulesFile}`);
        const rulesList = Object
            .entries(rules)
            .flatMap(([node, rules]) => rules
                .map(rule => ({ node, seq: rule.split(" ") }))
            );
        const firstRule = { node: Entity.FIRST.name, seq: [rulesList[0].node] };

        this.entities.add(...[firstRule, ...rulesList]
            .flatMap(({ node, seq }) => [node, ...seq])
            .map(e => new Entity(e)));

        const enumed = [firstRule, ...rulesList]
            .map(({ node, seq }, id) =>
                new Rule(id, this.entities.findByHash(node), seq.map(e => this.entities.findByHash(e)))
            );
        this.rules.push(...enumed);
    }

    extractNodes() {
        this.rules
            .map(rule => rule.node)
            .forEach(node => {
                const e = this.entities.findByHash(node.hash());
                e.markAsNode();
                this.nodes.add(e);
            });
    }

    static async init(rulesFile) {
        const instance = new Parser();
        await instance.parseRules(rulesFile);
        instance.extractNodes();
        return instance;
    }

    assignId(state) {
        state.id = this.statesCount++;
    }

    getNodedSnaps(node) {
        return this.rules
            .filter(rule => rule.node.name === node?.name)
            .map(rule => new Snap(rule))
            .unique();
    }

    ngen(snaps) {
        return snaps
            .flatMap(snap => this.getNodedSnaps(snap.pointed).asArray())
            .unique();
    }

    convolute(state) {
        let size;
        do {
            const toAdd = this.ngen(state.snaps);
            size = state.snaps.merge(toAdd);
        } while (size !== 0);
    }

    getStateSnapsWithPointedEntity(state, entity) {
        return state.snaps
            .filter(snap => snap.seq.at(snap.dp)?.name === entity?.name)
    }

    moveDots(state, entity) {
        const pass = this.getStateSnapsWithPointedEntity(state, entity);
        const newSnaps = pass.map(snap => Snap.moveDot(snap));
        const iN = State.prepare(newSnaps);
        this.convolute(iN);
        return iN;
    }

    buildAutomat() {
        const i0 = State.prepare(Bunch.from([new Snap(this.rules.first())]));
        this.convolute(i0);
        this.assignId(i0);

        this.states = Bunch.from([i0]);
        const statesQueue = Bunch.from([i0]);

        while (statesQueue.size() > 0) {
            const fromState = statesQueue.dequeue();
            const entities = fromState.pointedEntities();

            entities.forEach(entity => {
                let toState = this.moveDots(fromState, entity);
                if (this.states.has(toState)) {
                    toState = this.states.findByHash(toState.hash());
                } else {
                    this.assignId(toState);
                    this.states.push(toState);
                    statesQueue.push(toState);
                }
                this.table.push({
                    from: fromState.id,
                    by: entity.toString(),
                    to: toState.id,
                    sa: entity.isNode ? Action.LEAD : Action.MOVE
                });
            });
        }

        this.states.forEach(state => state.snaps
            .filter(snap => !snap.pointed)
            .forEach(snap => {
                this.table.push({
                    from: state.id,
                    by: Entity.ANY.toString(),
                    to: snap.rule.id,
                    sa: Action.FOLD
                })
            })
        );
    }

    get json() {
        return {
            entities: this.entities.asArray(),
            rule: this.rules.map(({id, node, seq}) => ({id, node: node.name, seq: seq.map(e => e.name) })).asArray(),
            table: this.table,
        }
    }
}

async function main() {
    parseArgs(settings);

    const parser = await Parser.init(settings.rulesFile);
    parser.buildAutomat();

    console.log("entities", parser.entities.toString());
    parser.table.forEach(({ from, by, sa, to }) =>
        console.log(`$${from} . ${by.padEnd(6, ' ')} -> ${sa} ${sa === Action.FOLD ? '#' : '$'}${to}`)
    );
    console.log("rules", parser.rules.toString());

    await writeAsJSON(settings.outputfile, parser.json);
}

main();