/**
 *
 * ████████╗ ██████╗ ██╗   ██╗██████╗  ██████╗ ██╗   ██╗██╗██████╗ ███████╗         ██╗███████╗
 * ╚══██╔══╝██╔═══██╗██║   ██║██╔══██╗██╔════╝ ██║   ██║██║██╔══██╗██╔════╝         ██║██╔════╝
 *    ██║   ██║   ██║██║   ██║██████╔╝██║  ███╗██║   ██║██║██║  ██║█████╗           ██║███████╗
 *    ██║   ██║   ██║██║   ██║██╔══██╗██║   ██║██║   ██║██║██║  ██║██╔══╝      ██   ██║╚════██║
 *    ██║   ╚██████╔╝╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║██████╔╝███████╗    ╚█████╔╝███████║
 *    ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝╚═════╝ ╚══════╝     ╚════╝ ╚══════╝
 *
 */

// CORE
import type {TourGuideOptions} from "./core/options";
import {computeDialogPosition, createTourGuideDialog} from "./core/dialog";
import computeTourPositions from "./core/positioning";
import {computeBackdropAttributes, computeBackdropPosition, createTourGuideBackdrop} from "./core/backdrop";
import {handleOnAfterExit, handleOnAfterStepChange, handleOnBeforeExit, handleOnBeforeStepChange, handleOnFinish} from "./core/callbacks";
import {clickOutsideHandler, handleDestroyListeners, handleInitListeners, keyPressHandler} from "./core/listeners";
// Step Type
import type {TourGuideStep} from "./types/TourGuideStep";
// HANDLERS
import handleVisitStep, {handleVisitNextStep, handleVisitPrevStep} from "./handlers/handleVisitStep";
import handleAddStep from "./handlers/handleAddStep";
import handleTourStart from "./handlers/handleTourStart";
import handleSetOptions from "./handlers/handleSetOptions";
import handleClose from "./handlers/handleClose";
import handleRefreshTour, {handleRefreshDialog} from "./handlers/handleRefresh";
import handleFinishTour, {delFinishedTour, getIsFinished} from "./handlers/handleFinishTour";
// UTIL
import getDefaultOptions from "./util/util_default_options";
import "./scss/tour.scss";

/**
 * TourGuideClient
 *
 * Main class of the TourGuide.js library - creates and controls a
 * guided tour over DOM elements of a page.
 *
 * @public
 */
class TourGuideClient {
    /**
     * Primary elements
     */
    backdrop: HTMLElement
    dialog: HTMLElement

    /**
     * Default attributes
     */
    group: string = ""
    isVisible: boolean = false
    activeStep: number = 0
    tourSteps: TourGuideStep[] = []
    options: TourGuideOptions = getDefaultOptions()

    isFinished: (tourGroup?: string) => boolean = getIsFinished

    /**
     * @internal
     * Lock for navigation operations (step changes, adding steps, tour
     * completion, refresh, options updates). Prevents overlapping
     * mutations of `activeStep`/`tourSteps`.
     */
    _navigationLock = false

    /**
     * @internal
     * Separate lock for the exit flow (see handleClose.ts). Intentionally
     * decoupled from `_navigationLock` so the tour can still be closed
     * while a navigation is in progress (e.g. from within a beforeEnter
     * hook).
     */
    _exitLock = false

    /**
     * @internal
     * Cache for computeDots() - avoids unnecessary recomputation when
     * activeStep/tourSteps haven't changed (e.g. on resize/scroll).
     */
    _dotsCache?: { key: string; html: string }

    /**
     * Constructor
     *
     * @param options - Optional configuration merged with the default options
     */
    constructor(options?: TourGuideOptions) {
        this.dialog = document.createElement('div')
        this.backdrop = document.createElement('div')

        // Clone default options instead of sharing a reference.
        this.options = {...getDefaultOptions(), ...options}

        this.createTourGuideDialog().catch((e) => {
            if (this.options.debug) console.warn(e)
        })
        this.createTourGuideBackdrop()
    }

    /**
     * Backdrop / target highlighter
     */
    private createTourGuideBackdrop = createTourGuideBackdrop

    computeBackdropAttributes: () => void = computeBackdropAttributes

    /**
     * Dialog
     */
    private createTourGuideDialog = createTourGuideDialog


