export class Rule {
    constructor(id, node, seq, fold){
        this.id = id;
        this.node = node;
        this.seq = seq;
        this.fold = fold
    }

    hash(){
        return this.id;
    }
    toString(){
        return `#${this.id} ${this.node.toString()}: ${this.seq.join(" ")}`;
    }
}
