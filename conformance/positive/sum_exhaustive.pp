enum Value { Number(int), None }

fn read(value: Value) -> int {
    switch value {
        Value.Number(number) { return number; }
        Value.None { return 0; }
    }
}

fn main() -> int {
    return read(Value.Number(42));
}
