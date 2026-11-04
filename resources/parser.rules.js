import * as Act from '../src/actions.js';

const rules = {
  "Expr": [
    {"Ex1 TailEx2": $ => Act.denseJoin($)},
  ],
  "TailEx2": [
    {"BiOp2 Ex1 TailEx2": $ => {
      const load2 = ["pop B", "pop A"];
      const push = "push A";
      return Act.denseJoin([$[1], $[2], ...load2, $[0], push])}
    },
    {"$$": $ => ""}
  ],
  "Ex1": [
    {"PartEx TailEx1": $ => Act.denseJoin($) }
  ],
  "TailEx1": [
    {"BiOp1 PartEx TailEx1": $ => {
      const load2 = ["pop B", "pop A"];
      const push = "push A";
      return Act.denseJoin([$[1], $[2], ...load2, $[0], push]);
    }},
    {"$$": $ => ""}
  ],
  "PartEx": [
    {"Unary NUM": $ => {
      const stor = `stor A ${$[1]}`
      const op = Act.isEmpty($[0]) ? "": `${$[0]}`;
      const push = "push A";
      return Act.denseJoin([stor, op, push]); 
    }},
    {"( Expr )": $ => $[1]} 
  ],
  "Unary": [
    {"-": $ => "neg A"},
    {"!": $ => "not A"},
    {"+": $ => ""},
    {"$$": $ => ""}
  ],
  "BiOp1": [
    {"*": $ => "mul A B"},
    {"/": $ => "div A B"},
  ],
  "BiOp2": [
    {"+": $ => "add A B"},
    {"-": $ => "sub A B"}
  ],
  
}

/*
const rules = {
  "S": ["A A"],
  "A": ["a A", "b"]
}
*/

export default rules;