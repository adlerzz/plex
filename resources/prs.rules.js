/*const rules = {
  "s": ["stats"],
  "lstat": ["cstat", "stat"],
  "cstat": ["{ stats }"],
  "stats": ["stats stat", "stat"],
  "stat": ["assign", "cycle", "branch"],
  "assign": ["ID aop expr ;"],
  "expr": ["expr operator value", "( expr )", "value"],
  "operator": ["+", "-", "/", "*"],
  "value": ["ID", "NUM", "HEX", "STRING"],
	 "aop": ["=", "+=", "-="],
  "cycle": ["FOR ( ID of range ) lstat", "WHILE  ( expr ) lstat"],
  "range": ["[ value .. value ]"],
  "branch": ["IF ( expr ) lstat", "IF ( expr ) lstat ELSE lstat"],
}*/
/*
const rules = {
  "expr": ["expr op val", "( expr )", "u expr", "val"],
  "val": ["ID", "NUM", "STR"],
  "op": ["+", "-", "*", "/"],
  "u": ["-", "!"],
};
*/

const def = {
  denseJoin(arr, sep="\n"){
    return arr.filter( it => it !== "").join(sep);
  }
}

const rules = {
  "Expr": [
    {"Ex1 TailEx2": $ => def.denseJoin($)},
  ],
  "TailEx2": [
    {"BiOp2 Ex1 TailEx2": $ => def.denseJoin([$[1], $[2], $[0]])},
    {"$$": $ => ""}
  ],
  "Ex1": [
    {"PartEx TailEx1": $ => def.denseJoin($) }
  ],
  "TailEx1": [
    {"BiOp1 PartEx TailEx1": $ => def.denseJoin([$[1], $[2], $[0]])},
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

export {def};
export default rules;