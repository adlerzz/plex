import { pad } from "../commons/utils.js";
import { DOT_POINT } from "../commons/utils.js";
export class Snap {
    constructor(rule, dp = 0){
        this.rule = rule;
        this.dp = dp;
    }

    static moveDot(snap){
        return new Snap(snap.rule, snap.dp + 1);
    }

    get node() {
        return this.rule.node;
    }

    get seq(){
        return this.rule.seq;
    }
    get pointed(){
        return this.rule.seq.at(this.dp);
    }

    get id(){
        return this.rule.id;
    }

    hash(){
        return `#${this.rule.id}[${this.dp}]`;
    }

    toString(){
        const s = [...this.seq];
        s.splice(this.dp, 0, DOT_POINT);
        return `  #${pad(this.rule.id, 4)} [${pad(this.dp, 2)}] ${this.node.toString()} : ${s.join(" ")}`;
    }
}