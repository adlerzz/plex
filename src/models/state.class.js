import Bunch from "../commons/bunch.class.js";
import { Entity } from "./entity.class.js";
import { ExtSnap } from "./ext-snap.class.js";

/**
 * A state in the LR automaton. It is a set of ExtSnaps.
 * The key is built from the cores of the items, so the key does not depend on lookouts.
 */
export class State {
    static counter = 0;

    constructor(){
        this._snaps = Bunch.empty();
        this.key = "";
        this.id = null;
    }

    /** @returns {Bunch<ExtSnap>} */
    get snaps() {
        return this._snaps;
    }

    /** @param {Bunch<ExtSnap>} value */
    set snaps(value) {
        this._snaps = value;
        this.key = this._snaps
            .map(extSnap => extSnap.coreKey()).array
            .toSorted()
            .join(",");
    }

    /** Give this state a unique id. */
    assignId(){
        this.id = State.counter++;
    }

    /**
     * Make a State from a Bunch of Snaps.
     * @param {Bunch<Snap>} snaps
     * @returns {State}
     */
    static prepare(snaps){
        const prepared = new State();
        prepared.snaps = Bunch.from(snaps);
        return prepared;
    }

    /**
     * Get snaps whose pointed entity matches the given entity.
     * @param {Entity} entity
     * @returns {Bunch<Snap>}
     */
    snapsByEntity(entity){
        return this.snaps
            .filter(snap => Entity.equals(snap.pointed, entity))
    }

    /**
     * Get all distinct entities that appear right after a dot.
     * @returns {Bunch<Entity>}
     */
    pointedEntities(){
        return this.snaps
            .map(snap => snap.pointed)
            .filter(entity => entity !== Entity.NONE)
            .unique();
    }

    /**
     * @returns {string}
     */
    toString(){
        return `$${this.id ?? "[]"}\n` + this.snaps.array
            .toSorted( (s1,s2) => s1.rule.id - s2.rule.id)
            .map(snap => snap.toString())
            .join("\n") + "\n.";
    }
}
