import Bunch from "../commons/bunch.class.js";

/**
 * A state in the LR automaton. It is a set of Snaps.
 */
export class State {
    static counter = 0;

    constructor(){
        this.snaps = Bunch.empty();
        this.id = null;
    }

    /** Give this state a unique id. */
    assignId(){
        this.id = State.counter++;
    }

    /**
     * @returns {string}
     */
    hash(){
        return this.snaps
            .map(snap => snap.hash()).array
            .toSorted()
            .join(",")
    }

    /**
     * Make a State from a Bunch of Snaps.
     * @param {Bunch<Snap>} snaps
     * @returns {State}
     */
    static prepare(snaps){
        const prepared = new State();
        snaps.forEach(snap => prepared.snaps.push(snap));
        return prepared;
    }

    /**
     * Get snaps whose pointed entity matches the given entity.
     * @param {Entity} entity
     * @returns {Bunch<Snap>}
     */
    snapsByEntity(entity){
        return this.snaps
            .filter(snap => snap.seq.at(snap.dp).id === entity.id)
    }

    /**
     * Get all distinct entities that appear right after a dot.
     * @returns {Bunch<Entity>}
     */
    pointedEntities(){
        return this.snaps
            .map(snap => snap.seq?.[snap.dp])
            .filter(Boolean)
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
