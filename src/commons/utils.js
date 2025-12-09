export const same = _ => _;

export function splitByBlanks(s) {
    return s.trim().split(/\s+/);
}

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

export const DOT_POINT = "_";