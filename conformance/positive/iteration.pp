fn main() -> int {
    let total: int = 0;
    for index in range(4) {
        total = total + index;
    }
    let values: [3]int = [2, 4, 6];
    for value in values {
        total = total + value;
    }
    if (4 in values) {
        return total;
    }
    return 0;
}
