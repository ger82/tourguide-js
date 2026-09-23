import {TourGuideClient} from "../Tour";
import {TourGuideStep} from "../types/TourGuideStep";

/**
 * Default scroll margin (in px) if neither an individual margin value
 * (`data-tg-margin`) nor `autoScrollOffset`+`targetPadding` are set.
 */
const DEFAULT_SCROLL_MARGIN_PX = 30

/**
 * resolveScrollMarginValue
 *
 * Computes the `scroll-margin` CSS value for a target element.
 *
 * @param instance - TourGuideClient instance (for options.targetPadding/autoScrollOffset)
 * @param explicitMargin - individual margin value (e.g. from `data-tg-margin`), optional
 */
function resolveScrollMarginValue(instance: TourGuideClient, explicitMargin?: string | null): string {
    const {targetPadding, autoScrollOffset} = instance.options

    if (targetPadding && autoScrollOffset) {
        const base = explicitMargin ? Number(explicitMargin) : autoScrollOffset
        return `${base + targetPadding}px 0`
    }

    return `${explicitMargin ?? DEFAULT_SCROLL_MARGIN_PX}px 0`
}

/**
 * parseBooleanDataAttribute
 *
 * Interprets an HTML attribute as a boolean: present (even as an empty
 * string) and not `"false"` => true.
 */
function parseBooleanDataAttribute(value: string | null): boolean {
    return value !== null && value !== "false"
}

/**
 * resolveDialogTarget
 *
 * Resolves a dialogTarget selector string to an HTMLElement.
 */
function resolveDialogTarget(selector: string | null | undefined): HTMLElement | undefined {
    if (!selector) return undefined
    const found = document.querySelector(selector)
    return found instanceof HTMLElement ? found : undefined
}

/**
 * computeTourSteps
 *
 * Builds the final, ordered `tourSteps` array from both
 * `options.steps` and any `[data-tg-tour]` elements found in the DOM.
 *
 * @this TourGuideClient
 */
async function computeTourSteps(this: TourGuideClient): Promise<true> {
    let computedSteps: TourGuideStep[] = []

    /**
     * Process steps from tour options
     */
    if (this.options.steps && this.options.steps.length) {
        computedSteps = this.options.steps.map((originalStep: TourGuideStep): TourGuideStep => {
            // Shallow-clone instead of mutating the caller-supplied object
            const step: TourGuideStep = {...originalStep}

            if (typeof step.target === "string") {
                const targetElement = document.querySelector(step.target)
                if (targetElement instanceof HTMLElement) {
                    step.target = targetElement
                    targetElement.style.scrollMargin = resolveScrollMarginValue(this)
                }
            }
            if (!step.target) step.target = document.body

            if (typeof step.dialogTarget === "string") {
                step.dialogTarget = resolveDialogTarget(step.dialogTarget)
            }

            return step
        })
    }

    /**
     * Process elements using the data-attribute API
     */
    const tourElements: NodeListOf<HTMLElement> = document.querySelectorAll('[data-tg-tour]')

    tourElements.forEach((tourElem: HTMLElement) => {
        const stepTitle = tourElem.getAttribute('data-tg-title')
        const stepContent = tourElem.getAttribute('data-tg-tour')
        const stepGroup = tourElem.getAttribute('data-tg-group')
        const stepOrder = tourElem.getAttribute('data-tg-order')
        const stepFixed = tourElem.getAttribute('data-tg-fixed')
        const scrollMargin = tourElem.getAttribute('data-tg-margin')
        const dialogTargetSelector = tourElem.getAttribute('data-tg-dialog-target')
        const propagateEvents = tourElem.getAttribute('data-tg-propagate-events')

        tourElem.style.scrollMargin = resolveScrollMarginValue(this, scrollMargin)

        computedSteps.push({
            title: stepTitle ?? undefined,
            order: stepOrder ? Number(stepOrder) : 999,
            target: tourElem,
            dialogTarget: resolveDialogTarget(dialogTargetSelector),
            content: stepContent ?? undefined,
            fixed: parseBooleanDataAttribute(stepFixed),
            group: stepGroup ?? undefined,
            propagateEvents: parseBooleanDataAttribute(propagateEvents),
            // TODO: support lifecycle events (beforeEnter/afterEnter/etc.) via data attributes
        } as TourGuideStep)
    })

    /**
     * Filter by group
     */
    if (this.group) {
        computedSteps = computedSteps.filter((step: TourGuideStep) => step.group === this.group)
    }

    /**
     * Apply ordering
     */
    computedSteps.forEach((v, i) => v._index = i)
    computedSteps.sort((a, b) => {
        if (a.order == b.order) {
            return (a._index ?? 0) - (b._index ?? 0)
        }
        return (a.order ?? 0) - (b.order ?? 0)
    })

    this.tourSteps = computedSteps

    if (!this.tourSteps.length) {
        throw new Error("No tour steps detected" + (this.group ? (' in group: ' + this.group) : ''))
    }

    return true
}

export default computeTourSteps
