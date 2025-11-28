import fs from "node:fs/promises";

export function parseArgs(defaultSettings) {
    process.argv.forEach(part => {
        const [param, ...chunks] = part.split('=');
        const value = chunks.join('=') ?? false;
        defaultSettings[param] = value;
    })
}

export function pad(data, width, filler = '0'){
    return (data + '').padStart(width, filler);
}

export async function writeAsJSON(file, data){
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function writeAsText(file, text){
    await fs.writeFile(file, text, "utf-8");
}

export const DOT_POINT = "_";