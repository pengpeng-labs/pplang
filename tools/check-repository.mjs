import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bilingualPairs = [
  ["README.md", "README.zh-CN.md"],
  ["CHANGELOG.md", "CHANGELOG.zh-CN.md"],
  ["CONTRIBUTING.md", "CONTRIBUTING.zh-CN.md"],
  ["REFERENCES.md", "REFERENCES.zh-CN.md"],
  ["spec.md", "spec.zh-CN.md"],
  ["design.md", "design.zh-CN.md"],
  ["stdlib.md", "stdlib.zh-CN.md"],
  ["stdlib/README.md", "stdlib/README.zh-CN.md"],
  ["conformance/README.md", "conformance/README.zh-CN.md"]
];
const required = [
  "VERSION", "LICENSE-APACHE", "LICENSE-MIT", "grammar/pp.ebnf", "conformance/suite.json",
  ...bilingualPairs.flat()
];
for (const path of required) {
  if (!existsSync(resolve(root, path))) throw new Error(`missing ${path}`);
}
if (existsSync(resolve(root, "PROVENANCE.md"))) {
  throw new Error("development provenance does not belong in the release documentation");
}

const version = readFileSync(resolve(root, "VERSION"), "utf8").trim();
const suite = JSON.parse(readFileSync(resolve(root, "conformance/suite.json"), "utf8"));
if (suite.schema !== "pplang.conformance.v3") throw new Error("unknown conformance schema");
if (suite.languageVersion !== version) throw new Error("VERSION and suite disagree");

const ids = new Set();
for (const entry of suite.cases) {
  if (!entry.id || ids.has(entry.id)) throw new Error(`invalid/duplicate case id: ${entry.id}`);
  ids.add(entry.id);
  if (!existsSync(resolve(root, entry.path))) throw new Error(`missing case source: ${entry.path}`);
  if (!["accept", "reject", "run", "trap"].includes(entry.expect)) {
    throw new Error(`invalid outcome for ${entry.id}`);
  }
  if (entry.expect === "run" && typeof entry.stdout !== "string") {
    throw new Error(`missing stdout for ${entry.id}`);
  }
  if (entry.stderrContains !== undefined || entry.command !== undefined) {
    throw new Error(`${entry.id} leaks implementation-specific CLI or diagnostics`);
  }
  if (entry.importMap !== undefined) {
    if (entry.importMap === null || Array.isArray(entry.importMap) || typeof entry.importMap !== "object") {
      throw new Error(`${entry.id} has an invalid import map`);
    }
    for (const [name, path] of Object.entries(entry.importMap)) {
      if (!/^[a-z][a-z0-9_-]*$/.test(name) || typeof path !== "string") {
        throw new Error(`${entry.id} has an invalid import mapping`);
      }
      if (!existsSync(resolve(root, path))) {
        throw new Error(`${entry.id} has a missing import root: ${path}`);
      }
    }
  }
}

function headingShape(source) {
  return [...source.matchAll(/^(#{2,4})\s+/gm)].map((match) => match[1].length).join(",");
}

for (const [english, chinese] of bilingualPairs) {
  const left = readFileSync(resolve(root, english), "utf8");
  const right = readFileSync(resolve(root, chinese), "utf8");
  if (headingShape(left) !== headingShape(right)) {
    throw new Error(`bilingual heading structure differs: ${english} and ${chinese}`);
  }
}

const documents = bilingualPairs.flat();
for (const document of documents) {
  const original = readFileSync(resolve(root, document), "utf8");
  if (/\p{Extended_Pictographic}/u.test(original)) {
    throw new Error(`emoji is not allowed in release documentation: ${document}`);
  }
  if (/已落地|落地顺序|L1-L3|development checklist/i.test(original)) {
    throw new Error(`development-status language found in ${document}`);
  }
  if (/\b0\.3(?!\.1)/.test(original)) {
    throw new Error(`outdated version spelling found in ${document}`);
  }
  const source = original.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim();
    if (target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    const path = decodeURIComponent(target.split("#", 1)[0]);
    if (!existsSync(resolve(root, dirname(document), path))) {
      throw new Error(`broken local link in ${document}: ${target}`);
    }
  }
}

const specification = readFileSync(resolve(root, "spec.md"), "utf8");
if (!specification.includes(`Status: **${version} stable**`)) {
  throw new Error("normative specification status and VERSION disagree");
}
if (/LLVM|\bpp (?:ir|run|build|obj|os)\b/.test(specification)) {
  throw new Error("the language specification contains compiler/toolchain details");
}

const grammar = readFileSync(resolve(root, "grammar/pp.ebnf"), "utf8");
const grammarCode = grammar
  .replace(/\(\*[\s\S]*?\*\)/g, "")
  .replace(/\?[\s\S]*?\?/g, "")
  .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
const productions = new Set(
  [...grammarCode.matchAll(/^([a-z_][a-z0-9_]*)\s*=/gm)].map((match) => match[1])
);
for (const match of grammarCode.matchAll(/\b([a-z_][a-z0-9_]*)\b/g)) {
  const symbol = match[1];
  if (!productions.has(symbol)) throw new Error(`undefined grammar production: ${symbol}`);
}

console.log(`PPLANG REPOSITORY PASS version=${version} cases=${suite.cases.length} bilingual=${bilingualPairs.length}`);
