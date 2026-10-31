/**
 * Convert a string to an integer.
 * @param {string} s
 * @returns {number}
 */
export const int = (s) => parseInt(s, 10);

/**
 * Convert a string to a float.
 * @param {string} s
 * @returns {number}
 */
export const float = (s) => parseFloat(s);

/**
 * Return the value unchanged.
 * @param {*} x
 * @returns {*}
 */
export const same = (x) => x;

/**
 * Ignore a token by returning null.
 * @returns {null}
 */
export const ignore = () => null;

/**
 * Remove leading and trailing whitespace.
 * @param {string} s
 * @returns {string}
 */
export const trim = (s) => s.trim();

/**
 * Join non-empty strings with a separator.
 * @param {string[]} arr
 * @param {string} sep
 * @returns {string}
 */
export function denseJoin(arr, sep = "\n") {
    return arr.filter(it => it !== "").join(sep);
}

