import Bunch from "./commons/bunch.class.js";
import { Entity } from "./models/entity.class.js";
import { Rule } from "./models/rule.class.js";
import { Snap } from "./models/snap.class.js";
import { ExtSnap } from "./models/ext-snap.class.js";
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
    ACCEPT: "ACCEPT",
    ERROR: "ERROR",
}

/**
 * Builds an LR(0) automaton from grammar rules.
 */
export class Parser {
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
        const firstRule = { node: Entity.FIRST.key, seq: [rulesList[0].node] };

        this.entities.add(Entity.EMPTY, ...[firstRule, ...rulesList]
            .flatMap(({ node, seq }) => [node, ...seq])
            .map(e => new Entity(e)));

        const enumed = [firstRule, ...rulesList]
            .map(({ node: nodeKey, seq, callback }, id) => {
                const aNode = this.entities.findByKey(nodeKey);
                const seqRule = seq
                    .map(e => this.entities.findByKey(e))
                    .filter(e => !Entity.equals(e, Entity.EMPTY))
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
        instance.computeInitials();
        return instance;
    }

    /**
     * Compute initials for all grammar entities and build the canVanish flags.
     * Must be called after extractNodes().
     *
     * The initials live on the entities and grow in place for the whole fixed point,
     * so a single Bunch per entity is the only source of truth. A terminal starts
     * itself, a non-terminal starts with an empty Bunch.
     */
    computeInitials() {
        this.entities.forEach(entity => {
            entity.canVanish = false;
            entity.initials = entity.isNode ? Bunch.empty() : Bunch.from([entity]);
        });

        let changed;
        do {
            changed = 0;
            this.rules.forEach(rule => {
                changed += rule.node.initials.merge(this.seqInitials(rule.seq));

                if (this.seqCanVanish(rule.seq) && !rule.node.canVanish) {
                    rule.node.canVanish = true;
                    changed++;
                }
            });
        } while (changed !== 0);
    }

    /**
     * Initials of a sequence, without the vanishing case.
     * Stops at the first symbol that cannot produce the empty string.
     * Entity.EMPTY is skipped: it stands for the empty string.
     * @param {Bunch<Entity>|Entity[]} seq
     * @returns {Bunch<Entity>}
     */
    seqInitials(seq) {
        const result = Bunch.empty();

        for (const symbol of seq) {
            if (symbol === Entity.EMPTY) {
                continue;
            }

            result.merge(symbol.initials);

            if (!symbol.canVanish) {
                break;
            }
        }

        return result;
    }

    /**
     * Check if a sequence can produce the empty string.
     * @param {Bunch<Entity>} seq
     * @returns {boolean}
     */
    seqCanVanish(seq) {
        return seq.every(symbol => symbol === Entity.EMPTY || symbol.canVanish);
    }

    /**
     * Initials of a sequence. If the whole sequence can vanish, add lookouts.
     * @param {Bunch<Entity>|Entity[]} seq
     * @param {Bunch<Entity>|Entity[]} [lookouts]
     * @returns {Bunch<Entity>}
     */
    initials(seq, lookouts) {
        const result = this.seqInitials(seq);

        if (this.seqCanVanish(seq)) {
            result.merge(Bunch.from(lookouts ?? []));
        }

        return result;
    }

    /**
     * Build a Bunch of real entities from their names.
     * Names that are not in the grammar give undefined items.
     * @param {string[]} names
     * @returns {Bunch<Entity>}
     */
    entitiesByName(names) {
        return Bunch.from(names.map(name => this.entities.findByKey(name)));
    }

    /**
     * Get new LR items for all rules of a non-terminal node.
     * In the LR(0) mode every item carries the same lookout, Entity.ANY.
     * @param {Entity} node
     * @returns {Bunch<ExtSnap>}
     */
    getNodedSnaps(node) {
        return this.rules
            .filter(rule => Entity.equals(rule.node, node))
            .map(rule => new ExtSnap(new Snap(rule), Bunch.from([Entity.ANY])))
            .unique();
    }

    /**
     * Generate new LR items for non-terminals pointed to by the given snaps.
     * @param {Bunch<ExtSnap>} snaps
     * @returns {Bunch<ExtSnap>}
     */
    ngen(snaps) {
        return snaps
            .flatMap(extSnap => extSnap.pointed.isNode
                ? this.getNodedSnaps(extSnap.pointed)
                : Bunch.empty()
            )
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
            const merged = Bunch.from(state.snaps);
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
            .filter(snap => Entity.equals(snap.pointed, entity))
    }

    /**
     * Build the next state by moving dots over the given entity and closing.
     * @param {State} state
     * @param {Entity} entity
     * @returns {State}
     */
    moveDots(state, entity) {
        const pass = this.getStateSnapsWithPointedEntity(state, entity);
        const newSnaps = pass.map(extSnap => ExtSnap.moveDot(extSnap));
        const iN = State.prepare(newSnaps);
        this.convolute(iN);
        return iN;
    }

    /**
     * Build all LR(0) states and the parsing table.
     */
    buildAutomat() {
        const i0 = State.prepare(Bunch.from([
            new ExtSnap(new Snap(this.rules.first()), Bunch.from([Entity.ANY]))
        ]));
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
                    by: entity.key,
                    to: toState.id,
                    sa: entity.isNode ? Action.LEAD : Action.MOVE
                });
            });
        }

        this.states.forEach(state => state.snaps
            .filter(snap => Entity.equals(snap.pointed, Entity.NONE))
            .forEach(snap => {
                const accept = Entity.equals(snap.rule.node, Entity.FIRST);
                this.table.push({
                    from: state.id,
                    by: Entity.ANY.key,
                    to: accept ? 0 : snap.rule.id,
                    sa: accept ? Action.ACCEPT : Action.FOLD
                });
            })
        );
    }

    /**
     * Serialize the automaton as a JavaScript module string.
     * @returns {string}
     */
    serialize() {
        const entities = "[\n    " + this.entities.array
            .map(entity => compact({
                name: entity.name,
                isNode: entity.isNode,
                key: entity.key,
                canVanish: entity.canVanish,
                initials: entity.initials.array.map(initial => initial.name),
            }))
            .join(",\n    ") + "\n  ]";
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
        console.log(`$${from} . ${by.padEnd(8, ' ')} -> ${sa} ${sa === Action.FOLD ? '#' : '$'}${to}`)
    );
    console.log("rules", parser.rules.toString());

    
}

main();