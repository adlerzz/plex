import { importDefault, readAsJSON, writeAsJSON, writeAsText } from "./commons/filesys.js";
import { parseArgs } from "./commons/utils.js";
import * as Act from "./actions.js";

const settings = {
    parserFile: 'parser.compiled.js',
    tokensFile: 'tokens.json',
    outputfile: 'output.text',
};

async function main() {
    parseArgs(settings);

    const parser = await importDefault(settings.parserFile);
    const p = parser.table.map( ({from, by, to, sa}) => {

        console.log(`${from} ${by} ${sa} ${to}`);

        return [`${from} ${by}`, [sa, +to]];
    });

    const a = Object.fromEntries(p);
    console.log(a);
    writeAsJSON("table.json", a);

    const input = await readAsJSON(settings.tokensFile);
    const s = runAutomat(input, a, parser.rules);

    writeAsText(settings.outputfile, s.value.toString());
}

/**
 * Run the LR parser over the token stream.
 * @param {Object[]} input
 * @param {Object} table - action table keyed by "state symbol"
 * @param {Object[]} rules
 * @returns {Object} final token with value
 */
function runAutomat(input, table, rules){
    const states = [0];
    const tokens = [];
    let i = 0;
    do{
        const s = states.at(-1);
        const c = input.at(i);        
        const [action, to] = table[`${s} ${c?.type}`] ?? table[`${s} ...`];

        if(action === 'FOLD' && to === 0){
            console.log("accept");
            break;
        }

        console.log([action, to]);

        switch(action){
            case 'MOVE': {
                states.push(to);
                tokens.push(c);
                i++;
            } break;

            case 'FOLD': {
                const rule = rules[to];
                const foldArgs = [];
                rule.seq.forEach(() => {
                    states.pop();
                    foldArgs.push(tokens.pop());
                });
                const [, pto] = table[`${states.at(-1)} ${rule.node}`];
                const values = foldArgs.reverse().map(arg => arg.value);
                const value = rule.callback ? rule.callback(values, Act) : values;
                tokens.push({token: rule.node, value});
                states.push(pto);
            }
        }
        console.log({states, tokens});
        
    }while(states.length > 1);

    return tokens.at(0);

}

main();