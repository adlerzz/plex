import Bunch from "../commons/bunch.class.js";
import { Snap } from "./snap.class.js";
import { Entity } from "./entity.class.js";

/**
 * An LR(1) item: a Snap plus a set of lookahead symbols.
 */
export class ExtSnap {
    /**
     * @param {Snap} snap
     * @param {Entity|Entity[]} lookaheads
     */
    constructor(snap, lookaheads = [Entity.ANY]) {
        if (!(snap instanceof Snap)) {
            throw new TypeError("ExtSnap must wrap a Snap instance");
        }
        this.snap = snap;
        this.lookaheads = Bunch.from(Array.isArray(lookaheads) ? lookaheads : [lookaheads]);
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
     * Move the dot forward, keeping the same lookaheads.
     * @param {ExtSnap} extSnap
     * @returns {ExtSnap}
     */
    static moveDot(extSnap) {
        return new ExtSnap(Snap.moveDot(extSnap.snap), extSnap.lookaheads.array);
    }

    /**
     * Hash of the underlying LR(0) item, without lookaheads.
     * @returns {string}
     */
    coreHash() {
        return this.snap.hash();
    }

    /**
     * @returns {string}
     */
    lookaheadKey() {
        return this.lookaheads.array
            .map(entity => entity.name)
            .toSorted()
            .join("|");
    }

    /**
     * Full hash including lookaheads.
     * @returns {string}
     */
    hash() {
        return `${this.coreHash()}(${this.lookaheadKey()})`;
    }

    /**
     * Add lookaheads from another ExtSnap with the same core.
     * @param {ExtSnap} other
     */
    mergeLookaheads(other) {
        if (!(other instanceof ExtSnap)) {
            throw new TypeError("mergeLookaheads expects an ExtSnap instance");
        }
        this.lookaheads.merge(other.lookaheads);
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.snap.toString()} / ${this.lookaheadKey()}`;
    }
}
