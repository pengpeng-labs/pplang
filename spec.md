# pplang 0.4.0 Language Specification

[简体中文](spec.zh-CN.md)

Status: **0.4.0 stable**. This document is the normative definition of pplang
0.4.0. The Chinese document is an official translation; this English text takes
precedence if the two differ.

The terms **must**, **must not**, **should**, and **may** express requirements,
prohibitions, recommendations, and permitted implementation choices.

## 1. Language model

pplang is a statically typed systems language with lexical scope, value
semantics, explicit resource management, and no required garbage collector or
hidden runtime. A source file uses the `.pp` extension.

An implementation conforms to version 0.4.0 when it accepts every valid 0.4.0
program, rejects every program that violates a stated compile-time rule, and
implements the observable runtime behavior in this specification. Diagnostic
wording and compiler command-line interfaces are not standardized.

## 2. Source text and lexical structure

Source files are UTF-8. Keywords and identifiers are case-sensitive.
Identifiers use the ASCII form `[A-Za-z_][A-Za-z0-9_]*`; non-ASCII text may
appear in comments and string literals.

The keywords are:

```text
as break continue defer else enum extern false fn for if import in let
return static struct switch true while
```

Whitespace separates tokens. `//` starts a line comment. `/*` starts a block
comment terminated by the next `*/`; block comments do not nest.

Decimal integer literals contain one or more digits. Hexadecimal integer
literals begin with `0x` or `0X`. A floating literal contains decimal digits,
a period, and at least one digit after the period. Version 0.4.0 has no exponent,
digit-separator, character, or numeric-suffix syntax.

String literals are delimited by `"`. A literal may contain UTF-8 text and the
escapes `\n`, `\t`, `\r`, `\\`, `\"`, and `\0`. A raw newline and an unknown
escape are compile-time errors. The value is the resulting sequence of bytes;
an embedded zero byte does not terminate a `str`.

## 3. Grammar

[`grammar/pp.ebnf`](grammar/pp.ebnf) is the normative context-free grammar.
Lexical restrictions and semantic validity rules in this document apply in
addition to that grammar.

Ambiguities are resolved by the operator precedence in section 6. An
assignment is a statement, not an expression. The nearest unmatched `if`
owns an `else`.

## 4. Types and values

The primitive types are:

| Type | Values |
|---|---|
| `void` | no value; valid only as a function result |
| `bool` | `false` and `true` |
| `int` | signed 32-bit two's-complement integer |
| `u8`, `u16`, `u32`, `u64` | unsigned integers of the named width |
| `float` | IEEE 754 binary64 value |
| `str` | non-owning byte slice `{pointer, length}` |
| `*T` | raw pointer to `T` |

Composite types are `[N]T` arrays, `(T1, T2, ...)` tuples, function pointers,
named structs, named enums, and explicitly instantiated generic types. `N`
must be a non-negative compile-time integer. Struct, enum, and generic
instances are nominal types. Arrays and tuples are structural types.

Every value type has a zero value. Integer and floating zero, `false`, a null
pointer, an empty `str`, and recursively zeroed arrays/tuples/structs are their
respective zero values. An enum zero value is its first declared variant with a
zero-valued payload when that variant carries one.

Values of arrays, tuples, structs, enums, and `str` are copied on assignment and
argument passing. Copying a `str` copies only its pointer and length. The
language does not track ownership or lifetime.

## 5. Declarations, initialization, and scope

A block introduces a lexical scope. A name declared in an inner scope may
shadow an outer name. Two declarations with the same name in one scope are a
compile-time error. A binding ceases to be visible when its block ends.

`let name: T = value;` declares and initializes a local. The type may be omitted
when an initializer is present. The initializer may be omitted when the type
has a zero value; the binding then receives that value. Omitting both is a
compile-time error.

`static` declares one program-wide mutable value. Its initializer must be a
compile-time constant. An omitted initializer uses the type's zero value.

Function parameters and return types are explicit. Omitting `-> T` means
`-> void`. Reaching the end of a `void` function returns normally. Reaching the
end of a non-void function returns that type's zero value; a type without a zero
value requires an explicit return on every path.

## 6. Expressions, operators, and conversions

Operands and function arguments are evaluated from left to right. `&&` and
`||` short-circuit. Binary operators are left-associative and ordered from low
to high precedence:

| Level | Operators |
|---|---|
| 1 | `||` |
| 2 | `&&` |
| 3 | `|` |
| 4 | `^` |
| 5 | `&` |
| 6 | `== != < > <= >= in` |
| 7 | `<< >>` |
| 8 | `+ -` |
| 9 | `* / %` |

Unary `- ! ~ & *` and postfix calls, fields, indexing, slicing, and casts bind
more tightly than binary operators.

Arithmetic operands must have the same numeric type. Unsigned arithmetic wraps
modulo 2 to the type width. Signed arithmetic uses two's-complement wrapping.
Integer division by zero and signed minimum divided by `-1` trap. Unsigned
division, remainder, and ordering use unsigned interpretation. A shift count
must be in `[0, bit_width)` or execution traps. Right shift is logical for
unsigned integers and arithmetic for `int`.

Floating arithmetic and ordered comparisons follow IEEE 754 binary64. An
ordered comparison involving NaN is false, including `!=`.

Conditions for `if` and `while`, and operands of `&&`, `||`, and `!`, must be
`bool`. No integer converts implicitly to `bool`.

Assignment, parameter passing, and return require the declared type. An integer
literal may be used as an integer type when its value is representable.
Conversions between non-literal integer types, between integers and `float`, or
between integers and pointers require `as`. Integer narrowing keeps the low
bits; unsigned widening zero-extends; signed `int` to a wider integer preserves
its mathematical value. A conversion whose value is not representable follows
these bit rules rather than saturating.

