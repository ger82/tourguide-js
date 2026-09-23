import type {TourGuideOptions} from "../core/options";

/**
 * getDefaultOptions
 *
 * Returns a fresh default options object on every call. This is
 * intentionally a factory function rather than a static object literal:
 * `steps: []` must be a NEW array on every call, otherwise all
 * `TourGuideClient` instances that don't provide their own `steps`
 * option would share a single array reference (since options are only
 * shallow-cloned via `{...getDefaultOptions(), ...options}` in the
 * constructor). Pushing to one instance's steps would then leak into
 * every other instance.
 */
function getDefaultOptions(): TourGuideOptions {
    return {
        // -----------------------------------------------------------
        // Scroll behaviour
        // -----------------------------------------------------------
        autoScroll: true,
        autoScrollSmooth: true,
        autoScrollOffset: 20,

        // -----------------------------------------------------------
        // Backdrop
        // -----------------------------------------------------------
        backdropClass: "",
        backdropAnimate: true,
        backdropColor: "rgba(20,20,21,0.84)",
        targetPadding: 30,

        // -----------------------------------------------------------
        // Dialog
        // -----------------------------------------------------------
        dialogClass: "",
        allowDialogOverlap: false,
        dialogZ: 999,
        dialogWidth: 0,
        dialogMaxWidth: 340,
        dialogAnimate: true,
        // dialogPlacement intentionally omitted (optional, no sensible
        // default - floating-ui falls back to "bottom" internally)

        // -----------------------------------------------------------
        // Buttons & labels
        // -----------------------------------------------------------
        nextLabel: "Next",
        prevLabel: "Back",
        finishLabel: "Finish",
        hideNext: false,
        hidePrev: false,
        showButtons: true,
        closeButton: true,

        // -----------------------------------------------------------
        // Progress indicators
        // -----------------------------------------------------------
        showStepDots: true,
        stepDotsPlacement: "footer",
        showStepProgress: true,
        progressBar: "",

        // -----------------------------------------------------------
        // Behaviour / interaction
        // -----------------------------------------------------------
        completeOnFinish: true,
        keyboardControls: true,
        exitOnEscape: true,
        exitOnClickOutside: true,
        rememberStep: false,
        activeStepInteraction: true,
        debug: false,
        elementTimeout: 5000,

        // -----------------------------------------------------------
        // Steps
        // -----------------------------------------------------------
        steps: [],
    } satisfies TourGuideOptions
}

export default getDefaultOptions
