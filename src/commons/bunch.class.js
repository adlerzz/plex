/**
 * A set-like collection of items that are identified by their key property.
 * It can also behave like an array.
 */
export default class Bunch {
    /**
     * @param {Array|undefined} init - initial items
     */
    constructor(init){
        this.data = [...(init ?? [])];
        this.index = new Map();
        this.data.forEach(el => this.index.set(el.key, el));
    }

    /**
     * Make a Bunch from an array.
     * @param {Array} init
     * @returns {Bunch}
     */
    static from(init){
        if(init == null){
            return undefined;
        }
        if(typeof init[Symbol.iterator] === 'function'){
            return new Bunch([...init]);
        }
    }

    /**
     * Make an empty Bunch.
     * @returns {Bunch}
     */
    static empty(){
        return new Bunch();
    }

    /**
     * Get item at index i.
     * @param {number} i
     * @returns {*}
     */
    at(i){
        return this.data.at(i);
    }

    /**
     * Iterate over items.
     * @returns {Iterator<*>}
     */
    [Symbol.iterator](){
        return this.data[Symbol.iterator]();
    }

    /**
     * Return a new Bunch with items from start to end (exclusive).
     * @param {number} start
     * @param {number} [end]
     * @returns {Bunch}
     */
    slice(start, end){
        return Bunch.from(this.data.slice(start, end));
    }

    /**
     * Get the first item.
     * @returns {*}
     */
    first(){
        return this.data.at(0);
    }

    /**
     * Add items if their key is not already present.
     * @param {...*} elements
     */
    add(...elements) {
        elements.forEach(element => {
            if(this.index.has(element.key)){
                return;
            }
            this.index.set(element.key, element);
            this.data.push(element);
        })
    }

    /**
     * Check if an item with the same key is present.
     * @param {*} element
     * @returns {boolean}
     */
    has(element) {
        return this.index.has(element.key);
    }

    /**
     * Push items to the end without checking for duplicates.
     * @param {...*} elements
     */
    push(...elements) {
        elements.forEach(element => {
            this.index.set(element.key, element);
            this.data.push(element);
        });
    }

    /**
     * Remove and return the first item.
     * @returns {*}
     */
    dequeue(){
        const element = this.data.shift();
        if (element) this.index.delete(element.key);
        return element;
    }

    /**
     * Remove and return the last item.
     * @returns {*}
     */
    pop(){
        const element = this.data.pop();
        if (element) this.index.delete(element.key);
        return element;
    }

    /**
     * Add all items from another Bunch, keeping uniqueness.
     * @param {Bunch} added
     * @returns {number} number of items added
     */
    merge(added) {
        const before = this.data.length;
        added.forEach( el => this.add(el));
        return this.data.length - before;
    }

    /**
     * Keep only items that pass the test.
     * @param {Function} cond
     * @returns {Bunch}
     */
    filter(cond) {
        return Bunch.from(
            this.data.filter(el => cond(el))
        );
    }

    /**
     * Find an item by its key value.
     * @param {string|number} key
     * @returns {*}
     */
    findByKey(key){
        return this.index.get(key);
    }

    /**
     * Make a new Bunch by transforming each item.
     * @param {Function} f
     * @returns {Bunch}
     */
    map(f) {
        return Bunch.from(
            this.data.map((el, index) => f(el, index))
        );
    }

    /**
     * Make a new Bunch by mapping and flattening.
     * @param {Function} f
     * @returns {Bunch}
     */
    flatMap(f){
        return Bunch.from(
            this.data.flatMap(el => [...f(el)])
        );
    }

    /**
     * Run a function for each item.
     * @param {Function} f
     */
    forEach(f) {
        this.data.forEach((el, index) => f(el, index));
    }

    /**
     * Return a new Bunch with duplicates removed.
     * @returns {Bunch}
     */
    unique() {
        const result = Bunch.empty();
        this.data.forEach(it => {
            result.add(it);
        })
        return result;
    }

    /**
     * Get the raw array.
     * @returns {Array}
     */
    get array() {
        return this.data;
    }

    /**
     * Count of items.
     * @returns {number}
     */
    size() {
        return this.data.length;
    }

    /**
     * String representation of the Bunch.
     * @returns {string}
     */
    toString(){
        return "[\n" + this.data.map(el => "  " + el.toString()).join(",\n") + "\n]";
    }
}