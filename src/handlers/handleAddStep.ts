import {TourGuideClient} from "../Tour";
import {TourGuideStep} from "../types/TourGuideStep";
import computeTourSteps from "../core/steps";
import {updateDialogHtml} from "../core/dialog";
import waitForElm from "../util/util_wait_for_element";

/**
 * handleAddStep
 *
 * Adds new steps to the running tour and, if the tour is currently
 * visible, refreshes dialog content, positioning and event listeners.
 *
 * @param newSteps - Array of new TourGuideStep definitions
 */
async function handleAddStep(this: TourGuideClient, newSteps: TourGuideStep[]): Promise<void> {
    if (this._navigationLock) {
        throw new Error("Promise waiting")
    }

    if (!this.options.steps) {
        if (this.options.debug) {
            console.warn("handleAddStep: this.options.steps is undefined - new steps were not added")
        }
        return
    }

    this._navigationLock = true
    try {
        // Add steps
        this.options.steps.push(...newSteps)

        // recompute tour steps
        await computeTourSteps.call(this)

        if (!this.isVisible) return

        // update dialog HTML (reflect new steps in dots)
        await updateDialogHtml.call(this).catch((e) => {
            if (this.options.debug) console.warn(e)
        })

        // recompute dialog & backdrop positioning
        await this.updatePositions().catch((e) => {
            if (this.options.debug) console.warn(e)
        })

        /**
         * If the dialog is rendered in the DOM
         */
        await waitForElm('.tg-dialog', this.options.elementTimeout).then(async () => {
            /**
             * Re-init listeners
             * Double initialization is handled inside the handler
             */
            await this.destroyListeners()
            await this.initListeners()

            // NOTE: intentionally kept disabled - adding the transition
            // class after an additional delay to prevent the dialog
            // "flying in" from a random position. Left here as a known,
            // documented trade-off rather than dead code to be deleted.
            // if (this.options.dialogAnimate) setTimeout(() => {
            //     this.dialog.classList.add('animate-position')
            // }, 600)

            return true
        }).catch((e) => {
            if (this.options.debug) console.warn(e)
        })
    } finally {
        this._navigationLock = false
    }
}

export default handleAddStep
