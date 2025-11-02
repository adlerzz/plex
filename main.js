import fs from "node:fs/promises";

const settings = {
    rulesFile: 'rules.js',
    inputFile: 'input.txt',
    outputfile: 'output.json',
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
            if(rule.callback === null){
                return null;
            }
            const raw = found[0];
            return ({
                type: rule.type,
                raw,
                length: raw.length,
                value: rule.callback(raw),
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



async function main() {
    parseArgs(settings);

    const {default: rules} = await import(`./${settings.rulesFile}`);
    const extRules = Object.entries(rules).map( ([type, value]) => ({
        type,
        re: isRegExp(value) ? value : (isArray(value) && isRegExp(value[0]) ? value[0]: null),
        substr: isString(value) ? value : null,
        callback: value?.[1] ?? (_ => _),  
    }));

    console.log(extRules);

    const text = await fs.readFile(settings.inputFile, 'utf-8');
    const tokens = [];
    let restText = text;
    while (restText !== '') {
        for(const rule of extRules){
            const m = match(restText, rule);
            if (!m) {
                continue;
            }
            console.log(m);
            tokens.push(m);
            restText = restText.slice(m.length);
        }
    }

    console.log(tokens);
    await fs.writeFile(settings.outputfile, JSON.stringify(tokens, null, 2), 'utf-8');
};

main();