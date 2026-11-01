import Bunch from "./commons/bunch.class.js";
import { Entity } from "./models/entity.class.js";
import { Rule } from "./models/rule.class.js";
import { Snap } from "./models/snap.class.js";
import { State } from "./models/state.class.js";
import { parseArgs, splitByBlanks, compact } from "./commons/utils.js";
import { importDefault, writeAsJSON, writeAsText } from "./commons/filesys.js";

const settings = {
    rulesFile: 'parser.rules.js',
    inputFile: '../resources/input.txt',
    outputfile: 'parser.compiled.js',
};

const Action = {
    LEAD: "LEAD",
    MOVE: "MOVE",
    FOLD: "FOLD",
}

/**
 * Builds an LR(0) automaton from grammar rules.
 */
class Parser {
    constructor() {
        /** @type {Bunch<Rule>} */
        this.rules = Bunch.empty();
        /** @type {Bunch<Entity>} */
        this.nodes = Bunch.empty();
        /** @type {Bunch<Entity>} */
        this.entities = Bunch.empty();
        /** @type {Bunch<State>} */
        this.states = Bunch.empty();
        /** @type {Object[]} */
        this.table = [];
    }

    /**
     * Load grammar rules and build entities and Rule objects.
     * @param {string} rulesFile
     */
    async parseRules(rulesFile) {
        const rules = await importDefault(rulesFile);
        const rulesList = Object
            .entries(rules)
            .flatMap(([node, rules]) => rules
                .map(rule => {
                    const [seq, callback] = Object.entries(rule)?.[0];
                    return {node, seq: splitByBlanks(seq), callback};
                })
            );
        const firstRule = { node: Entity.FIRST.name, seq: [rulesList[0].node] };

        this.entities.add(Entity.EMPTY, ...[firstRule, ...rulesList]
            .flatMap(({ node, seq }) => [node, ...seq])
            .map(e => new Entity(e)));

        const enumed = [firstRule, ...rulesList]
            .map(({ node: nodeKey, seq, callback }, id) => {
                const aNode = this.entities.findByKey(nodeKey);
                const seqRule = seq.map(e => this.entities.findByKey(e)).filter(e => e !== Entity.EMPTY)
                return new Rule(id, aNode, seqRule, callback);
            });
        this.rules.push(...enumed);
    }

    /**
     * Mark non-terminal entities and write a debug rules.json file.
     */
    extractNodes() {
        this.rules
            .map(rule => rule.node)
            .forEach(node => {
                const e = this.entities.findByKey(node.key);
                e.markAsNode();
                this.nodes.add(e);
            });
        writeAsJSON(
            "rules.json", 
            this.rules.map( rule => rule.toString() )
        );
    }

    /**
     * Create a Parser and load its rules.
     * @param {string} rulesFile
     * @returns {Promise<Parser>}
     */
    static async init(rulesFile) {
        const instance = new Parser();
        await instance.parseRules(rulesFile);
        instance.extractNodes();
        return instance;
    }

    /**
     * Get new LR items for all rules of a non-terminal node.
     * @param {Entity} node
     * @returns {Bunch<Snap>}
     */
    getNodedSnaps(node) {
        return this.rules
            .filter(rule => rule.node.name === node?.name)
            .map(rule => new Snap(rule))
            .unique();
    }

    /**
     * Generate new LR items for non-terminals pointed to by the given snaps.
     * @param {Bunch<Snap>} snaps
     * @returns {Bunch<Snap>}
     */
    ngen(snaps) {
        return snaps
            .flatMap(snap => this.getNodedSnaps(snap.pointed).array)
            .unique();
    }

    /**
     * Compute the LR(0) closure of a state.
     * @param {State} state
     */
    convolute(state) {
        let size;
        do {
            const toAdd = this.ngen(state.snaps);
            const merged = Bunch.from(state.snaps.array);
            size = merged.merge(toAdd);
            state.snaps = merged;
        } while (size !== 0);
    }

    /**
     * Get snaps in a state whose pointed entity matches the given entity.
     * @param {State} state
     * @param {Entity} entity
     * @returns {Bunch<Snap>}
     */
    getStateSnapsWithPointedEntity(state, entity) {
        return state.snaps
            .filter(snap => snap.pointed?.name === entity?.name)
    }

    /**
     * Build the next state by moving dots over the given entity and closing.
     * @param {State} state
     * @param {Entity} entity
     * @returns {State}
     */
    moveDots(state, entity) {
        const pass = this.getStateSnapsWithPointedEntity(state, entity);
        const newSnaps = pass.map(snap => Snap.moveDot(snap));
        const iN = State.prepare(newSnaps);
        this.convolute(iN);
        return iN;
    }

    /**
     * Build all LR(0) states and the parsing table.
     */
    buildAutomat() {
        const i0 = State.prepare(Bunch.from([new Snap(this.rules.first())]));
        this.convolute(i0);
        i0.assignId();

        this.states = Bunch.from([i0]);
        const statesQueue = Bunch.from([i0]);

        while (statesQueue.size() > 0) {
            const fromState = statesQueue.dequeue();
            const entities = fromState.pointedEntities();

            entities.forEach(entity => {
                let toState = this.moveDots(fromState, entity);
                if (this.states.has(toState)) {
                    toState = this.states.findByKey(toState.key);
                } else {
                    toState.assignId();
                    this.states.push(toState);  // could be 'add'
                    statesQueue.push(toState);  // could be 'add'
                }
                this.table.push({
                    from: fromState.id,
                    by: entity.name,
                    to: toState.id,
                    sa: entity.isNode ? Action.LEAD : Action.MOVE
                });
            });
        }

        this.states.forEach(state => state.snaps
            .filter(snap => snap.pointed === Entity.NONE)
            .forEach(snap => {
                this.table.push({
                    from: state.id,
                    by: Entity.ANY.name,
                    to: snap.rule.id,
                    sa: Action.FOLD
                })
            })
        );
    }

    /**
     * Serialize the automaton as a JavaScript module string.
     * @returns {string}
     */
    serialize() {
        const entities = "[\n    " + this.entities.array.map( entity => compact(entity)).join(",\n    ") + "\n  ]";
        const rules = this.rules.array
            .map(({id, node, seq, callback}) => {
                const seqStr = JSON.stringify(seq.map(e => e.name));
                const callbackStr = callback ? callback.toString() : 'null';
                return `    { id: ${id}, node: ${JSON.stringify(node.name)}, seq: ${seqStr}, callback: ${callbackStr} }`;
            })
            .join(',\n');
        const table = "[\n    " + this.table.map(cell => compact(cell)).join(",\n    ") + "\n  ]";

        return `import * as Act from '../src/actions.js';\nexport default {\n  entities: ${entities},\n  rules: [\n${rules}\n  ],\n  table: ${table}\n};\n`;
    }
}

async function main() {
    parseArgs(settings);

    const parser = await Parser.init(settings.rulesFile);
    parser.buildAutomat();

    await writeAsText(settings.outputfile, parser.serialize());

    console.log("entities", parser.entities.toString());
    parser.table.forEach(({ from, by, sa, to }) =>
        console.log(`$${from} . ${by.padEnd(6, ' ')} -> ${sa} ${sa === Action.FOLD ? '#' : '$'}${to}`)
    );
    console.log("rules", parser.rules.toString());

    
}

main();