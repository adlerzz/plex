import Bunch from "../commons/bunch.class.js";
import {Name} from "./name.class.js"
/**
 * A grammar symbol. It can be a terminal or a non-terminal.
 */
export class Entity {
    /**
     * @param {string} name
     * @param {boolean} isNode - true if this is a non-terminal
     */
    constructor(name, isNode = false){
        this.name = new Name(name);
        this.isNode = isNode;
        this.key = name;
        this._canVanish = false;
        this.initials = Bunch.empty();
    }

    /**
     * A terminal never vanishes. A non-terminal can vanish if some rule of it
     * produces the empty string. The flag is set by computeInitials().
     * @returns {boolean}
     */
    get canVanish(){
        return this.isNode && this._canVanish === true;
    }

    /** @param {boolean} value */
    set canVanish(value){
        this._canVanish = value;
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
    /** The null placeholder for "no entity after the dot". */
    static NONE = new Entity("$$$");
    /** The end-of-input marker. */
    static EOF = new Entity("$");

    static equals(a, b) {
        return a?.key === b?.key;
    }

    /**
     * @returns {string}
     */
    toString(){
        const [l, r] = this.isNode ? "<>" : "''";
        return `${l}${this.name}${r}`;
    }
}

