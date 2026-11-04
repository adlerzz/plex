import { readAsText } from "../src/commons/filesys.js";

const reg = {A: 0, B: 0, C: 0, D: 0, E: 0};
const stack = [];
const actions = {
    "push": (args) => { // push A
        stack.push(reg[args[0]]);
    },
    "pop": (args) => { // pop A
        reg[args[0]] = stack.pop();
    },
    "stor": (args) => { // stor A 42
        reg[args[0]] = +args[1];
    },
    "mov": (args) => { // mov A B
        reg[args[0]] = reg[args[1]];
    },
    "neg": (args) => { // neg A
        reg[args[0]] = - reg[args[0]];
    },
    "not": (args) => { // not A
        reg[args[0]] = !reg[args[0]];
    },
    "add": (args) => { // add A B
        reg[args[0]] += reg[args[1]];
    },
    "sub": (args) => { // sub A B
        reg[args[0]] -= reg[args[1]];
    },
    "mul": (args) => { // mul A B
        reg[args[0]] *= reg[args[1]];
    },
    "div": (args) => { // div A B
        const a = reg[args[0]];
        const b = reg[args[1]];

        reg[args[0]] = (a / b | 0);
        reg[args[1]] = a % b;
    },
}

const lines = await readAsText('output.text');

lines.split(/[\r\n]/).forEach(line => {
	const [command, ...args] = line.split(' ');
	actions[command](args);
});

console.log({stack, reg});