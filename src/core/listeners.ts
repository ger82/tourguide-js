import {TourGuideClient} from "../Tour";

/**
 * Checks whether a point (e.g. click coordinates) lies within a rect.
 */
function isPointInRect(x: number, y: number, rect: DOMRect): boolean {
    return x >= rect.x && x <= rect.x + rect.width
        && y >= rect.y && y <= rect.y + rect.height
}

/**
 * clickOutsideHandler
 */
const clickOutsideHandler = async function (this: TourGuideClient, event: MouseEvent) {
    if (!(event.target instanceof Element)) return

    // Ignore clicks inside the backdrop focus area
    const backdropRect = this.backdrop.getBoundingClientRect()
    if (isPointInRect(event.clientX, event.clientY, backdropRect)) return

    // Ignore clicks inside the dialog area
    const dialogRect = this.dialog.getBoundingClientRect()
    if (isPointInRect(event.clientX, event.clientY, dialogRect)) return

    // Ignore clicks on the dialog itself (fallback for elements rendered
    // outside the dialog's visual rect, e.g. portal-based dropdowns)
    if (this.dialog.contains(event.target)) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    await this.exit()
}

/**
 * keyPressHandler
 */
const keyPressHandler = async function (this: TourGuideClient, event: KeyboardEvent) {
    if (event.key === "Escape" && this.options.exitOnEscape) {
        event.preventDefault()
        await this.exit()
        return
    }

    if (event.key === "ArrowRight" && this.options.keyboardControls) {
        event.preventDefault()
        this.visitStep("next").catch((e) => {
            if (this.options.debug) console.warn(e)
        })
        return
    }

    if (event.key === "ArrowLeft" && this.options.keyboardControls) {
        event.preventDefault()
        this.visitStep("prev").catch((e) => {
            if (this.options.debug) console.warn(e)
        })
        return
    }
}

type TrackedEventKey = keyof TourGuideClient["_trackedEvents"]

/**
 * Describes HOW a tracked event is attached/detached:
 * - getTarget: returns the DOM element/window the listener binds to
 *   (as a function, since e.g. dialog buttons are re-created in the
 *   DOM on every step change)
 * - eventName: the native event name
 * - options: addEventListener options (e.g. passive for scroll/resize)
 */
interface ListenerDefinition {
    getTarget: () => EventTarget | null
    eventName: string
    options?: boolean | AddEventListenerOptions
}

const listenerDefinitions: Record<TrackedEventKey, ListenerDefinition> = {
    nextBtnClickEvent: {
        getTarget: () => document.getElementById("tg-dialog-next-btn"),
        eventName: "click",
    },
    prevBtnClickEvent: {
        getTarget: () => document.getElementById("tg-dialog-prev-btn"),
        eventName: "click",
    },
    closeBtnClickEvent: {
        getTarget: () => document.getElementById("tg-dialog-close-btn"),
        eventName: "click",
    },
    outsideClickEvent: {
        getTarget: () => document.body,
        eventName: "click",
        // not passive: handler calls preventDefault()
    },
    keyPressEvent: {
        getTarget: () => window,
        eventName: "keydown",
        // not passive: handler calls preventDefault()
    },
    resizeEvent: {
        getTarget: () => window,
        eventName: "resize",
        options: {passive: true},
    },
    scrollEvent: {
        getTarget: () => window,
        eventName: "scroll",
        options: {passive: true},
    },
}

/**
 * attachTrackedEvent
 * Attaches exactly one tracked event listener, provided the target
 * element exists and the listener isn't already initialized.
 */
function attachTrackedEvent(this: TourGuideClient, key: TrackedEventKey): void {
    const tracked = this._trackedEvents[key]
    if (tracked.initialized) return

    const def = listenerDefinitions[key]
    const target = def.getTarget()
    if (!target) return

    target.addEventListener(def.eventName, tracked.fn as EventListener, def.options)
    tracked.initialized = true
}

/**
 * detachTrackedEvent
 * Removes exactly one tracked event listener, provided it's currently
 * initialized.
 */
function detachTrackedEvent(this: TourGuideClient, key: TrackedEventKey): void {
    const tracked = this._trackedEvents[key]
    if (!tracked.initialized) return

    const def = listenerDefinitions[key]
    const target = def.getTarget()
    if (target) {
        target.removeEventListener(def.eventName, tracked.fn as EventListener, def.options)
    }
    tracked.initialized = false
}

/**
 * handleInitListeners
 */
async function handleInitListeners(this: TourGuideClient): Promise<true> {
    if (this.options.showButtons) {
        attachTrackedEvent.call(this, "nextBtnClickEvent")
        attachTrackedEvent.call(this, "prevBtnClickEvent")
    }
    if (this.options.closeButton) {
        attachTrackedEvent.call(this, "closeBtnClickEvent")
    }
    if (this.options.exitOnClickOutside) {
        attachTrackedEvent.call(this, "outsideClickEvent")
    }
    if (this.options.keyboardControls || this.options.exitOnEscape) {
        attachTrackedEvent.call(this, "keyPressEvent")
    }
    attachTrackedEvent.call(this, "resizeEvent")
    attachTrackedEvent.call(this, "scrollEvent")

    return true
}

/**
 * handleDestroyListeners
 */
async function handleDestroyListeners(this: TourGuideClient): Promise<true> {
    if (this.options.showButtons) {
        detachTrackedEvent.call(this, "nextBtnClickEvent")
        detachTrackedEvent.call(this, "prevBtnClickEvent")
    }
    if (this.options.closeButton) {
        detachTrackedEvent.call(this, "closeBtnClickEvent")
    }
    if (this.options.exitOnClickOutside) {
        detachTrackedEvent.call(this, "outsideClickEvent")
    }
    if (this.options.keyboardControls || this.options.exitOnEscape) {
        detachTrackedEvent.call(this, "keyPressEvent")
    }
    detachTrackedEvent.call(this, "resizeEvent")
    detachTrackedEvent.call(this, "scrollEvent")

    return true
}

export {
    handleInitListeners,
    handleDestroyListeners,
    clickOutsideHandler,
    keyPressHandler,
}
