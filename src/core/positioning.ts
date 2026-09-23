import {TourGuideClient} from "../Tour";
import {computeBackdropPosition} from "./backdrop";
import {computeDialogPosition} from "./dialog";

/**
 * Duration (ms) of the CSS transition for backdrop/dialog position
 * changes. Must match the corresponding `transition` duration in the
 * `.animate-position` CSS class.
 */
const POSITION_ANIMATION_DURATION_MS = 300

/**
 * computeTourPositions
 *
 * Recomputes and applies backdrop and dialog positioning for the
 * currently active step.
 *
 * @this TourGuideClient
 */
async function computeTourPositions(this: TourGuideClient): Promise<true> {
    /**
     * Update overlay position
     */
    this.backdrop.style.display = "block"
    await computeBackdropPosition.call(this)

    /**
     * Update dialog position
     */
    this.dialog.style.display = 'block'

    const shouldAnimate = this.options.dialogAnimate

    if (shouldAnimate && this.isVisible) {
        this.dialog.classList.add('animate-position') // add transition class
    }

    await computeDialogPosition.call(this)

    this.isVisible = true

    if (!shouldAnimate) {
        // No transition active - resolve immediately without artificial delay
        return true
    }

    // Match timeout with CSS transition & smooth scroll
    return new Promise((resolve) => {
        setTimeout(() => {
            this.dialog.classList.remove('animate-position') // cancel after CSS transition completes
            resolve(true)
        }, POSITION_ANIMATION_DURATION_MS)
    })
}

export default computeTourPositions
