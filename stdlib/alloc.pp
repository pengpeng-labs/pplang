/* Explicit allocator boundary. The host provides malloc/free; a freestanding
   environment may replace this module with its own allocator. */

extern fn malloc(size: u64) -> *u8;
extern fn free(ptr: *u8);

/* Allocate size bytes and return null on failure. */
fn alloc(size: int) -> *u8 {
    return malloc(size as u64);
}

/* Release a pointer returned by alloc. */
fn dealloc(ptr: *u8) {
    free(ptr);
}
