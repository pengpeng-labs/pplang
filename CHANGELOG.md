# Changelog

[简体中文](CHANGELOG.zh-CN.md)

This file records released language-definition changes. Development activity
belongs in Git history and issue tracking.

## 0.4.0 - 2026-08-28

- Define explicit `import "@package/path.pp";` resolution through a
  build-provided package-root map.
- Keep relative imports disjoint and preserve declaration-flattening semantics
  without introducing namespaces.
- Leave dependency acquisition, versions, checksums, lockfiles, workspaces,
  and registries to the toolchain.

## 0.3.1 - 2026-08-28

First public release of the standalone pplang language definition.

- Define explicit generic functions, structs, and enums with mandatory type
  arguments and monomorphization.
- Define operation requirements through ordinary function-pointer parameters.
- Add `sizeof[T]()` and `alignof[T]()` for concrete type instances.
- Stabilize strict boolean conditions, lexical block scopes, unsigned integer
  operations, length-carrying `str`, checked slices, tuples, exhaustive sum
  types, and `[N]T` arrays.
- Publish paired English and Simplified Chinese specifications, design
  rationale, standard library contracts, and technical references.
- Publish one normative EBNF grammar and a diagnostic-independent conformance
  contract with acceptance, rejection, execution, and trap outcomes.
- Publish standard library sources and preserve `StrMap` state when allocation
  fails while copying a key or value.
