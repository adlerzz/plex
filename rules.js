const q = (...types) => Object.fromEntries(types.map(type => [type, type]))
const Q = (...types) => Object.fromEntries(types.map(type => [type, type.toLowerCase()]))


const rules = {
    "LINE_COMMENT": /\/\/.*/,
    "BLOCK_COMMENT": /\/\*.*\*\//,
    "STRING": /\"([^\\]|\\["\r\n])*?\"/,
    
    ...Q("VAR", "THE", "FOR", "IF", "WHILE", "MATCH", 
        "BREAK", "CONTINUE", "NULL", "IMPORT", "EXPORT",
        "RETURN"),
    
    "ID": /[_$@#A-Za-z][_$@#A-Za-z0-9]*/,
    
    ...q("+=", "-=", "*=", "/="),
    ...q("!=", "==", "<=", ">="),
    ...q("=>>", "=>", "<<", ">>", "|>>", "|>", "|?"),
    ...q("..", "?.", "??"),
    ...q("+", "-", "*", "/", "!", "&", "|", "~"),
    ...q(";", ":", ".", ",", "[", "]", "(", ")", "{", "}"),
    
    "HEX": [
        /-?0[xX][A-Fa-f0-9]+/,
        (s) => parseInt(s)
    ],
    "NUM": [
        /-?\d+(\.\d+)?/,
        (s) => parseFloat(s)
    ],

    "BLANK": [
        /\s+/, 
        () => null
    ],

    "?": /.|\r|\n/,
};

export default rules;