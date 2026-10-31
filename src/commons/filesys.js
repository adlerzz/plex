import fs from "node:fs/promises";

const RES = "resources";
const ENCODING = "utf-8";

/**
 * Import the default export from a file in the resources folder.
 * @param {string} file
 * @returns {Promise<*>}
 */
export async function importDefault(file){
    const {default: result} = await import(`../../${RES}/${file}`);
    return result;
}

/**
 * Read a text file from the resources folder.
 * @param {string} file
 * @returns {Promise<string>}
 */
export async function readAsText(file){
    return await fs.readFile(`./${RES}/${file}`, ENCODING);
}

/**
 * Read a JSON file from the resources folder and parse it.
 * @param {string} file
 * @returns {Promise<*>}
 */
export async function readAsJSON(file){
    return JSON.parse( await fs.readFile(`./${RES}/${file}`, ENCODING));
}

/**
 * Write data to a JSON file in the resources folder.
 * @param {string} file
 * @param {*} data
 */
export async function writeAsJSON(file, data){
    await fs.writeFile(`./${RES}/${file}`, JSON.stringify(data, null, 2), ENCODING);
}

/**
 * Write text to a file in the resources folder.
 * @param {string} file
 * @param {string} text
 */
export async function writeAsText(file, text){
    await fs.writeFile(`./${RES}/${file}`, text, ENCODING);
}