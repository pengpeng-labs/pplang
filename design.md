# pplang Design Rationale

[简体中文](design.zh-CN.md)

This document explains the stable design choices behind pplang 0.3.1. It is
informative rather than normative; [`spec.md`](spec.md) defines accepted
program behavior.

## 1. Problem statement

Systems programming courses often connect several models only indirectly: a
source language, its type checker, generated machine-level code, explicit
memory management, foreign interfaces, and freestanding execution. Production
languages demonstrate these concerns at scale, but their complete semantics
and toolchains are too large to inspect as one artifact.

pplang asks a narrower question: what is the smallest coherent language that
can express ordinary programs and freestanding systems code while remaining
small enough for one reader to follow from syntax to machine behavior?

The result is not a replacement for C, Rust, Zig, Go, or Ada. It is a compact
systems-language design with explicit boundaries and deliberately limited
abstraction mechanisms.

## 2. Design goals

### 2.1 A bounded language surface

The grammar, type rules, and lowering model should remain understandable as a
whole. A feature is accepted only when it removes recurring accidental
complexity or establishes a reusable safety property.

### 2.2 Freestanding capability

The core language must not require an operating system, allocator, garbage
collector, unwinder, or dynamic loader. Raw pointers and target capabilities
remain available because kernels, drivers, allocators, and FFI glue require
them.

### 2.3 Explicit resource behavior

Allocation is a library and host concern. Copying, borrowing, and lifetime
responsibility must be visible in API contracts even though the type system
does not prove ownership.

### 2.4 Predictable source and compiler behavior

The language favors explicit types, explicit generic arguments, a small set of
desugarings, and deterministic evaluation order. These properties help both
human review and generated code.

### 2.5 Implementation independence

The language contract describes observable semantics, not a required compiler
architecture or intermediate representation. A compiler may use LLVM, another
backend, an interpreter, or direct machine-code generation.

## 3. Type-system boundary

pplang uses static types, nominal structs and enums, structural arrays and
tuples, lexical scope, and explicit conversions. It does not attempt ownership
proofs, subtyping, higher-kinded polymorphism, or general constraint solving.

This boundary follows a practical distinction from type theory: product types,
sum types, and first-order functions provide substantial modeling power without
requiring a large inference or proof system. Type errors should be local and
explainable from declarations visible at the use site.

Strict boolean conditions prevent the truthiness rules common in C from
crossing into control flow. Explicit integer conversions make width and signed
interpretation visible. These rules are more important to the language than
adding new surface syntax.

## 4. Products, sums, and control flow

Structs are nominal product types. Enums are nominal sum types with one optional
payload per variant. `switch` is the elimination form for enum values and is
exhaustive unless a final wildcard arm is present.

The design takes the tag-and-payload model and exhaustiveness property from the
ML family and modern algebraic data types. It intentionally omits nested
patterns, guards, multi-payload constructors, and a general `match` expression.
Multiple payload values can be grouped in a struct, keeping pattern analysis
first-order.

Tuples exist primarily for small return values and immediate destructuring.
They do not grow into anonymous records, indexed heterogeneous containers, or
an alternative object model.

## 5. Explicit generics

Generic functions and types use explicit type arguments and monomorphization.
The design separates two concerns that are often combined:

1. Type parameterization, such as `Vec[int]` and `Vec[u8]`.
2. Required operations, such as comparison or hashing.

pplang provides the first through explicit instantiation. It expresses the
second through ordinary function-pointer parameters. A generic sort therefore
receives a comparison function instead of relying on a trait, type set, or
implicit operator constraint.

This approach is influenced by Ada's explicit generic contracts, but reduces
them to mechanisms already present in pplang. It gives call sites and generated
instances a predictable shape at the cost of repetition and fewer opportunities
for inference.

## 6. Strings and memory

A raw pointer does not communicate length, ownership, lifetime, or nullability.
pplang does not attempt to solve all four properties in the type system.
Instead it uses a layered boundary:

| Need | Mechanism |
|---|---|
| Byte sequence with a known extent | `str` as `{pointer, length}` |
| Owned growable bytes | standard-library `Buf` |
| Homogeneous growable values | standard-library `Vec[T]` |
| Explicit dynamic allocation | allocator functions and `defer` |
| Hardware and FFI access | raw `*T` and target capabilities |

`str` is a byte view rather than a NUL-terminated string. This makes length
constant-time, permits embedded zero bytes, and keeps protocol data independent
of a text encoding. It is non-owning: a length check cannot prove that the
underlying storage remains alive.

The standard library supplies ownership conventions for containers, but these
remain API contracts rather than compiler proofs. This is a deliberate limit,
not a claim of Rust-equivalent memory safety.

## 7. Methods as desugaring

Method syntax does not introduce classes, method tables, visibility, or dynamic
dispatch. `value.operation(arg)` resolves to an ordinary function call whose
first parameter is the receiver. Automatic address-taking for a pointer
receiver removes a common source of call-site noise while retaining a plain
function ABI.

This follows the principle that syntax should expose an existing mechanism
rather than create a second semantic system.

## 8. Standard library boundary

The language includes only operations that require syntax or compiler
knowledge. Allocation, byte buffers, vectors, maps, string algorithms, and
mathematics are library code. Volatile memory, port I/O, interrupts, and clocks
are target capabilities.

Keeping these layers separate allows a hosted program, a freestanding kernel,
and an embedded library to provide different policies without changing the
source-language type system.

## 9. Rejected alternatives

### 9.1 Ownership and borrow checking

Static lifetime proofs would provide stronger memory guarantees, but they would
dominate the language and compiler. Version 0.3.1 chooses explicit ownership
contracts and accepts that invalid raw-pointer use is not prevented statically.

### 9.2 Traits, interfaces, and implicit generic inference

These mechanisms improve abstraction at scale but require method lookup,
coherence rules, constraint solving, or runtime representation decisions.
Function pointers and explicit type arguments cover the intended scale with a
smaller semantic surface.

### 9.3 Garbage collection

A required collector conflicts with predictable freestanding execution and
would introduce a runtime larger than the core language. Applications may
provide arenas or collectors as libraries when appropriate.

### 9.4 Source-level unsafe and inline assembly blocks

An `unsafe` marker without an enforced safe subset would be decorative. Inline
assembly would couple the language grammar to target-specific constraints.
pplang instead keeps raw capabilities visible through types, builtins, and
external glue.

### 9.5 General metaprogramming and macros

Compile-time execution and macros can replace repetition but make source
meaning dependent on another execution system. Explicit generics are the only
compile-time code-generation mechanism in version 0.3.1.

## 10. Evaluation criteria

A design change should be evaluated against four questions:

1. Does it solve a recurring problem in real pplang programs?
2. Can its type and runtime behavior be specified without reference to one
   compiler implementation?
3. Can the behavior be covered by a small conformance test?
4. Is the added mechanism smaller than the repeated complexity it removes?

Features that fail these criteria belong in a library, a target module, a
toolchain, or a later language version.
