import {TourGuideClient} from "../Tour";
import {getOverflowAncestors} from "@floating-ui/dom";

/**
 * Short detection window (ms) to determine whether scrollIntoView()
 * actually triggered any scroll movement. Smooth scrolling fires its
 * first `scroll` event within roughly one frame (~16ms), so a short
 * window is enough to reliably distinguish "is scrolling" from
 * "no movement needed".
 */
const SCROLL_DETECTION_WINDOW_MS = 150

/**
 * Idle period (ms) without further scroll events after which an
 * ongoing scroll movement is considered complete.
 */
const SCROLL_IDLE_THRESHOLD_MS = 100

/**
 * isSufficientlyInView
 *
 * Synchronously checks - without any wait time - whether an element is
 * already sufficiently visible within the viewport, accounting for
 * `autoScrollOffset`. Lets us skip the most common case (element is
 * already visible, scrolling would be unnecessary) entirely.
 *
 * @param el - Target element
 * @param offset - Additional safety margin (see `autoScrollOffset` option)
 */
function isSufficientlyInView(el: HTMLElement, offset: number): boolean {
    const rect = el.getBoundingClientRect()
    return (
        rect.top >= offset &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight - offset) &&
        rect.right <= window.innerWidth
    )
}

/**
 * scrollToTarget
 *
 * Scrolls (if necessary) to the target element and waits until the
 * movement has settled - including detection across all scrollable
 * ancestors (not just `window`).
 *
 * @this TourGuideClient
 * @param targetElem - Element to scroll into view
 */
function scrollToTarget(this: TourGuideClient, targetElem: HTMLElement): Promise<true> {
    if (!targetElem.isConnected) {
        if (this.options.debug) {
            console.warn("scrollToTarget: target element is not connected to the DOM")
        }
        return Promise.resolve(true)
    }

    const offset = this.options.autoScrollOffset ?? 0

    // Element is already visible - no movement needed, resolve
    // immediately without even calling scrollIntoView().
    if (isSufficientlyInView(targetElem, offset)) {
        return Promise.resolve(true)
    }

    return new Promise((resolve) => {
        let idleTimer: ReturnType<typeof setTimeout> | undefined
        let detectionTimer: ReturnType<typeof setTimeout> | undefined
        let scrollDetected = false

        const scrollTargets = Array.from(
            new Set<EventTarget>([window, ...getOverflowAncestors(targetElem)])
        )

        const finish = () => {
            scrollTargets.forEach((target) => target.removeEventListener("scroll", onScroll))
            if (idleTimer) clearTimeout(idleTimer)
            if (detectionTimer) clearTimeout(detectionTimer)
            resolve(true)
        }

        const onScroll = () => {
            scrollDetected = true
            if (idleTimer) clearTimeout(idleTimer)
            idleTimer = setTimeout(finish, SCROLL_IDLE_THRESHOLD_MS)
        }

        // Short detection window: if no scroll event arrives within this
        // time, there's most likely no movement happening (or it already
        // completed synchronously) - resolve immediately instead of
        // waiting unnecessarily.
        detectionTimer = setTimeout(() => {
            if (!scrollDetected) finish()
        }, SCROLL_DETECTION_WINDOW_MS)

        scrollTargets.forEach((target) =>
            target.addEventListener("scroll", onScroll, {passive: true})
        )

        targetElem.scrollIntoView({
            behavior: this.options.autoScrollSmooth ? "smooth" : "auto",
            block: "end",
            inline: "nearest",
        })
    })
}

export default scrollToTarget
