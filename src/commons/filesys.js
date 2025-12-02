import fs from "node:fs/promises";

const RES = "./resources/";
const ENCODING = "utf-8";

export async function readAsText(file){
    return await fs.readFile(RES + file, ENCODING);
}

export async function readAsJSON(file){
    return JSON.parse( await fs.readFile(RES + file, ENCODING));
}

export async function writeAsJSON(file, data){
    await fs.writeFile(RES + file, JSON.stringify(data, null, 2), ENCODING);
}

export async function writeAsText(file, text){
    await fs.writeFile(RES + file, text, ENCODING);
}