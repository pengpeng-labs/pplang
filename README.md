# pplang

[简体中文](README.zh-CN.md)

pplang is the specification repository for **pp**, a small, statically typed
systems programming language. The language is designed for explicit resource
management, freestanding programs, compact compiler implementations, and
predictable source generation.

The current language version is **0.4.0**. [`spec.md`](spec.md) is the normative
English specification. [`spec.zh-CN.md`](spec.zh-CN.md) is its official Simplified
Chinese translation. If the two texts differ, the English specification takes
precedence.

## Scope

This repository defines the language rather than a particular implementation.

| Path | Purpose |
|---|---|
| `spec.md` / `spec.zh-CN.md` | Normative specification and official translation |
| `design.md` / `design.zh-CN.md` | Stable design rationale and rejected alternatives |
| `grammar/pp.ebnf` | Machine-readable grammar |
| `stdlib.md` / `stdlib.zh-CN.md` | Standard library contract |
| `stdlib/` | Released standard library sources |
| `examples/` | Portable example programs |
| `conformance/` | Versioned observable-behavior tests |
| `REFERENCES.md` / `REFERENCES.zh-CN.md` | Technical and language-design references |
| `CONTRIBUTING.md` / `CONTRIBUTING.zh-CN.md` | Specification change and review rules |

The reference compiler is maintained in
[`pengpeng-labs/pplc`](https://github.com/pengpeng-labs/pplc). Build commands,
workspaces, dependency resolution, and package management belong to
[`pengpeng-labs/pptc`](https://github.com/pengpeng-labs/pptc), not to the
language specification.

## Language overview

```pp
enum Option[T] { Some(T), None }

fn unwrap_or[T](value: Option[T], fallback: T) -> T {
    switch value {
        Option.Some(item) { return item; }
        Option.None { return fallback; }
    }
}

fn main() -> int {
    let answer: Option[int] = Option.Some[int](42);
    return unwrap_or[int](answer, 0);
}
```

Version 0.4.0 provides value-semantics structs and enums, exhaustive `switch`,
explicit monomorphized generics, tuples, fixed-size arrays, length-carrying
byte strings, lexical scopes, function pointers, explicit allocation, and a
visible raw-pointer boundary. Explicit `@package/path.pp` imports connect this
source contract to a build-provided package map without embedding dependency
resolution in the language. It does not provide garbage collection, an
ownership checker, traits, implicit generic inference, exceptions, macros,
source-level `unsafe`, or inline assembly.

## Conformance

Check repository structure and bilingual document parity:

```bash
node tools/check-repository.mjs
```

Run the portable behavior suite through a compiler adapter:

```bash
node tools/run-conformance.mjs /path/to/pp
```

The bundled runner is an adapter for the current `pplc` command-line interface.
The test manifest defines acceptance, rejection, execution, and trap outcomes
without standardizing compiler diagnostics or an implementation architecture.

## Versioning

pplang uses semantic version tags. Patch releases clarify the specification,
repair tests, and correct documentation without adding language features. A
syntax addition or observable semantic change requires a minor release.

## License

Licensed under either the [Apache License, Version 2.0](LICENSE-APACHE) or the
[MIT License](LICENSE-MIT), at your option.
