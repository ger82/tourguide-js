import {TourGuideClient} from "../Tour";

/**
 * dotsWrapperHtmlString
 */
function dotsWrapperHtmlString(): string {
    return `<div class="tg-dialog-dots" id="tg-dialog-dots"></div>`
}

/**
 * computeDots
 *
 * Renders the step-progress dots as an HTML string. Uses a simple
 * memoization cache keyed by `activeStep:tourSteps.length` to avoid
 * unnecessary recomputation on frequent calls (e.g. from debounced
 * resize/scroll handlers).
 *
 * @this TourGuideClient
 */
function computeDots(this: TourGuideClient): string {
    if (!this.tourSteps.length) return ""

    const cacheKey = `${this.activeStep}:${this.tourSteps.length}`
    if (this._dotsCache?.key === cacheKey) {
        return this._dotsCache.html
    }

    let dotsHtml = ""
    for (let i = 0; i < this.tourSteps.length; i++) {
        const isActive = i === this.activeStep
        dotsHtml += `<span class="tg-dot${isActive ? ' tg-dot-active' : ''}"></span>`
    }

    this._dotsCache = {key: cacheKey, html: dotsHtml}
    return dotsHtml
}

export {dotsWrapperHtmlString, computeDots}
