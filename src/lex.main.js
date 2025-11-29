import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readAsText, writeAsJSON, writeAsText } from './commons/filesys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const settings = {
    rulesFile: 'lex.rules.js',
    inputFile: 'lex.input.txt',
    outputfile: 'lex.output.json',
};

function parseArgs(defaultSettings) {
    process.argv.forEach(part => {
        const [param, ...chunks] = part.split('=');
        const value = chunks.join('=') ?? false;
        defaultSettings[param] = value;
    })
}

const isRegExp = (value) => value instanceof RegExp;
const isString = (value) => typeof value === 'string';
const isArray  = (value) => Array.isArray(value);

function match(text, rule) {
    if(rule.re){
        const found = text.match(rule.re);
        if (found?.index === 0) {
            const raw = found[0];
            const value = rule.callback(raw);
            return ({
                type: rule.type,
                raw,
                length: raw.length,
                value,
            })
        }
    }
    if(rule.substr){
        const index = text.indexOf(rule.substr);
        if (index === 0) {
            const str = rule.substr;
            return ({
                type: rule.type,
                raw: str,
                length: str.length,
                value: str
            })
        }
    }
    return null;
}

async function parseRules(rulesFile){
    const {default: rules} = await import(`../resources/${rulesFile}`);
    return Object.entries(rules).map( ([type, value]) => ({
        type,
        re: isRegExp(value) ? value : (isArray(value) && isRegExp(value[0]) ? value[0]: null),
        substr: isString(value) ? value : null,
        callback: value?.[1] ?? (_ => _),  
    }));
}

function tokenize(text, rules) {
    const tokens = [];
    let restText = text;
    while (restText !== '') {
        for(const rule of rules){
            const m = match(restText, rule);
            if (!m) {
                continue;
            }
            if(m.value !== null){
                tokens.push(m);
            }
            restText = restText.slice(m.length);
            break;
        }
    }
    return tokens;
}

async function main() {

    console.log(__dirname);
    parseArgs(settings);

    const extRules = await parseRules(settings.rulesFile);
    console.log(extRules);

    const text = await readAsText(settings.inputFile, 'utf-8');
    const tokens = tokenize(text, extRules);
    
    console.log(tokens);

    writeAsJSON(settings.outputfile, tokens);
    writeAsText("lex.tokens.txt", tokens.map(it => `{${it.type}:${it.value}}`).join(""))

};

main();