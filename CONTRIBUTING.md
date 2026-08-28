# Contributing to pplang

[简体中文](CONTRIBUTING.zh-CN.md)

pplang is a language-definition repository. Changes are reviewed first for
semantic clarity and compatibility, then for implementation convenience.

## Change categories

- A clarification explains existing behavior without changing which programs
  are valid or what valid programs observe. It may be released as a patch.
- A correction aligns contradictory normative text or tests with the intended
  released semantics. Its compatibility impact must be stated explicitly.
- A language change adds syntax, changes typing, or changes observable runtime
  behavior. It requires a new minor version and design rationale.
- A library change follows semantic versioning independently within the
  language release and must document ownership and failure behavior.

## Required updates

A change to language behavior must update, in the same pull request:

1. The English normative specification.
2. The official Simplified Chinese translation with matching section structure.
3. The EBNF when syntax changes.
4. Positive, negative, or runtime conformance cases.
5. Both changelog documents when the change is release-visible.

Compiler implementation details and toolchain commands belong in their own
repositories. Diagnostic wording must not become part of the language contract.

## Documentation style

Use precise, neutral technical language. Normative rules state what a program
must do or what an implementation must reject. Design rationale explains the
problem, alternatives, decision, and cost without recording task status or
development chronology. Release documentation does not use emoji.

English is the normative language. Chinese documents are official translations
and use the same heading structure. Examples and standard-library source
comments use English so one source tree remains portable across both document
sets.

## Verification

Before submitting a change, run:

```bash
node tools/check-repository.mjs
node tools/run-conformance.mjs /path/to/pp
```

All example and standard-library `.pp` files must also compile with a conforming
compiler. A test that depends on one compiler's crash, diagnostic sentence,
intermediate representation, or command output is not portable conformance.
