import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const compiler = process.argv[2];
if (!compiler) {
  console.error("usage: node tools/run-conformance.mjs /path/to/pp");
  process.exit(2);
}

const suite = JSON.parse(readFileSync(resolve(root, "conformance/suite.json"), "utf8"));

function invoke(command, source) {
  const result = spawnSync(compiler, [command, source], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.error) throw result.error;
  return result;
}

function describe(result) {
  return `status=${result.status} signal=${result.signal}\nstdout=${JSON.stringify(result.stdout)}\nstderr=${result.stderr}`;
}

let passed = 0;
for (const entry of suite.cases) {
  const source = resolve(root, entry.path);
  if (entry.expect === "accept") {
    const result = invoke("ir", source);
    if (result.status !== 0) throw new Error(`${entry.id}: expected acceptance\n${describe(result)}`);
  } else if (entry.expect === "reject") {
    const result = invoke("ir", source);
    if (result.status === 0 || result.status === null) {
      throw new Error(`${entry.id}: expected a clean compile-time rejection\n${describe(result)}`);
    }
  } else if (entry.expect === "run") {
    const result = invoke("run", source);
    if (result.status !== 0) throw new Error(`${entry.id}: expected normal execution\n${describe(result)}`);
    if (result.stdout !== entry.stdout) {
      throw new Error(`${entry.id}: stdout mismatch\nexpected ${JSON.stringify(entry.stdout)}\nactual   ${JSON.stringify(result.stdout)}`);
    }
  } else if (entry.expect === "trap") {
    const compile = invoke("ir", source);
    if (compile.status !== 0) throw new Error(`${entry.id}: trap case did not compile\n${describe(compile)}`);
    const result = invoke("run", source);
    if (result.status === 0) throw new Error(`${entry.id}: expected a runtime trap\n${describe(result)}`);
  } else {
    throw new Error(`${entry.id}: unknown outcome ${entry.expect}`);
  }
  passed += 1;
}

console.log(`PPLANG CONFORMANCE PASS version=${suite.languageVersion} cases=${passed}`);
