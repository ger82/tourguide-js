/**
 * TourGuideStep
 *
 * Describes a single step of the tour.
 *
 * @public
 */
interface TourGuideStep {
    /** Dialog title for this step. */
    title?: string

    /**
     * Dialog content. If a string is provided it's set as `innerHTML`
     * (see core/dialog.ts `updateDialogHtml`); if an HTMLElement/Element
     * is provided it's appended into the dialog body.
     */
    content: string | HTMLElement | Element

    /**
     * Target element highlighted during this step.
     * - `string`: resolved via `document.querySelector()`
     *   (see core/steps.ts, handlers/handleVisitStep.ts).
     * - `undefined`: falls back to `document.body` at runtime
     *   (centered dialog, no backdrop highlight).
     */
    target?: HTMLElement | string

    /**
     * Optional alternative element the dialog is positioned against
     * (if different from the highlighted `target`).
     */
    dialogTarget?: HTMLElement | string

    /**
     * Positions the backdrop as `fixed` instead of `absolute` - relevant
     * for target elements inside `position: fixed` containers (e.g.
     * sticky headers). Runtime default: `false`
     * (see core/steps.ts `parseBooleanDataAttribute`).
     */
    fixed?: boolean

    /**
     * Sort priority among (optionally grouped) tour steps. Lower values
     * are shown first. Runtime default: `999` (see core/steps.ts).
     */
    order?: number

    /**
     * @internal
     * Managed exclusively by `computeTourSteps()` (core/steps.ts) for
     * stable sorting when `order` values are equal. Do not set this
     * manually as a library consumer.
     */
    _index?: number

    /**
     * Group key. Enables multiple independent tours on the same page
     * (see `TourGuideClient.start(group)`).
     */
    group?: string

    /**
     * Allows clicks/interactions within the highlighted backdrop area
     * instead of blocking them. Runtime default: `false`
     * (see core/steps.ts `parseBooleanDataAttribute`).
     */
    propagateEvents?: boolean

    // ---------------------------------------------------------------
    // Lifecycle hooks
    // ---------------------------------------------------------------

    /** Called before this step becomes active (can abort navigation by throwing). */
    beforeEnter?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => (void | Promise<unknown>)

    /** Called after this step has become active. */
    afterEnter?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => (void | Promise<unknown>)

    /** Called before this step is left (can abort navigation by throwing). */
    beforeLeave?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => (void | Promise<unknown>)

    /** Called after this step has been left. */
    afterLeave?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => (void | Promise<unknown>)
}

export type {TourGuideStep}
