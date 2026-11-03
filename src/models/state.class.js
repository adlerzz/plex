import Bunch from "../commons/bunch.class.js";
import { Entity } from "./entity.class.js";

/**
 * A state in the LR automaton. It is a set of Snaps.
 */
export class State {
    static counter = 0;

    constructor(){
        this._snaps = Bunch.empty();
        this.key = "";
        this.id = null;
    }

    /** @returns {Bunch<Snap>} */
    get snaps() {
        return this._snaps;
    }

    /** @param {Bunch<Snap>} value */
    set snaps(value) {
        this._snaps = value;
        this.key = this._snaps
            .map(snap => snap.key).array
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
            .filter(snap => snap.pointed.id === entity.id)
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
