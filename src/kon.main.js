import { readAsJSON,  writeAsText } from "./commons/filesys.js";
import { parseArgs } from "./commons/utils.js";

const settings = {
    parserFile: 'prs.output.json',
    tokensFile: 'lex.output.json',
    outputfile: 'output.text',
};

async function main() {
    parseArgs(settings);

    const parser = await readAsJSON(settings.parserFile);
    const p = parser.table.map( ({from, by, to, sa}) => {

        console.log(`${from} ${by} ${sa} ${to}`);

        return [`${from} ${by}`, [sa, +to]];
    });

    const a = Object.fromEntries(p);
    console.log(a);
    
    const states = [0];
    const tokens = [];
    
    const input = await readAsJSON(settings.tokensFile);
    let i = 0;

    do{
        const s = states.at(-1);
        const c = input.at(i);        
        const [action, to] = a[`${s} ${c?.type}`] ?? a[`${s} ...`];

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
                const foldArgs = [];
                rule.seq.forEach(() => {
                    states.pop();
                    foldArgs.push(tokens.pop());
                });
                const [, pto] = a[`${states.at(-1)} ${rule.node}`];
                const fold = rule.fold 
                    ? parseFold(rule.fold) 
                    : defaultFold;
                foldArgs.reverse();
                tokens.push({token: rule.node, value: fold(foldArgs) });
                console.log("newValue", foldArgs, ">>",  fold(foldArgs));
                states.push(pto);
            }
        }
        console.log({states, tokens});
        
    }while(states.length > 1);

    writeAsText(settings.outputfile, tokens.at(0).value.toString());
}

function parseFold(foldRule){
    return new Function("$rawfoldargs$", "const $values$ = $rawfoldargs$.map($rawfoldarg$ => $rawfoldarg$.value); return (" + foldRule + ")($values$, $rawfoldargs$)");
}

function defaultFold(foldArgs) {
    return foldArgs.map(foldArg => foldArg.value);
}

main();