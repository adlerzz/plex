import Bunch from "../commons/bunch.class.js";

export class State {
    constructor(){
        this.snaps = new Bunch([]);
        this.id = null;
    }

    hash(){
        return this.snaps.asArray()
            .map(snap => snap.hash())    
            .toSorted()
            .join(",")
    }

    static prepare(snaps){
        const prepared = new State();
        snaps.forEach(snap => prepared.snaps.push(snap));
        return prepared;
    }

    snapsByEntity(entity){
        return this.snaps
            .filter(snap => snap.seq.at(snap.dp).id === entity.id)
    }

    pointedEntities(){
        return this.snaps
            .map(snap => snap.seq?.[snap.dp])
            .filter(Boolean)
            .unique();
    }

    toString(){
        return `$${this.id ?? "[]"}\n` + this.snaps.asArray()
            .toSorted( (s1,s2) => s1.rule.id - s2.rule.id)
            .map(snap => snap.toString())
            .join("\n") + "\n.";
    }
}
