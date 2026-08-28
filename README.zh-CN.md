# pplang

[English](README.md)

pplang 是小型静态类型系统编程语言 **pp** 的规范仓库。该语言面向显式资源
管理、freestanding 程序、紧凑的编译器实现，以及可预测的源码生成。

当前语言版本是 **0.4.0**。[`spec.md`](spec.md) 是具有规范效力的英文版本，
[`spec.zh-CN.md`](spec.zh-CN.md) 是官方简体中文翻译。两者存在差异时，以英文
规范为准。

## 仓库范围

本仓库定义语言，不绑定某一种编译器实现。

| 路径 | 用途 |
|---|---|
| `spec.md` / `spec.zh-CN.md` | 规范正文与官方中文翻译 |
| `design.md` / `design.zh-CN.md` | 稳定的设计理由与被拒绝方案 |
| `grammar/pp.ebnf` | 可供机器读取的语法 |
| `stdlib.md` / `stdlib.zh-CN.md` | 标准库合同 |
| `stdlib/` | 已发布的标准库源码 |
| `examples/` | 可移植示例程序 |
| `conformance/` | 按版本维护的可观察行为测试 |
| `REFERENCES.md` / `REFERENCES.zh-CN.md` | 理论与语言设计参考资料 |
| `CONTRIBUTING.md` / `CONTRIBUTING.zh-CN.md` | 规范变更与审阅规则 |

参考编译器位于
[`pengpeng-labs/pplc`](https://github.com/pengpeng-labs/pplc)。构建命令、
workspace、依赖解析和包管理属于
[`pengpeng-labs/pptc`](https://github.com/pengpeng-labs/pptc)，不属于语言规范。

## 语言概览

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

0.4.0 版提供值语义 struct 和 enum、穷尽 `switch`、显式单态化泛型、tuple、
定长数组、携带长度的字节字符串、词法作用域、函数指针、显式分配和清晰可见
的裸指针边界。显式 `@package/path.pp` import 把源码合同连接到构建环境提供的
package map，同时不把依赖解析嵌入语言。它不提供垃圾回收、所有权检查器、trait、泛型实参隐式推导、
异常、宏、源码级 `unsafe` 或内联汇编。

## 一致性验证

检查仓库结构和双语文档对应关系：

```bash
node tools/check-repository.mjs
```

通过编译器适配器运行可移植行为测试：

```bash
node tools/run-conformance.mjs /path/to/pp
```

仓库自带的 runner 是当前 `pplc` 命令行接口的适配器。测试 manifest 只定义
接受、拒绝、运行和 trap 等结果，不规定编译器诊断文字或内部实现架构。

## 版本规则

pplang 使用语义化版本标签。补丁版本可以澄清规范、修正测试和文档，但不能
加入语言特性。新增语法或改变可观察语义必须发布新的次版本。

## 许可证

本仓库由使用者选择采用 [Apache License 2.0](LICENSE-APACHE) 或
[MIT License](LICENSE-MIT)。
