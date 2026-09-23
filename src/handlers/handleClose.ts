import {TourGuideClient} from "../Tour";

/**
 * handleClose
 *
 * Closes the tour: hides dialog/backdrop, removes listeners, and
 * triggers exit callbacks.
 *
 * Uses the dedicated `_exitLock` (separate from `_navigationLock`) so
 * the tour can be closed even while a navigation is in progress.
 */
async function handleClose(this: TourGuideClient): Promise<true> {
    if (this._exitLock) {
        throw new Error("Promise waiting")
    }

    this._exitLock = true
    try {
        if (this._globalBeforeExitCallback) {
            await this._globalBeforeExitCallback()
        }

        this.dialog.style.display = "none"
        this.backdrop.style.display = "none"
        this.isVisible = false
        if (!this.options.rememberStep) this.activeStep = 0

        if (this.options.debug) console.info("Tour exited")

        document.body.classList.remove('tg-no-interaction')

        await this.destroyListeners()

        return true
    } finally {
        this._exitLock = false

        if (this._globalAfterExitCallback) {
            Promise.resolve(this._globalAfterExitCallback()).catch((e) => {
                if (this.options.debug) console.warn(e)
            })
        }
    }
}

export default handleClose
