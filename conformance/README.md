# pplang 0.4.0 Conformance Contract

[简体中文](README.zh-CN.md)

The conformance manifest describes observable source-language outcomes without
standardizing compiler diagnostics, an intermediate representation, or a
command-line interface.

## Outcomes

| Outcome | Requirement |
|---|---|
| `accept` | The source is a valid program and must compile. |
| `reject` | The source violates a compile-time rule and must be rejected without a compiler crash. |
| `run` | The source must compile, terminate normally, and produce the declared standard output. |
| `trap` | The source must compile and terminate through the language trap mechanism. |

Diagnostic language and wording are deliberately excluded. Compiler projects
may maintain stable error codes, but those codes are not part of pplang 0.4.0.

## Adapter

The bundled runner adapts the current `pplc` CLI to the outcome model:

```bash
node tools/run-conformance.mjs /path/to/pp
```

Another implementation may provide its own adapter and consume the same
`suite.json`. Implementation-specific regression tests belong in the compiler
repository.

## Coverage

The suite covers strict boolean conditions, lexical scope, unsigned integer
operations, array syntax, checked string slices, tuple returns, sum
exhaustiveness, explicit generics, iteration, method auto-addressing, deferred
call order, package-root import mapping, extern restrictions, and loop-control context. The suite is a
minimum compatibility gate rather than an exhaustive test of every program.
