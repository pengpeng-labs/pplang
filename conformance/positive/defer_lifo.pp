fn mark(value: int) -> int {
    println(value);
    return 0;
}

fn main() -> int {
    defer mark(1);
    defer mark(2);
    println(0);
    return 0;
}
