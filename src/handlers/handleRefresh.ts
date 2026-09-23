import {TourGuideClient} from "../Tour";
import computeTourSteps from "../core/steps";
import {renderDialogHtml, updateDialogHtml} from "../core/dialog";
import waitForElm from "../util/util_wait_for_element";

/**
 * handleRefreshTour
 *
 * Fully recomputes tour steps, backdrop attributes and the dialog.
 * Used e.g. after dynamic DOM changes that introduce or remove
 * `data-tg-tour` elements.
 */
async function handleRefreshTour(this: TourGuideClient): Promise<true> {
    if (this._navigationLock) {
        throw new Error("Promise waiting")
    }

    this._navigationLock = true
    try {
        /**
         * Tour steps
         */
        await computeTourSteps.call(this)

        /**
         * Backdrop
         */
        this.computeBackdropAttributes()

        /**
         * Dialog
         */
        await this.refreshDialog()

        return true
    } finally {
        this._navigationLock = false
    }
}

/**
 * handleRefreshDialog
 *
 * Fully re-renders the dialog HTML (e.g. after an options update) and
 * refreshes content, position and event listeners.
 *
 * NOTE: No lock check here, since this function is used both
 * standalone (public API `tour.refreshDialog()`) and from within
 * `handleRefreshTour` (already locked there). No `activeStep`/
 * `tourSteps` mutation happens here - only a DOM refresh.
 */
async function handleRefreshDialog(this: TourGuideClient): Promise<true> {
    /**
     * Hard-refresh dialog HTML - for option updates or manual refresh calls
     */
    try {
        const htmlResp = await renderDialogHtml.call(this)
        if (htmlResp) this.dialog.innerHTML = htmlResp
    } catch (e) {
        if (this.options.debug) console.warn(e)
    }

    /**
     * Update dialog content
     */
    try {
        await updateDialogHtml.call(this)
    } catch (e) {
        if (this.options.debug) console.warn(e)
        throw e
    }

    /**
     * Update backdrop & dialog positions & display
     */
    await this.updatePositions()

    /**
     * Ensure dialog is visible & rendered in the DOM
     */
    if (this.isVisible) {
        await waitForElm('.tg-dialog', this.options.elementTimeout).then(async () => {
            await this.destroyListeners()
            await this.initListeners()

            // NOTE: intentionally kept disabled, see handleAddStep.ts
            // if (this.options.dialogAnimate) setTimeout(() => {
            //     this.dialog.classList.add('animate-position')
            // }, 600)

            return true
        }).catch((e) => {
            if (this.options.debug) console.warn(e)
        })
    }

    return true
}

export default handleRefreshTour
export {handleRefreshDialog}
