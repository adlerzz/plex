/**
 * A set-like collection of items that are identified by their hash() value.
 * It can also behave like an array.
 */
export default class Bunch {
    /**
     * @param {Array|undefined} init - initial items
     */
    constructor(init){
        this.data = [...(init ?? [])];
    }

    /**
     * Make a Bunch from an array.
     * @param {Array} init
     * @returns {Bunch}
     */
    static from(init){
        if(Array.isArray(init)){
            return new Bunch(init);
        }
    }

    /**
     * Make an empty Bunch.
     * @returns {Bunch}
     */
    static empty(){
        return new Bunch([]);
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
     * Get the first item.
     * @returns {*}
     */
    first(){
        return this.data.at(0);
    }

    /**
     * Add items if their hash is not already present.
     * @param {...*} elements
     */
    add(...elements) {
        elements.forEach(element => {
            if(this.data.find(el => element.hash() === el.hash())){
                return;
            }
            this.data.push(element);
        })
    }

    /**
     * Check if an item with the same hash is present.
     * @param {*} element
     * @returns {boolean}
     */
    has(element) {
        return !!this.data.find( el => element.hash() === el.hash() );
    }

    /**
     * Push items to the end without checking for duplicates.
     * @param {...*} elements
     */
    push(...elements) {
        this.data.push(...elements);
    }

    /**
     * Remove and return the first item.
     * @returns {*}
     */
    dequeue(){
        return this.data.shift();
    }

    /**
     * Remove and return the last item.
     * @returns {*}
     */
    pop(){
        return this.data.pop();
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
     * Find an item by its hash value.
     * @param {string|number} hash
     * @returns {*}
     */
    findByHash(hash){
        return this.data.find(it => it.hash() === hash);
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
            this.data.flatMap(el => f(el))
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