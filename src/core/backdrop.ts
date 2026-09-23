import {TourGuideClient} from "../Tour";

/**
 * createTourGuideBackdrop
 */
function createTourGuideBackdrop(this: TourGuideClient) {
    this.backdrop = document.createElement('div')
    this.computeBackdropAttributes()
    document.body.append(this.backdrop)
}

/**
 * computeBackdropAttributes
 */
function computeBackdropAttributes(this: TourGuideClient) {
    if (!this.options) return

    this.backdrop.className = 'tg-backdrop' // reset
    this.backdrop.style.boxShadow = this.options.backdropColor + ' 0 0 1px 2px, ' + this.options.backdropColor + ' 0 0 0 1000vh';

    if (this.options.backdropClass) this.backdrop.classList.add(this.options.backdropClass)
    if (this.options.backdropAnimate) this.backdrop.classList.add('tg-backdrop-animate')
    if (this.options.activeStepInteraction) this.backdrop.classList.add('allow-interaction')
}

/**
 * computeBackdropPosition
 *
 * Positions and sizes the backdrop overlay around the current step's
 * target element.
 *
 * @this TourGuideClient
 */
async function computeBackdropPosition(this: TourGuideClient): Promise<true> {
    if (typeof this.options.targetPadding === "undefined") {
        throw new Error("Options failed to initialize")
    }
    if (!this.backdrop) {
        throw new Error("No backdrop element initialized")
    }

    const stepData = this.tourSteps[this.activeStep]
    if (!stepData) {
        throw new Error(`No step found at index ${this.activeStep}`)
    }

    const targetElem = stepData.target
    if (!(targetElem instanceof HTMLElement)) {
        throw new Error("Step target is not a valid HTMLElement")
    }

    const targetElemRect = targetElem.getBoundingClientRect()
    const padding = this.options.targetPadding
    const halfPadding = padding / 2

    // If the backdrop overlay would extend beyond window width with
    // padding applied, skip the extra padding to avoid overflow.
    const isOverflow = (targetElemRect.width + padding) > document.documentElement.clientWidth

    if (targetElem === document.body) {
        const centeredWidth = 0
        const centeredHeight = 0

        this.backdrop.style.position = "fixed"
        this.backdrop.style.top = (window.innerHeight / 2.5) + "px"
        this.backdrop.style.left = (window.innerWidth / 2) + "px"
        this.backdrop.style.width = centeredWidth + "px"
        this.backdrop.style.height = centeredHeight + "px"

        this.backdrop.style.pointerEvents = stepData.propagateEvents ? 'none' : ''

        return true
    }

    if (stepData.fixed) {
        this.backdrop.style.position = "fixed"
        this.backdrop.style.top = (targetElemRect.top - halfPadding) + "px"
        this.backdrop.style.left = (isOverflow ? targetElemRect.x : targetElemRect.x - halfPadding) + "px"
    } else {
        this.backdrop.style.position = "absolute"
        this.backdrop.style.top = (window.scrollY + targetElemRect.top - halfPadding) + "px"
        this.backdrop.style.left = (isOverflow ? targetElemRect.x : targetElemRect.x - halfPadding) + "px"
    }

    this.backdrop.style.pointerEvents = stepData.propagateEvents ? 'none' : ''
    this.backdrop.style.width = (isOverflow ? targetElemRect.width : (targetElemRect.width + padding)) + "px"
    this.backdrop.style.height = (targetElemRect.height ? targetElemRect.height + padding : targetElemRect.height) + "px"

    return true
}

export {createTourGuideBackdrop, computeBackdropAttributes, computeBackdropPosition}
