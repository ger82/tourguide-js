import {TourGuideClient} from "../Tour";
import waitForElm from "../util/util_wait_for_element";
import computeTourSteps from "../core/steps";

/**
 * handleTourStart
 *
 * Starts the tour: computes steps, navigates to the first (or
 * remembered) step, and initializes event listeners.
 *
 * NOTE: The navigation lock is only held around the `computeTourSteps`
 * call, NOT around `visitStep()` - since `handleVisitStep` already
 * manages its own lock for the entire navigation duration. Wrapping the
 * whole function body in a single lock would cause `visitStep()` to
 * immediately fail with "Promise waiting" (a self-deadlock).
 *
 * @param group - Optional group key to start only a specific step group
 */
async function handleTourStart(this: TourGuideClient, group?: string): Promise<true> {
    if (this.isVisible) {
        if (this.options.debug) console.warn('Tour already active')
        throw new Error("Tour already active")
    }

    if (this._navigationLock) {
        throw new Error("Promise waiting")
    }

    if (group) this.group = group
    if (this.options.debug) console.info('Start tour')

    /**
     * Tour steps
     */
    this._navigationLock = true
    try {
        await computeTourSteps.call(this)
    } catch (e) {
        if (this.options.debug) console.warn(e)
        throw e
    } finally {
        this._navigationLock = false
    }

    /**
     * Go to the initial step
     */
    try {
        await this.visitStep(this.activeStep)
    } catch (e) {
        if (this.options.debug) console.warn(e)
        throw e
    }

    /**
     * Ensure dialog is rendered in the DOM
     */
    await waitForElm('.tg-dialog', this.options.elementTimeout).then(async () => {
        await this.initListeners()

        if (this.options.dialogAnimate) this.dialog.classList.add('animate-position')

        if (!this.options.exitOnClickOutside) {
            document.body.classList.add('tg-no-interaction')
        }
    }).catch((e) => {
        if (this.options.debug) console.warn(e)
    })

    return true
}

export default handleTourStart
