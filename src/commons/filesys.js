import fs from "node:fs/promises";

const RES = "./resources/";

export async function readAsText(file){
    return await fs.readFile(RES + file, "utf-8");
}

export async function writeAsJSON(file, data){
    await fs.writeFile(RES + file, JSON.stringify(data, null, 2), "utf-8");
}

export async function writeAsText(file, text){
    await fs.writeFile(RES + file, text, "utf-8");
}