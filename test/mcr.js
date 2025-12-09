import { readAsText } from "../src/commons/filesys.js";

const stack = [];
const actions = {
    "s_push_1": (args) => {
        stack.push(+args[0]);
    },
    "s_neg_1": () => {
        const a = stack.pop();
        stack.push(-a);
    },
    "s_not_1": () => {
        const a = stack.pop();
        stack.push(+!a);
    },
    "s_add_2": () => {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a + b);
    },
    "s_sub_2": () => {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a - b);
    },
    "s_mul_2": () => {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a * b);
    },
}

const lines = await readAsText('output.text');

lines.split(/[\r\n]/).forEach(line => {
	const [command, ...args] = line.split(' ');
	actions[command](args);
});

console.log(stack);