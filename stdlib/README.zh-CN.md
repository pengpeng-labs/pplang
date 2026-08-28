# pplang 标准库源码

[English](README.md)

本目录包含随 pplang 0.4.0 发布的标准库源码。API、所有权、失败行为和复杂度合同
见 [`../stdlib.zh-CN.md`](../stdlib.zh-CN.md)。

模块包括 `alloc.pp`、`math.pp`、`string.pp`、`buf.pp`、`strmap.pp` 和
`vec.pp`。宿主分配是唯一必需的外部边界。
