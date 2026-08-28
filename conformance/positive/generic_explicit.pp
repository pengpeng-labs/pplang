fn identity[T](value: T) -> T {
    return value;
}

fn main() -> int {
    return identity[int](42);
}
