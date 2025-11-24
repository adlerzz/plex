export default class Bunch {
    constructor(init, fhash){
        this.data = [...(init ?? [])];
        this.fhash = fhash ?? (_ => _);
    }

    static from(init, fhash){
        if(Array.isArray(init)){
            return new Bunch(init, fhash);
        }
    }

    static empty(){
        return new Bunch([]);
    }

    setId(fhash){
        this.fhash = fhash;
    }

    at(i){
        return this.data.at(i);
    }

    add(element) {
        if(this.data.find(el => this.fhash(element) === this.fhash(el))){
            return;
        }
        this.data.push(element);
    }

    has(element) {
        return this.data.includes(element);
    }

    merge(added) {
        const before = this.data.length;
        added.asArray().forEach( el => this.add(el));
        return this.data.length - before;
    }

    filter(cond) {
        return Bunch.from(this.data.filter(el => cond(el)), this.fhash);
    }

    map(f) {
        return Bunch.from(this.data.map((el, index) => f(el, index)), this.fhash);
    }

    flatMap(f){
        return Bunch.from(this.data.flatMap(el => f(el)), this.fhash);
    }

    forEach(f) {
        this.data.forEach((el, index) => f(el, index));
    }

    unique() {
        return Bunch.from(Array.from(new Set(this.data)), this.fhash);
    }

    asArray() {
        return this.data;
    }

    size() {
        return this.data.length;
    }

}