/**
 * Check if value is a RegExp.
 * @param {*} value
 * @returns {boolean}
 */
export const isRegExp = (value) => value instanceof RegExp;

/**
 * Check if value is a string.
 * @param {*} value
 * @returns {boolean}
 */
export const isString = (value) => typeof value === 'string';

/**
 * Check if value is an array.
 * @param {*} value
 * @returns {boolean}
 */
export const isArray = (value) => Array.isArray(value);

/**
 * Split a string by whitespace.
 * @param {string} s
 * @returns {string[]}
 */
export function splitByBlanks(s) {
    return s.trim().split(/\s+/);
}

/**
 * Read command line arguments and put them into settings.
 * Format: key=value
 * @param {Object} defaultSettings
 * @returns {Object} the updated settings
 */
export function parseArgs(defaultSettings) {
    process.argv.forEach(part => {
        const [param, ...chunks] = part.split('=');
        const value = chunks.join('=') ?? false;
        defaultSettings[param] = value;
    })
    return defaultSettings;
}

/**
 * Pad a value to a fixed width.
 * @param {number|string} data
 * @param {number} width
 * @param {string} filler
 * @returns {string}
 */
export function pad(data, width, filler = '0'){
    return (data + '').padStart(width, filler);
}

/**
 * Make a compact string representation of a plain object.
 * @param {Object} data
 * @returns {string}
 */
export function compact(data) {
    const body = Object.entries(data)
        .map( ([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(", ");
    return `{ ${body} }`;
}

/**
 * The symbol used to show the dot position in an LR item string.
 * @type {string}
 */
export const DOT_POINT = "_";