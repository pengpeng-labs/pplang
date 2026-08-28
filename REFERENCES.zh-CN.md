# pplang 参考资料

[English](REFERENCES.md)

以下资料解释 pplang 设计评估中使用的概念和先例，不会覆盖
[`spec.md`](spec.md) 的规范定义。

## 1. 编程语言与编译器

### Types and Programming Languages

Benjamin C. Pierce，*Types and Programming Languages*，MIT Press，2002。

积、和、类型关系、progress 与 preservation 为 struct、enum、穷尽消去和类型
安全提供概念语言。pplang 采用一阶积类型与和类型，但不尝试该书更广泛的子
类型、多态或元理论范围。

### Programming Languages: Application and Interpretation

Shriram Krishnamurthi，*Programming Languages: Application and Interpretation*。

从具体语法逐步构造 AST、环境、求值与类型的方式，启发了 pplang 的要求：
每项语言特性都必须具有小而明确的表示和可测试语义。

### Compilers: Principles, Techniques, and Tools

Alfred V. Aho、Monica S. Lam、Ravi Sethi 与 Jeffrey D. Ullman，*Compilers:
Principles, Techniques, and Tools*，第二版，Addison-Wesley，2006。

词法分析、上下文无关语法、语义分析、中间形式和目标 lowering 构成编译器
模型。pplang 要求这些阶段可以分离，但语言规范不指定 backend 或 IR。

## 2. 计算机系统

### Computer Systems: A Programmer's Perspective

Randal E. Bryant 与 David R. O'Hallaron，*Computer Systems: A Programmer's
Perspective*，第三版，Pearson，2015。

机器表示、链接、调用约定、存储层次和异常控制流，促成了显式整数位宽、FFI
边界、对象布局意识和 freestanding 执行。

### Computer Organization and Design

David A. Patterson 与 John L. Hennessy，*Computer Organization and Design*。

指令集行为、数据通路、存储系统和 I/O 解释了语言为什么保留裸指针和目标
能力，同时将其与可移植源码语义分离。

### Operating Systems: Three Easy Pieces

Remzi H. Arpaci-Dusseau 与 Andrea C. Arpaci-Dusseau，*Operating Systems:
Three Easy Pieces*。

机制与策略分离、显式分配、地址空间、并发和持久化，启发了 pplang 的最小
运行时与宿主边界。语言提供机制，运行环境提供策略。

## 3. 工作负载参考

### Database System Concepts

Abraham Silberschatz、Henry F. Korth 与 S. Sudarshan，*Database System
Concepts*。

记录、类型化值、存储表示、buffer 和索引促成了实用积类型、和类型、字节
容器和显式所有权合同。数据库语义不属于语言。

### Computer Networking: A Top-Down Approach

James F. Kurose 与 Keith W. Ross，*Computer Networking: A Top-Down Approach*。

协议分层、frame、字节序和应用消息促成了携带长度的字节字符串与可移植协议
buffer。网络协议仍是库和宿主服务，而不是语言特性。

## 4. 语言先例

- [The Rust Reference](https://doc.rust-lang.org/reference/) 启发可读表达式语法、
  穷尽和类型消去与显式系统边界。
- [The Zig Language Reference](https://ziglang.org/documentation/master/)
  启发 freestanding 执行、显式分配和目标意识。
- [The Go Language Specification](https://go.dev/ref/spec) 启发简洁声明、长度
  前置数组、迭代和方法调用 desugaring。
- [The Python Language Reference](https://docs.python.org/3/reference/) 启发
  熟悉的切片与成员语法，但不引入动态类型语义。
- [The Ada Reference Manual](https://www.adaic.org/resources/add_content/standards/)
  启发显式泛型实例化与显式操作要求。
- [The OCaml Manual](https://ocaml.org/manual/) 及 ML 家族启发 tagged union、
  payload 绑定与穷尽性。
- C 启发裸指针、C ABI 与最小运行时边界。pplang 不继承 C truthiness、NUL
  结尾字符串语义或隐式指针使用。

语法相似不会导入其他语言的语义。pplang 行为只由 pplang 规范定义。
