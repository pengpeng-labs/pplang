enum Choice { First, Second }

fn choose(value: Choice) -> int {
    switch value {
        Choice.First { return 1; }
    }
}

fn main() -> int { return choose(Choice.First()); }
