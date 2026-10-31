import { pad } from "../commons/utils.js";
import { DOT_POINT } from "../commons/utils.js";

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

    /** @returns {Entity|undefined} the entity right after the dot */
    get pointed(){
        return this.rule.seq.at(this.dp);
    }

    /** @returns {number} */
    get id(){
        return this.rule.id;
    }

    /**
     * @returns {string}
     */
    hash(){
        return `#${this.rule.id}[${this.dp}]`;
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