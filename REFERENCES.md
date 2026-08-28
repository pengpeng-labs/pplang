# pplang References

[简体中文](REFERENCES.zh-CN.md)

These references explain the concepts and precedents used to evaluate pplang's
design. They do not override [`spec.md`](spec.md).

## 1. Programming languages and compilers

### Types and Programming Languages

Benjamin C. Pierce, *Types and Programming Languages*, MIT Press, 2002.

Products, sums, typing relations, progress, and preservation provide the
conceptual vocabulary for structs, enums, exhaustive elimination, and type
safety. pplang adopts first-order products and sums but does not attempt the
book's broader subtyping, polymorphism, or metatheoretic scope.

### Programming Languages: Application and Interpretation

Shriram Krishnamurthi, *Programming Languages: Application and Interpretation*.

The staged construction from concrete syntax through ASTs, environments,
evaluation, and types informs the requirement that every pplang feature have a
small explicit representation and testable semantics.

### Compilers: Principles, Techniques, and Tools

Alfred V. Aho, Monica S. Lam, Ravi Sethi, and Jeffrey D. Ullman, *Compilers:
Principles, Techniques, and Tools*, second edition, Addison-Wesley, 2006.

Lexical analysis, context-free grammar, semantic analysis, intermediate forms,
and target lowering provide the compiler model. pplang keeps these phases
separable, but the language specification intentionally does not prescribe one
backend or IR.

## 2. Computer systems

### Computer Systems: A Programmer's Perspective

Randal E. Bryant and David R. O'Hallaron, *Computer Systems: A Programmer's
Perspective*, third edition, Pearson, 2015.

Machine representation, linking, calling conventions, memory hierarchy, and
exceptional control flow motivate explicit integer widths, FFI boundaries,
object layout awareness, and freestanding execution.

### Computer Organization and Design

David A. Patterson and John L. Hennessy, *Computer Organization and Design*.

Instruction-set behavior, data paths, memory systems, and I/O explain why the
language preserves raw pointers and target capabilities while separating them
from portable source semantics.

### Operating Systems: Three Easy Pieces

Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau, *Operating Systems: Three
Easy Pieces*.

The separation of mechanism and policy, explicit allocation, address spaces,
concurrency, and persistence informs pplang's minimal-runtime and host-boundary
design. The language supplies mechanisms; an operating environment supplies
policy.

## 3. Workload references

### Database System Concepts

Abraham Silberschatz, Henry F. Korth, and S. Sudarshan, *Database System
Concepts*.

Records, typed values, storage representation, buffers, and indexing motivate
practical product and sum types, byte-oriented containers, and explicit
ownership contracts. Database semantics are not part of the language.

### Computer Networking: A Top-Down Approach

James F. Kurose and Keith W. Ross, *Computer Networking: A Top-Down Approach*.

Layered protocols, framing, byte order, and application messages motivate
length-carrying byte strings and portable protocol buffers. Network protocols
remain libraries and host services rather than language features.

## 4. Language precedents

- [The Rust Reference](https://doc.rust-lang.org/reference/) informs readable
  expression syntax, exhaustive sum elimination, and explicit system boundaries.
- [The Zig Language Reference](https://ziglang.org/documentation/master/)
  informs freestanding execution, explicit allocation, and target awareness.
- [The Go Language Specification](https://go.dev/ref/spec) informs concise
  declarations, length-first arrays, iteration, and method-call desugaring.
- [The Python Language Reference](https://docs.python.org/3/reference/) informs
  familiar slicing and membership notation, without dynamic typing semantics.
- [The Ada Reference Manual](https://www.adaic.org/resources/add_content/standards/)
  informs explicit generic instantiation and explicit operation requirements.
- [The OCaml Manual](https://ocaml.org/manual/) and the ML family inform tagged
  unions, payload binding, and exhaustiveness.
- C informs the raw-pointer, C ABI, and minimal-runtime boundary. pplang does not
  inherit C truthiness, NUL-terminated string semantics, or implicit pointer use.

Syntax similarity never imports another language's semantics. Accepted pplang
behavior is defined only by the pplang specification.
