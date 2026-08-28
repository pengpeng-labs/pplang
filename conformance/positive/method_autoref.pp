struct Counter { value: int }

fn counter_add(counter: *Counter, amount: int) {
    counter.value = counter.value + amount;
}

fn main() -> int {
    let counter: Counter = Counter { value: 40 };
    counter.counter_add(2);
    return counter.value;
}
