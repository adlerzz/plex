/**
 * A grammar production: node -> seq.
 */
export class Rule {
    /**
     * @param {number} id
     * @param {Entity} node - left side of the rule
     * @param {Entity[]} seq - right side of the rule
     * @param {Function|null} callback - semantic action
     */
    constructor(id, node, seq, callback){
        this.id = id;
        this.node = node;
        this.seq = seq;
        this.callback = callback;
        this.key = id;
    }

    /**
     * @returns {string}
     */
    toString(){
        return `#${this.id} ${this.node.toString()}: ${this.seq.join(" ")}`;
    }
}
