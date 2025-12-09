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
  "E": [
    {"E O T": $ => ({'$sum': (a,b) => a+b, '$sub': (a,b) => a-b}[$[1]])($[0], $[2])}, 
    {"T": $ => $[0]}
  ],
  "T": [
    {"n": $ => $[0]}, 
    {"( E )": $ => $[1]}
  ],
  "O": [
    {"+": $ => "$sum"},
    {"-": $ => "$sub"},
  ]
}

/*
const rules = {
  "S": ["A A"],
  "A": ["a A", "b"]
}
*/

export default rules;