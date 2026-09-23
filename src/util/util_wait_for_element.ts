/**
 * Default timeout (ms) used if no instance-specific value is passed.
 * Normally overridden by `TourGuideOptions.elementTimeout`.
 */
const DEFAULT_WAIT_TIMEOUT_MS = 5000

/**
 * waitForElm
 *
 * Waits for an element matching the given CSS selector to appear in
 * the DOM.
 *
 * @param selector - CSS selector of the element to wait for
 * @param timeoutMs - Maximum wait time in ms before the promise rejects.
 * Should typically be populated by the caller with `this.options.elementTimeout`.
 * @returns Promise resolved with the found element
 */
function waitForElm(selector: string, timeoutMs: number = DEFAULT_WAIT_TIMEOUT_MS): Promise<Element> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(selector)
        if (existing) {
            resolve(existing)
            return
        }

        let timeoutId: ReturnType<typeof setTimeout> | undefined

        const cleanup = () => {
            observer.disconnect()
            if (timeoutId) clearTimeout(timeoutId)
        }

        const observer = new MutationObserver(() => {
            const found = document.querySelector(selector)
            if (found) {
                cleanup()
                resolve(found)
            }
        })

        timeoutId = setTimeout(() => {
            cleanup()
            reject(new Error(`waitForElm: timed out after ${timeoutMs}ms waiting for "${selector}"`))
        }, timeoutMs)

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    })
}

export default waitForElm
