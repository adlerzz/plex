import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { importDefault, readAsText, writeAsJSON, writeAsText } from './commons/filesys.js';
import { isRegExp, isArray, isString } from './commons/utils.js';
import * as Act from "./actions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const settings = {
    inputFile: 'input.txt',
    rulesFile: 'lexer.rules.js',
    compiledRulesFile: 'lexer.compiled-rules.js',
    outputfile: 'tokens.json',
};

function parseArgs(defaultSettings) {
    const flags = { build: false, tokenize: false };
    process.argv.forEach(part => {
        if (part === '-b' || part === '--build') {
            flags.build = true;
            return;
        }
        if (part === '-t' || part === '--tokenize') {
            flags.tokenize = true;
            return;
        }
        const [param, ...chunks] = part.split('=');
        const value = chunks.join('=') ?? false;
        defaultSettings[param] = value;
    })
    return flags;
}

/**
 * Try to match the start of text against one lexer rule.
 * @param {string} text
 * @param {Object} rule
 * @returns {Object|null} token info or null
 */
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

/**
 * Load lexer rules from a JS module and normalize them.
 * @param {string} rulesFile
 * @returns {Promise<Object[]>}
 */
async function parseRules(rulesFile){
    const rules = await importDefault(rulesFile);
    return Object.entries(rules).map( ([type, value]) => ({
        type,
        re: isRegExp(value) ? value : (isArray(value) && isRegExp(value[0]) ? value[0]: null),
        substr: isString(value) ? value : null,
        callback: value?.[1] ?? (($) => Act.same($)),  
    }));
}

/**
 * Serialize lexer rules into a JavaScript module string.
 * @param {Object[]} rules
 * @returns {string}
 */
function compileRules(rules) {
    const items = rules.map(rule => {
        const type = JSON.stringify(rule.type);
        const re = rule.re ? rule.re.toString() : 'null';
        const substr = rule.substr !== null ? JSON.stringify(rule.substr) : 'null';
        const callback = rule.callback.toString();
        return `  { type: ${type}, re: ${re}, substr: ${substr}, callback: ${callback} }`;
    });
    return `import * as Act from '../src/actions.js';\nexport default [\n${items.join(',\n')}\n];\n`;
}

/**
 * Load lexer rules and write the compiled rules module.
 * @param {Object} settings
 * @returns {Promise<Object[]>}
 */
async function buildRules(settings) {
    const rules = await parseRules(settings.rulesFile);
    const content = compileRules(rules);
    await writeAsText(settings.compiledRulesFile, content);
    return rules;
}

/**
 * Load a previously compiled lexer rules module.
 * @param {string} compiledRulesFile
 * @returns {Promise<Object[]>}
 */
async function loadCompiledRules(compiledRulesFile) {
    return await importDefault(compiledRulesFile);
}

/**
 * Split input text into tokens using the given rules.
 * @param {string} text
 * @param {Object[]} rules
 * @returns {Object[]}
 */
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

/**
 * Save tokens to a JSON file.
 * @param {string} outputfile
 * @param {Object[]} tokens
 */
async function saveTokens(outputfile, tokens) {
    await writeAsJSON(outputfile, tokens);
}

async function main() {
    const flags = parseArgs(settings);
    let rules;

    if (flags.build) {
        rules = await buildRules(settings);
        console.log('rules compiled to', settings.compiledRulesFile);
    }

    if (flags.tokenize) {
        if (!rules) {
            rules = await loadCompiledRules(settings.compiledRulesFile);
        }
        const text = await readAsText(settings.inputFile);
        const tokens = tokenize(text, rules);
        await saveTokens(settings.outputfile, tokens);
        console.log('tokens saved to', settings.outputfile);
    }
}

main();