Equality is defined for booleans, numeric values, and pointers of compatible
types. Ordering is defined only for numeric values. Pointer ordering is not
defined. `value in array` performs element equality from first to last;
`byte in string` tests a byte value against the entire `str` length.

## 7. Control flow and deferred calls

`if` and `while` use strict boolean conditions. `break` and `continue` are valid
only inside the nearest enclosing loop.

`range(n)` is valid only as the iterable of `for`. It evaluates `n` once and
produces `int` values from zero, inclusive, to `n`, exclusive. A non-positive
`n` produces no values. `for value in array` evaluates the array expression
once and visits elements in increasing index order. The loop variable has its
own lexical scope and receives a copy of each value.

`defer expression;` registers the expression when execution reaches the
statement. Registered expressions execute once, in last-in-first-out order,
immediately before the current function returns, whether by an explicit return
or by reaching its end. A defer does not run at block exit, `break`, or
`continue`. The expression itself is evaluated at function exit.

## 8. Aggregates, sum types, and generics

Struct fields are stored and initialized by name. An initializer may provide
each field at most once; omitted fields receive their zero values. Field
declaration order determines field order; padding and external ABI layout are
target-defined.

A tuple contains at least two elements. Tuples may be returned and destructured
with `let (a, b, ...) = value;`. Version 0.4.0 provides neither tuple indexing nor
nested destructuring. Tuples are not valid in an `extern` signature.

An enum variant has either no payload or one payload. Construction uses
`Type.Variant(value)` or `Type.Variant()`. `switch` accepts an enum value and
performs one-level payload binding. Without `_`, every variant must appear
exactly once. `_` may appear once and must be last. Missing or duplicate arms
are compile-time errors.

Generic functions, structs, and enums declare type parameters in brackets.
Every use must provide all type arguments explicitly. Each distinct argument
list denotes a distinct monomorphized instance. A generic body receives no
implicit arithmetic, comparison, conversion, or conditional capability for a
type parameter. Required operations must be supplied as ordinary function
pointer parameters. Generic extern declarations, inference, traits,
specialization, and constraint solving are not part of version 0.4.0.

`sizeof[T]()` and `alignof[T]()` produce compile-time `u64` values for a
concrete type. They take exactly one type argument and no value arguments.

A method call `receiver.name(args...)` is syntax for `name(receiver, args...)`.
If the first parameter is `*T` and the receiver is an addressable `T`, the
compiler supplies `&receiver`. No method namespace, dynamic dispatch, or
visibility rule is introduced.

## 9. Strings, arrays, pointers, and traps

`str` is an immutable view of bytes for the duration of the view. `len(s)`
returns its runtime `u64` length. `s[i]` returns `u8`. `s[lo:hi]`, omitted-bound
forms, and `s[:]` return views into the same storage. String indexing and
slicing require `0 <= i < len` and `0 <= lo <= hi <= len`; violation traps.

`len(array)` is its compile-time element count. Array and raw-pointer indexing
do not add a runtime bounds check in version 0.4.0; the program must provide a
valid index and live storage. Pointer addition and subtraction scale by the
pointee size. Dereferencing null, invalid, expired, or misaligned pointers is
invalid program behavior.

`str_from_ptr(pointer, length)` creates a view without copying or taking
ownership. `str_ptr(value)` returns its raw byte pointer. The caller must ensure
that the storage remains valid for every use of the view.

A trap terminates the current program and is not recoverable by pplang code.
The host-specific termination mechanism is not standardized.

## 10. Imports, external functions, and system capabilities

`import "relative/path.pp";` includes declarations from a UTF-8 source file
resolved relative to the importing file. `import "@name/path.pp";` includes a
file below the source root mapped to package name `name` by the build
environment. Package names use `[a-z][a-z0-9_-]*`. A package import must contain
a path after the name; path components are separated by `/`, the path must be
relative, must not contain empty, `.` or `..` components or a backslash, and
must resolve inside the mapped package root. An absent mapping,
missing file, or path escaping its package root is a compile-time error.

The `@` prefix makes package and relative resolution disjoint. Implementations
must not fall back from one form to the other based on which files happen to
exist. Both forms include declarations directly into the importing program;
packages do not create namespaces or alter name-collision rules. The same
canonical file is included at most once, so an import cycle terminates when it
reaches an included file.

This specification defines package-import spelling and resolution through a
provided name-to-root map. Dependency versions, source acquisition, checksums,
lockfiles, workspace membership, and registry behavior belong to the build
toolchain rather than the language.

`extern fn` declares a host-provided function. Primitive integers, `float`,
`bool`, and pointers use the target C ABI representation. A `str` parameter is
passed as its byte pointer only; callers that require a length must pass it as a
separate integer parameter. Returning `str`, using tuples, or using unresolved
generic types in an extern signature is a compile-time error. Struct and enum
FFI layout is target-defined and should be mediated by explicit glue code.

Raw pointers, volatile access, port I/O, interrupt control, clocks, and atomics
are system capabilities supplied by a compiler target or host module. Version
0.4.0 intentionally has no source-level `unsafe` or `asm` syntax. The presence of
a builtin on one target does not make it portable to another target.

## 11. Defined boundaries

The following are outside pplang 0.4.0: garbage collection, ownership and borrow
checking, optional-pointer syntax, traits and interfaces, generic inference,
type sets, specialization, compile-time metaprogramming, closures, exceptions,
macros, source-level inline assembly, and the legacy array spelling `[T; N]`.

Target pointer width, object alignment, aggregate padding, calling convention,
available system builtins, and trap delivery are implementation-defined. An
implementation must document these choices. Compiler architecture, IR, object
format, command-line interface, package management, and workspace behavior are
not properties of the language specification.
