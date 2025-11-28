export class Entity {
    constructor(name, isNode = false){
        this.name = name;
        this.isNode = isNode;
    }

    markAsNode(){
        this.isNode = true;
    }

    static FIRST = new Entity("^^", true);
    static ANY = new Entity("...");
    static END = new Entity("$$");

    hash(){
        return this.name;
    }

    toString(){
        return this.isNode ? `<${this.name}>` : `'${this.name}'`;
    }
}

