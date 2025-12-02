import { readAsJSON, readAsText } from "./commons/filesys.js";
import { parseArgs } from "./commons/utils.js";
import { Entity } from "./models/entity.class.js";

const settings = {
    parserFile: '../resources/prs.output.json',
    inputFile: '../resources/tokens.json',
    outputfile: '../resources/prs.output.json',
};

async function main() {
    parseArgs(settings);

    const parser = await readAsJSON(settings.parserFile);
    // const entities = Object.fromEntries(parser.entities.map( ({name, isNode}) => ([name, isNode])));
    const p = parser.table.map( ({from, by, to, sa}) => {

        console.log(`${from} ${by} ${sa} ${to}`);

        return [`${from} ${by}`, [sa, +to]];
    });

    const a = Object.fromEntries(p);
    console.log(a);
    
    const states = [0];
    const tokens = [];
    
    const input = await readAsJSON(settings.inputFile);
    let i = 0;

    do{
        const s = states.at(-1);
        const c = input.at(i);        
        const [action, to] = a[`${s} ${c?.token}`] ?? a[`${s} ...`];

        if(action === 'FOLD' && to === 0){
            console.log("accept");
            break;
        }

        console.log([action, to]);

        switch(action){
            /*case 'LEAD': {
                states.push(to);
            } break;*/

            case 'MOVE': {
                states.push(to);
                tokens.push(c);
                i++;
            } break;

            case 'FOLD': {
                const rule = parser.rules[to];
                const fold = [];
                rule.seq.forEach(() => {
                    states.pop();
                    fold.push(tokens.pop());
                });
                const [, pto] = a[`${states.at(-1)} ${rule.node}`];
                tokens.push({token: rule.node, value: fold.map( ({value}) => value).join(", ") });
                states.push(pto);
            }
        }
        console.log({states, tokens});
        
    }while(states.length > 1);
}



main();