fn strlen(s: str) -> int {
    return len(s) as int;
}

fn strcmp(a: str, b: str) -> int {
    let i: int = 0;
    let an: int = len(a) as int;
    let bn: int = len(b) as int;
    while (i < an && i < bn) {
        let ca: int = a[i] as int;
        let cb: int = b[i] as int;
        if (ca != cb) {
            return ca - cb;
        }
        i = i + 1;
    }
    return an - bn;
}

/* Copy every source byte. The caller provides capacity and any terminator. */
fn str_copy(dst: *u8, src: str) -> int {
    let n: int = len(src) as int;
    let i: int = 0;
    while (i < n) {
        dst[i] = src[i];
        i = i + 1;
    }
    return n;
}

/* C-string boundary helper for FFI. Ordinary str code uses len(s). */
fn cstr_len(src: *u8) -> int {
    let n: int = 0;
    while (src[n] != 0) {
        n = n + 1;
    }
    return n;
}
