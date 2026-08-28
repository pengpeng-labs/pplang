fn pair() -> (int, bool) {
    return (42, true);
}

fn main() -> int {
    let (number, present) = pair();
    if (present) {
        return number;
    }
    return 0;
}
