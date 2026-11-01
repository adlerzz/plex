import Bunch from "../commons/bunch.class.js";
import { Snap } from "./snap.class.js";
import { Entity } from "./entity.class.js";

/**
 * An LR(1) item: a Snap plus a set of lookout symbols.
 */
export class ExtSnap {
    /**
     * @param {Snap} snap
     * @param {Entity|Entity[]} lookouts
     */
    constructor(snap, lookouts = [Entity.ANY]) {
        if (!(snap instanceof Snap)) {
            throw new TypeError("ExtSnap must wrap a Snap instance");
        }
        this.snap = snap;
        this.lookouts = Bunch.from(Array.isArray(lookouts) ? lookouts : [lookouts]);
        this.key = `${snap.key}(${this.lookoutKey()})`;
    }

    /** @returns {Rule} */
    get rule() {
        return this.snap.rule;
    }

    /** @returns {number} */
    get dp() {
        return this.snap.dp;
    }

    /** @returns {Entity} */
    get node() {
        return this.snap.node;
    }

    /** @returns {Entity[]} */
    get seq() {
        return this.snap.seq;
    }

    /** @returns {Entity|undefined} */
    get pointed() {
        return this.snap.pointed;
    }

    /** @returns {number} */
    get id() {
        return this.snap.id;
    }

    /**
     * Move the dot forward, keeping the same lookouts.
     * @param {ExtSnap} extSnap
     * @returns {ExtSnap}
     */
    static moveDot(extSnap) {
        return new ExtSnap(Snap.moveDot(extSnap.snap), extSnap.lookouts.array);
    }

    /**
     * Key of the underlying LR(0) item, without lookouts.
     * @returns {string}
     */
    coreKey() {
        return this.snap.key;
    }

    /**
     * @returns {string}
     */
    lookoutKey() {
        return this.lookouts.array
            .map(entity => entity.name)
            .toSorted()
            .join("|");
    }

    /**
     * Add lookouts from another ExtSnap with the same core.
     * @param {ExtSnap} other
     */
    mergeLookouts(other) {
        if (!(other instanceof ExtSnap)) {
            throw new TypeError("mergeLookouts expects an ExtSnap instance");
        }
        this.lookouts.merge(other.lookouts);
        this.key = `${this.coreKey()}(${this.lookoutKey()})`;
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.snap.toString()} / ${this.lookoutKey()}`;
    }
}
