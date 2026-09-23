import {TourGuideClient} from "../Tour";
import type {TourGuideOptions} from "../core/options";
import {renderDialogHtml, updateDialogHtml} from "../core/dialog";
import waitForElm from "../util/util_wait_for_element";

/**
 * handleSetOptions
 *
 * Updates tour options at runtime and reflects any changes in the
 * dialog (re-render, backdrop attributes, listener re-init).
 *
 * NOTE: `steps` provided via this method REPLACE `options.steps`
 * wholesale rather than merging with existing steps - by design, this
 * is a distinct code path from `addSteps()`, which appends individual
 * steps. `tourSteps` itself is intentionally not recomputed here; use
 * `refresh()` to resync `tourSteps` after changing `options.steps`.
 *
 * @param options - Partial TourGuideOptions to merge into the current configuration
 */
async function handleSetOptions(this: TourGuideClient, options: TourGuideOptions): Promise<TourGuideClient> {
    if (!options) return this

    if (this._navigationLock) {
        throw new Error("Promise waiting")
    }

    this._navigationLock = true
    try {
        Object.assign(this.options, options)

        /**
         * Backdrop
         */
        this.computeBackdropAttributes()

        /**
         * Dialog
         */
        try {
            const htmlResp = await renderDialogHtml.call(this)
            if (htmlResp) this.dialog.innerHTML = htmlResp
        } catch (e) {
            if (this.options.debug) console.warn(e)
        }

        try {
            await updateDialogHtml.call(this)
        } catch (e) {
            if (this.options.debug) console.warn(e)
        }

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

        return this
    } finally {
        this._navigationLock = false
    }
}

export default handleSetOptions
