import { pad } from "../commons/utils.js";
import { DOT_POINT } from "../commons/utils.js";
import { Entity } from "./entity.class.js";

/**
 * An LR(0) item: a Rule with a dot position.
 */
export class Snap {
    /**
     * @param {Rule} rule
     * @param {number} dp - dot position
     */
    constructor(rule, dp = 0){
        this.rule = rule;
        this.dp = dp;
        this.key = `#${rule.id}[${dp}]`;
    }

    /**
     * Move the dot one step forward.
     * @param {Snap} snap
     * @returns {Snap}
     */
    static moveDot(snap){
        return new Snap(snap.rule, snap.dp + 1);
    }

    /** @returns {Entity} */
    get node() {
        return this.rule.node;
    }

    /** @returns {Entity[]} */
    get seq(){
        return this.rule.seq;
    }

    /** @returns {Entity} the entity right after the dot, or Entity.NONE if the dot is at the end */
    get pointed(){
        return this.rule.seq.at(this.dp) ?? Entity.NONE;
    }

    /** @returns {number} */
    get id(){
        return this.rule.id;
    }

    /**
     * @returns {string}
     */
    toString(){
        const s = [...this.seq];
        s.splice(this.dp, 0, DOT_POINT);
        return `  #${pad(this.rule.id, 4)} [${pad(this.dp, 2)}] ${this.node.toString()} : ${s.join(" ")}`;
    }
}