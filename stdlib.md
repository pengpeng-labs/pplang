# pplang 0.3.1 Standard Library

[简体中文](stdlib.zh-CN.md)

This document defines the published API and ownership contract of the standard
library sources in [`stdlib/`](stdlib/). It is distinct from compiler builtins
and target-specific system modules.

## 1. General contract

The standard library is written in pplang where practical. It has no required
garbage collector and uses explicit allocation. A function that receives a raw
pointer requires the pointer to be valid and suitably aligned for every access
unless stated otherwise.

Owned containers must be released exactly once with their matching `*_free`
function. Copying an owned container value copies its pointer fields rather
than its allocation; the copies must not be freed independently. A borrowed
`str` view remains valid only while its owner remains allocated and unchanged.

## 2. Host allocation

Module: `stdlib/alloc.pp`

| Function | Contract |
|---|---|
| `alloc(size: int) -> *u8` | Allocate `size` bytes. `size` must be non-negative. Return null on failure. |
| `dealloc(pointer: *u8)` | Release a pointer returned by `alloc`; null is accepted. |

The hosted module delegates to C `malloc` and `free`. A freestanding host may
provide an equivalent allocator boundary instead of importing this module.

## 3. Mathematics

Module: `stdlib/math.pp`

| Function | Contract |
|---|---|
| `abs(value: int) -> int` | Absolute value; the minimum `int` follows integer wrapping rules. |
| `min(left: int, right: int) -> int` | The lesser value. |
| `max(left: int, right: int) -> int` | The greater value. |

## 4. Byte strings

Module: `stdlib/string.pp`

| Function | Contract |
|---|---|
| `strlen(value: str) -> int` | Return the byte length converted to `int`. |
| `strcmp(left: str, right: str) -> int` | Lexicographic unsigned-byte comparison. Zero means equal. |
| `str_copy(dst: *u8, src: str) -> int` | Copy all bytes and return the count. `dst` must have at least `len(src)` writable bytes. No terminator is appended. |
| `cstr_len(src: *u8) -> int` | Scan a valid NUL-terminated C string. Intended only for FFI. |

Substring operations use the language slice syntax rather than a library
function.

## 5. Growable byte buffer

Module: `stdlib/buf.pp`

`Buf` owns its `data` allocation. `buf_new` uses a minimum capacity of eight.

| Function | Contract |
|---|---|
| `buf_new(initial_cap: int) -> Buf` | Create an empty buffer. Allocation failure returns `{data: null, len: 0, cap: 0}`. |
| `buf_reserve(buf: *Buf, needed: int) -> bool` | Ensure capacity without changing length. Return false and preserve the buffer on allocation failure. |
| `buf_push(buf: *Buf, value: u8) -> bool` | Append one byte. |
| `buf_append(buf: *Buf, value: str) -> bool` | Append all bytes from `value`. |
| `buf_view(buf: *Buf) -> str` | Borrow the initialized prefix. The view is invalidated by growth or free. |
| `buf_clear(buf: *Buf)` | Set length to zero while retaining capacity. |
| `buf_free(buf: *Buf)` | Release storage and reset all fields. |

Growth is geometric. Push and append have amortized constant cost per byte.

## 6. String map

Module: `stdlib/strmap.pp`

`StrMap` is an open-addressed FNV-1a map from `str` to `str`. It owns copies of
both keys and values and grows at a load factor of 0.7.

| Function | Contract |
|---|---|
| `map_new(initial_cap: int) -> StrMap` | Create an empty map with minimum capacity eight. A zero-capacity map represents allocation failure. |
| `map_set(map: *StrMap, key: str, value: str) -> bool` | Insert or replace owned copies. Return false on allocation failure. |
| `map_get(map: *StrMap, key: str) -> (bool, str)` | Return `(found, borrowed_value)`. The view is invalidated by replacement, deletion, growth, or free. |
| `map_has(map: *StrMap, key: str) -> bool` | Test key presence. |
| `map_del(map: *StrMap, key: str) -> bool` | Delete a key and its owned copies. |
| `map_free(map: *StrMap)` | Release all entries and reset the map. |

Expected lookup is constant time; worst-case lookup is linear in capacity.

## 7. Generic vector

Module: `stdlib/vec.pp`

`Vec[T]` owns a contiguous allocation and stores values by copy.

| Function | Contract |
|---|---|
| `vec_new[T]() -> Vec[T]` | Create an empty vector with capacity four. Version 0.3.1 requires allocator success. |
| `vec_push[T](vec: *Vec[T], value: T)` | Append a copied value, growing geometrically. Version 0.3.1 requires allocator success. |
| `vec_get[T](vec: *Vec[T], index: int) -> T` | Return a copy. The caller must provide `0 <= index < len`. |
| `vec_free[T](vec: *Vec[T])` | Release storage and reset all fields. Element destructors are not run. |

Fallible generic vector allocation is reserved for a later, breaking standard
library revision.

## 8. Builtins outside the library

`len`, `sizeof`, `alignof`, `str_from_ptr`, and `str_ptr` require compiler
knowledge and are specified by the language. `print` and `println` are hosted
I/O capabilities, not portable standard-library functions. Volatile memory,
ports, interrupts, clocks, and atomics belong to target documentation.
