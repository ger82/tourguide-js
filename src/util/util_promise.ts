/**
 * isPromise
 *
 * Checks whether a value is a "thenable" (a Promise or Promise-like object).
 *
 * @param value - The value to check
 */
function isPromise(value: unknown): value is Promise<unknown> {
    return (
        value !== null &&
        typeof value === 'object' &&
        typeof (value as { then?: unknown }).then === 'function'
    )
}

/**
 * returnsPromise
 *
 * Heuristically checks whether a function returns a Promise.
 *
 * ⚠️ IMPORTANT LIMITATION: This check is only reliable for `async
 * function`s - every async function ALWAYS returns a Promise, which can
 * be detected without calling it (`f.constructor.name === 'AsyncFunction'`).
 * For REGULAR functions that manually return a Promise (e.g.
 * `function foo() { return new Promise(...) }`), this cannot be
 * determined in JavaScript without actually calling the function.
 *
 * This function intentionally does NOT call `f()` to test its return
 * value - doing so would be unsafe if `f` has side effects (e.g. a
 * consumer-provided lifecycle callback like `beforeEnter`/`onFinish`),
 * as the test itself would trigger those side effects unintentionally.
 * As a result, this function conservatively returns `false` for regular
 * functions rather than invoking them.
 *
 * @param f - The function to check
 */
function returnsPromise(f: (...args: unknown[]) => unknown): boolean {
    return f.constructor.name === 'AsyncFunction'
}

export {isPromise, returnsPromise}
