import fs from "node:fs/promises";
import parseArgs from "./utils";

const settings = {
    rulesFile: 'prs.rules.js',
    inputFile: 'input.txt',
    outputfile: 'output.json',
};

const FIRST_NODE = "'F";

async function parseRules(rulesFile) {
    const { default: rules } = await import(`./${rulesFile}`);
    const rulesList = Object.entries(rules)
        .flatMap(([node, rules]) => rules
            .map(rule => ({ node, seq: rule.split(" ") }))
        );
    const first = { node: FIRST_NODE, seq: [rulesList[0].node] };
    return [first, ...rulesList].map((it, id) => ({ id, ...it }));
}

function isNode(ctx, name) {
    return ctx.nodes.includes(name);
}

function showI(i) {
    return i.map(r => `#${(r.rule.id + "").padStart(4, '0')} ${r.rule.node} : ${showDP(r)}`);
}

function rulesBy(ctx, nodeName) {
    return unique(
        ctx.rules
            .filter(rule => rule.node === nodeName)
            .map(rule => ({ rule, dp: 0 }))
    );
}

function ngen(ctx, i) {
    return unique(i
        .filter(it => isNode(ctx, it.rule.seq[0]))
        .flatMap(it => rulesBy(ctx, it.rule.seq[0]))
    )
}

function addIf(to, what) {
    if (to.find(it => it.rule.id === what.rule.id)) {
        return;
    }
    to.push(what);
}

function unique(arr) {
    return [...new Set(arr)];
}

function mergeSets(to, from) {
    const sizeBefore = to.length;
    from.forEach(it => addIf(to, it));
    return to.length - sizeBefore;
}

function convolute(ctx, i) {
    let d;
    do {
        const toAdd = ngen(ctx, i);
        d = mergeSets(i, toAdd);
    } while (d !== 0);
}

function showDP(r) {
    const s = [...r.rule.seq];
    s.splice(r.dp, 0, "_");
    return s.join(" ");
}

function getByDP(ctx, i, dp) {
    return unique(
        i.map(r => r.rule.seq[dp])
    );
}


function doShift(ctx, ip, e) {
    const ix = unique(ip
        .filter(r => e === r.rule.seq[r.dp])
        .map(r => ({ ...r, dp: r.dp + 1 }))
    );
    convolute(ctx, ix);
    return ix;
}

function doShifts(ctx, ip, dp) {
    const x0 = getByDP(ctx, ip, dp);
    const sh = x0.map(x => doShift(ctx, ip, x));
    return sh;
}

async function main() {
    parseArgs(settings);

    const rules = await parseRules(settings.rulesFile);

    const nodes = unique(rules.map(it => it.node));
    const states = {};
    const ctx = { rules, nodes };

    const toWrite = JSON.stringify({ rules, nodes: [...nodes] }, null, 2);

    await fs.writeFile("rules.txt", toWrite, 'utf-8');

    const i0 = [{ rule: ctx.rules[0], dp: 0 }];
    convolute(ctx, i0);
    console.log(showI(i0));
    const sh1 = doShifts(ctx, i0, 0);
    console.log("1", sh1.map(sh => showI(sh)));
    const sh2 = sh1.map(sh => doShifts(ctx, sh, 1))
    console.log('2', sh2.flat().map(sh => showI(sh)));
    const sh3 = sh2.flat().map(sh => doShifts(ctx, sh, 2))
    console.log("3", sh3.flat().map(sh => showI(sh)));
    const sh4 = sh3.flat().map(sh => doShifts(ctx, sh, 3))
    console.log("4", sh4.flat().map(sh => showI(sh)));


}

main();