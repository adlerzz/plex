import {Entity} from "./entity.class.js";
export class Rule {
    constructor(id, node, seq){
        this.id = id;
        this.node = node;
        this.seq = seq;
    }

    hash(){
        return this.id;
    }
    toString(){
        return `#${this.id} ${this.node.toString()}: ${this.seq.join(" ")}`;
    }
}