    /**
     * Public methods
     *
     * NOTE: All methods use explicit, narrow type annotations instead of
     * relying on the function types TypeScript would otherwise infer from
     * the assigned handler. Without these annotations, the compiler
     * pulls in the FULL function type of the corresponding handlers/*.ts
     * implementation (including every internally referenced type) into
     * the generated .d.ts - this previously caused numerous
     * "ae-forgotten-export" warnings from api-extractor, since those
     * internal handler symbols would otherwise become part of the
     * public API surface.
     */
    start: (group?: string) => Promise<true> = handleTourStart
    visitStep: (stepIndex: number | "next" | "prev") => Promise<true> = handleVisitStep
    addSteps: (steps: TourGuideStep[]) => Promise<void> = handleAddStep
    nextStep: () => Promise<true> = handleVisitNextStep
    prevStep: () => Promise<true> = handleVisitPrevStep
    exit: () => Promise<true> = handleClose
    refresh: () => Promise<true> = handleRefreshTour
    refreshDialog: () => Promise<true> = handleRefreshDialog
    finishTour: (exit?: boolean, tourGroup?: string) => Promise<boolean> = handleFinishTour
    updatePositions: () => Promise<true> = computeTourPositions
    deleteFinishedTour: (tourGroup?: string) => void = delFinishedTour
    setOptions: (options: TourGuideOptions) => Promise<TourGuideClient> = handleSetOptions


    /**
     * Listeners
     */
    initListeners: () => Promise<true> = handleInitListeners
    destroyListeners: () => Promise<true> = handleDestroyListeners

    /**
     * @internal
     * Read/written by listeners.ts (handleInitListeners/handleDestroyListeners).
     */
    _trackedEvents = {
        nextBtnClickEvent: {
            initialized: false,
            fn: this.nextStep.bind(this)
        },
        prevBtnClickEvent: {
            initialized: false,
            fn: this.prevStep.bind(this)
        },
        closeBtnClickEvent: {
            initialized: false,
            fn: this.exit.bind(this)
        },
        keyPressEvent: {
            initialized: false,
            fn: keyPressHandler.bind(this)
        },
        outsideClickEvent: {
            initialized: false,
            fn: clickOutsideHandler.bind(this)
        },
        resizeEvent: {
            initialized: false,
            fn: debounce(async function (this: TourGuideClient) {
                await computeBackdropPosition.call(this);
                await computeDialogPosition.call(this);
            }.bind(this), 100)
        },
        scrollEvent: {
            initialized: false,
            fn: debounce(async function (this: TourGuideClient) {
                await computeDialogPosition.call(this);
            }.bind(this), 100)
        },
    }


    /**
     * Callbacks
     *
     * @internal
     * Assigned from core/callbacks.ts (handleOnFinish etc.) and read from
     * handlers/*.ts (handleClose, handleFinishTour, handleVisitStep).
     */
    _globalFinishCallback?: () => (void | Promise<unknown>)
    _globalBeforeExitCallback?: () => (void | Promise<unknown>)
    _globalAfterExitCallback?: () => (void | Promise<unknown>)
    _globalBeforeChangeCallback?: (currentStepIndex: number, stepIndex: number) => (void | Promise<unknown>)
    _globalAfterChangeCallback?: (previousStepIndex: number, stepIndex: number) => (void | Promise<unknown>)

    // FINISH
    readonly onFinish: (callback: () => (void | Promise<unknown>)) => void = handleOnFinish
    // EXIT
    readonly onBeforeExit: (callback: () => (void | Promise<unknown>)) => void = handleOnBeforeExit
    readonly onAfterExit: (callback: () => (void | Promise<unknown>)) => void = handleOnAfterExit
    // STEP CHANGE
    readonly onBeforeStepChange: (callback: (currentStepIndex: number, stepIndex: number) => (void | Promise<unknown>)) => void = handleOnBeforeStepChange
    readonly onAfterStepChange: (callback: (previousStepIndex: number, stepIndex: number) => (void | Promise<unknown>)) => void = handleOnAfterStepChange

    /**
     * Removes a previously registered onFinish() callback.
     * Prevents memory leaks on SPA route changes / component unmount,
     * where a callback closure might reference stale state.
     */
    offFinish(): void {
        this._globalFinishCallback = undefined
    }

    offBeforeExit(): void {
        this._globalBeforeExitCallback = undefined
    }

    offAfterExit(): void {
        this._globalAfterExitCallback = undefined
    }

    offBeforeStepChange(): void {
        this._globalBeforeChangeCallback = undefined
    }

    offAfterStepChange(): void {
        this._globalAfterChangeCallback = undefined
    }
}

/**
 * Simple debounce utility for the resize/scroll listeners above.
 */
function debounce<T extends (...args: any[]) => void>(fn: T, wait: number = 100): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    return function (this: unknown, ...args: Parameters<T>) {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            fn.apply(this, args)
        }, wait)
    }
}

export {TourGuideClient}

// Re-export types used in public method signatures. Without this,
// api-extractor reports "ae-forgotten-export" for TourGuideOptions /
// TourGuideStep, since they are referenced in Tour.d.ts but not
// exported by the entry point itself.
export type {TourGuideOptions} from "./core/options"
export type {TourGuideStep} from "./types/TourGuideStep"
