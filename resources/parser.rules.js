import * as Act from '../src/actions.js';

const rules = {
  "Expr": [
    {"Ex1 TailEx2": $ => Act.denseJoin($)},
  ],
  "TailEx2": [
    {"BiOp2 Ex1 TailEx2": $ => Act.denseJoin([$[1], $[2], $[0]])},
    {"$$": $ => ""}
  ],
  "Ex1": [
    {"PartEx TailEx1": $ => Act.denseJoin($) }
  ],
  "TailEx1": [
    {"BiOp1 PartEx TailEx1": $ => Act.denseJoin([$[1], $[2], $[0]])},
    {"$$": $ => ""}
  ],
  "PartEx": [
    {"Unary NUM": $ => {
      const res = `s_push_1 ${$[1]}`
      const op = $[0] === "" ? "": "\n" + $[0];
      return res + op;
    }},
    {"( Expr )": $ => $[1]} 
  ],
  "Unary": [
    {"-": $ => "s_neg_1"},
    {"!": $ => "s_not_1"},
    {"+": $ => ""},
    {"$$": $ => ""}
  ],
  "BiOp1": [
    {"*": $ => "s_mul_2"},
    {"/": $ => "s_div_2"},
  ],
  "BiOp2": [
    {"+": $ => "s_add_2"},
    {"-": $ => "s_sub_2"}
  ],
  
}

/*
const rules = {
  "S": ["A A"],
  "A": ["a A", "b"]
}
*/

export default rules;