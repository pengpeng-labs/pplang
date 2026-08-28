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
