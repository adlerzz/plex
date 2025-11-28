export default class Bunch {
    constructor(init){
        this.data = [...(init ?? [])];
    }

    static from(init){
        if(Array.isArray(init)){
            return new Bunch(init);
        }
    }

    static empty(){
        return new Bunch([]);
    }

    at(i){
        return this.data.at(i);
    }

    first(){
        return this.data.at(0);
    }

    add(...elements) {
        elements.forEach(element => {
            if(this.data.find(el => element.hash() === el.hash())){
                return;
            }
            this.data.push(element);
        })
        
    }

    has(element) {
        return this.data.find( el => element.hash() === el.hash() );
    }

    push(...elements) {
        this.data.push(...elements);
    }

    dequeue(){
        return this.data.shift();
    }

    pop(){
        return this.data.pop();
    }

    merge(added) {
        const before = this.data.length;
        added.forEach( el => this.add(el));
        return this.data.length - before;
    }

    filter(cond) {
        return Bunch.from(
            this.data.filter(el => cond(el))
        );
    }

    findByHash(hash){
        return this.data.find(it => it.hash() === hash);
    }

    map(f) {
        return Bunch.from(
            this.data.map((el, index) => f(el, index))
        );
    }

    flatMap(f){
        return Bunch.from(
            this.data.flatMap(el => f(el))
        );
    }

    forEach(f) {
        this.data.forEach((el, index) => f(el, index));
    }

    unique() {
        const result = Bunch.empty();
        this.data.forEach(it => {
            result.add(it);
        })
        return result;
    }

    asArray() {
        return this.data;
    }

    size() {
        return this.data.length;
    }

    toString(){
        return "[\n" + this.data.map(el => "  " + el.toString()).join(",\n") + "\n]";
    }

}