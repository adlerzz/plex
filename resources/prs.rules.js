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

const rules = {
  "E": ["E + T", "T"],
  "T": ["n", "( E )"],
}

/*
const rules = {
  "S": ["A A"],
  "A": ["a A", "b"]
}
*/

export default rules;