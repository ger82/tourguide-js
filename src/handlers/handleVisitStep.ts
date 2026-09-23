import {TourGuideClient} from "../Tour";
import {updateDialogHtml} from "../core/dialog";
import scrollToTarget from "../core/scrollTo";
import handleFinishTour from "./handleFinishTour";

/**
 * handleVisitStep
 *
 * Central entry point for step navigation. Manages the global
 * navigation lock (`_navigationLock`) for the entire duration of the
 * operation - regardless of whether it ends up calling `finishTour()`
 * or `goToStep()`.
 *
 * @param stepIndex - Target index, or "next"/"prev" for relative navigation
 */
async function handleVisitStep(this: TourGuideClient, stepIndex: "next" | "prev" | number): Promise<true> {
    if (this._navigationLock) {
        throw new Error("Promise waiting")
    }

    let targetIndex: number
    if (stepIndex === "next") {
        targetIndex = this.activeStep + 1
    } else if (stepIndex === "prev") {
        targetIndex = this.activeStep - 1
    } else {
        targetIndex = stepIndex
    }

    this._navigationLock = true
    try {
        // Complete the tour if we've reached the end
        if (targetIndex >= this.tourSteps.length) {
            // Call the internal handler directly (instead of the public
            // `this.finishTour(...)` property, which is intentionally
            // limited to 2 parameters for the public API - see Tour.ts).
            // The third, internal parameter signals to handleFinishTour
            // that `_navigationLock` is already held by this call site
            // (reentrancy guard instead of a deadlock).
            await handleFinishTour.call(this, true, this.group, true)
            return true
        }

        await goToStep.call(this, targetIndex)
        return true
    } finally {
        this._navigationLock = false
    }
}

/**
 * handleVisitNextStep
 */
async function handleVisitNextStep(this: TourGuideClient): Promise<true> {
    return this.visitStep(this.activeStep + 1)
}

/**
 * handleVisitPrevStep
 */
async function handleVisitPrevStep(this: TourGuideClient): Promise<true> {
    return this.visitStep(this.activeStep - 1)
}

/**
 * goToStep
 *
 * Performs the actual step transition: lifecycle callbacks, target
 * element resolution, dialog update, scrolling, positioning.
 *
 * @this TourGuideClient
 * @param stepIndex - Target step index
 */
async function goToStep(this: TourGuideClient, stepIndex: number): Promise<true> {
    // Min/max bounds check
    if (stepIndex >= this.tourSteps.length) {
        throw new Error("End of tour steps")
    }
    if (stepIndex < 0) {
        throw new Error("Start of tour steps")
    }

    const currentStepIndex = this.activeStep
    const currentStep = this.tourSteps[currentStepIndex]
    const nextStep = this.tourSteps[stepIndex]
    if (!nextStep || !currentStep) {
        throw new Error("Step not found by index")
    }

    // Remove active class from current step
    if (currentStep.target instanceof HTMLElement) {
        currentStep.target.classList.remove('tg-active-element')
    }

    const isActualStepChange = stepIndex !== currentStepIndex
    const hasBeforeCallbacks = Boolean(
        (this._globalBeforeChangeCallback && isActualStepChange) ||
        currentStep.beforeLeave ||
        nextStep.beforeEnter
    )

    // Only show loading feedback when async "before" work is actually
    // expected (avoids flicker on fast/synchronous step changes without
    // callbacks).
    if (hasBeforeCallbacks) {
        this.dialog.classList.add('tg-dialog-loading')
    }

    try {
        // Global before-change callback
        if (this._globalBeforeChangeCallback && isActualStepChange) {
            await this._globalBeforeChangeCallback(currentStepIndex, stepIndex)
        }

        // Before-leave callback on the current step
        if (isActualStepChange && currentStep.beforeLeave) {
            await currentStep.beforeLeave(currentStep, nextStep)
        }

        // Before-enter callback for the pending next step
        if (nextStep.beforeEnter) {
            await nextStep.beforeEnter(currentStep, nextStep)
        }

        /**
         * Sanitize step target to an HTMLElement
         */
        if (typeof nextStep.target === "string") {
            const found = document.querySelector(nextStep.target)
            nextStep.target = found instanceof HTMLElement ? found : undefined
        }
        // Fall back to the centered backdrop if target is empty or invalid
        if (!(nextStep.target instanceof HTMLElement)) {
            nextStep.target = document.body
        }

        /** Set active step **/
        this.activeStep = stepIndex

        /**
         * Update dialog HTML
         */
        try {
            await updateDialogHtml.call(this)
        } catch (e) {
            if (this.options.debug) console.warn(e)
            throw e
        }

        /**
         * Scroll to target - awaited so backdrop/dialog positioning
         * below is computed AFTER the scroll has actually settled.
         */
        if (this.options.autoScroll && nextStep.target !== document.body) {
            await scrollToTarget.call(this, nextStep.target)
        }

        /**
         * Update backdrop & dialog positions & display
         */
        await this.updatePositions()

        /** Apply active-element class **/
        if (this.options.activeStepInteraction) {
            nextStep.target.classList.add('tg-active-element')
        }

        /** After callbacks **/
        if (isActualStepChange && currentStep.afterLeave) {
            await currentStep.afterLeave(currentStep, nextStep)
        }
        if (nextStep.afterEnter) {
            await nextStep.afterEnter(currentStep, nextStep)
        }
        if (this._globalAfterChangeCallback && isActualStepChange) {
            await this._globalAfterChangeCallback(currentStepIndex, stepIndex)
        }

        return true
    } finally {
        if (hasBeforeCallbacks) {
            this.dialog.classList.remove('tg-dialog-loading')
        }
    }
}

export default handleVisitStep

export {
    goToStep,
    handleVisitNextStep,
    handleVisitPrevStep,
}
