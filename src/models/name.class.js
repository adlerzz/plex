export class Name {
    constructor(name){
        this.value = name;
    }

    get key() {
        return this.value;
    }

    toString() {
        return this.value;
    }

    toJSON() {
        return this.value;
    }

    [Symbol.toPrimitive](){
        return this.value;
    }
}