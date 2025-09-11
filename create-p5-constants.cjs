const fs = require("fs");
const path = require("path");

// Input and output paths
const inputFile = path.resolve("node_modules/p5/types/p5.d.ts");
const outputFile = path.resolve("src/constants.ts");

// Read file
const dts = fs.readFileSync(inputFile, "utf8");

// Match lines like: static NAME: 'Value';
const regex = /static\s+(\w+)\s*:\s*'([^']+)';/g;

let matches = [...dts.matchAll(regex)];

// Build class body
let classBody = matches
  .map(
    ([, name, value]) =>
      `  static ${name}: '${value}' = '${value}';`
  )
  .join("\n");

let output = `export class P5 {\n${classBody}\n}\n`;

// Write output file
fs.writeFileSync(outputFile, output, "utf8");

console.log(`Generated ${outputFile} with ${matches.length} static vars`);
