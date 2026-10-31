/**
 * A grammar symbol. It can be a terminal or a non-terminal.
 */
export class Entity {
    /**
     * @param {string} name
     * @param {boolean} isNode - true if this is a non-terminal
     */
    constructor(name, isNode = false){
        this.name = name;
        this.isNode = isNode;
    }

    /**
     * Mark this entity as a non-terminal node.
     */
    markAsNode(){
        this.isNode = true;
    }

    /** The augmented start symbol. */
    static FIRST = new Entity("^^", true);
    /** The wildcard symbol used for reduce actions. */
    static ANY = new Entity("...");
    /** The empty (epsilon) symbol. */
    static EMPTY = new Entity("$$");

    /**
     * @returns {string}
     */
    hash(){
        return this.name;
    }

    /**
     * @returns {string}
     */
    toString(){
        return this.isNode ? `<${this.name}>` : `'${this.name}'`;
    }
}

