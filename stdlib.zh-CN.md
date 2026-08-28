# pplang 0.4.0 标准库

[English](stdlib.md)

本文定义 [`stdlib/`](stdlib/) 中已发布标准库源码的 API 与所有权合同。标准库
不同于编译器 builtin 和目标相关系统模块。

## 1. 通用合同

标准库在可行时使用 pplang 编写，不要求垃圾回收器，并采用显式分配。除非另有
说明，接收裸指针的函数要求该指针在每次访问时有效且满足对齐要求。

拥有型容器必须且只能由对应 `*_free` 函数释放一次。复制拥有型容器只复制
指针字段，不复制 allocation，因此多个副本不能分别释放。借用 `str` 视图只
在 owner 仍然存活且未发生使其失效的修改时有效。

## 2. 宿主分配

模块：`stdlib/alloc.pp`

| 函数 | 合同 |
|---|---|
| `alloc(size: int) -> *u8` | 分配 `size` 字节。`size` 必须非负，失败返回 null。 |
| `dealloc(pointer: *u8)` | 释放 `alloc` 返回的指针；允许 null。 |

宿主版本委托 C `malloc` 和 `free`。freestanding 宿主可以提供等价 allocator
边界，而不导入该模块。

## 3. 数学

模块：`stdlib/math.pp`

| 函数 | 合同 |
|---|---|
| `abs(value: int) -> int` | 返回绝对值；最小 `int` 遵循整数回绕规则。 |
| `min(left: int, right: int) -> int` | 返回较小值。 |
| `max(left: int, right: int) -> int` | 返回较大值。 |

## 4. 字节字符串

模块：`stdlib/string.pp`

| 函数 | 合同 |
|---|---|
| `strlen(value: str) -> int` | 返回转换为 `int` 的字节长度。 |
| `strcmp(left: str, right: str) -> int` | 按无符号字节执行字典序比较；零表示相等。 |
| `str_copy(dst: *u8, src: str) -> int` | 复制全部字节并返回数量。`dst` 至少具有 `len(src)` 个可写字节；不追加终止符。 |
| `cstr_len(src: *u8) -> int` | 扫描有效的 NUL 结尾 C 字符串，仅用于 FFI。 |

子串使用语言切片语法，不另设库函数。

## 5. 可增长字节缓冲

模块：`stdlib/buf.pp`

`Buf` 拥有 `data` allocation。`buf_new` 的最小容量为八。

| 函数 | 合同 |
|---|---|
| `buf_new(initial_cap: int) -> Buf` | 创建空缓冲；分配失败返回 `{data: null, len: 0, cap: 0}`。 |
| `buf_reserve(buf: *Buf, needed: int) -> bool` | 在不改变长度的情况下保证容量；失败返回 false 并保持原缓冲。 |
| `buf_push(buf: *Buf, value: u8) -> bool` | 追加一个字节。 |
| `buf_append(buf: *Buf, value: str) -> bool` | 追加 `value` 全部字节。 |
| `buf_view(buf: *Buf) -> str` | 借用已初始化前缀；扩容或释放会使视图失效。 |
| `buf_clear(buf: *Buf)` | 将长度设为零并保留容量。 |
| `buf_free(buf: *Buf)` | 释放存储并重置全部字段。 |

缓冲按几何级数增长，push 和 append 的每字节摊销成本为常数。

## 6. 字符串映射

模块：`stdlib/strmap.pp`

`StrMap` 是从 `str` 到 `str` 的 FNV-1a 开放寻址映射，拥有 key 和 value 的
副本，并在负载因子 0.7 时扩容。

| 函数 | 合同 |
|---|---|
| `map_new(initial_cap: int) -> StrMap` | 创建最小容量为八的空 map；零容量表示分配失败。 |
| `map_set(map: *StrMap, key: str, value: str) -> bool` | 插入或替换拥有型副本；分配失败返回 false。 |
| `map_get(map: *StrMap, key: str) -> (bool, str)` | 返回 `(found, borrowed_value)`；替换、删除、扩容或释放会使视图失效。 |
| `map_has(map: *StrMap, key: str) -> bool` | 检查 key 是否存在。 |
| `map_del(map: *StrMap, key: str) -> bool` | 删除 key 及其拥有型副本。 |
| `map_free(map: *StrMap)` | 释放全部 entry 并重置 map。 |

期望查找时间为常数，最坏情况与容量线性相关。

## 7. 泛型 vector

模块：`stdlib/vec.pp`

`Vec[T]` 拥有连续 allocation，并按值复制元素。

| 函数 | 合同 |
|---|---|
| `vec_new[T]() -> Vec[T]` | 创建容量为四的空 vector；0.4.0 要求 allocator 成功。 |
| `vec_push[T](vec: *Vec[T], value: T)` | 复制追加一个值并按几何级数扩容；0.4.0 要求 allocator 成功。 |
| `vec_get[T](vec: *Vec[T], index: int) -> T` | 返回副本；调用方必须保证 `0 <= index < len`。 |
| `vec_free[T](vec: *Vec[T])` | 释放存储并重置全部字段；不会运行元素析构。 |

可失败分配的泛型 vector 留给后续具有破坏性的标准库修订。

## 8. 标准库之外的 builtin

`len`、`sizeof`、`alignof`、`str_from_ptr` 和 `str_ptr` 需要编译器知识，由语言
规范定义。`print` 和 `println` 是宿主 I/O 能力，不是可移植标准库函数。
volatile 内存、端口、中断、时钟和原子操作属于目标文档。
