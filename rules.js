const rules = {
    "LINE_COMMENT": /\/\/.*/,
    "BLOCK_COMMENT": /\/\*.*\*\//,
    "STRING": /\"([^\\]|\\["\r\n])*?\"/,
    "VAR": "var",
    "THE": "the",
    "HEX": [
        /-?0[xX][A-Fa-f0-9]+/,
        (s) => parseInt(s)
    ],
    "NUM": [
        /-?\d+(\.\d*)?/,
        (s) => parseFloat(s)
    ],
    "ID": /[_$@#A-Za-z][_$@#A-Za-z0-9]*/,
    "=": "=",
    ";": ";",
    "BLANK": [/\s+/, null],
    "?": /.|\r|\n/,
};

export default rules;