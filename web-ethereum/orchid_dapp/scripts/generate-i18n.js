//
// Read the base localized file and generate a typescript API.
// Pat Niemeyer (pat@pat.net)
//
let baseFile = './src/i18n/en.json';
let outFile = './src/i18n/S.ts';

const fs = require('fs');
let json = JSON.parse(fs.readFileSync(baseFile));

let out = "///\n/// GENERATED CODE: Do not modify!\n///\n";
out += 'import {intl} from "../index";\n\n';
out += "export class S {\n";
out += Object.keys(json).map(key=> {
    if (key.startsWith("@")) { return ""; }
    return `  static get ${key}() { return intl.formatMessage({id: '${key}',\n    defaultMessage: '${json[key]}'}); }`;
}).join('\n');
out += "\n}\n";

fs.writeFileSync(outFile, out);

