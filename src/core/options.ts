import type { AlignedPlacement, Side } from "@floating-ui/core"
import { TourGuideStep } from "../types/TourGuideStep"

/**
 * TourGuideOptions
 *
 * All properties are optional, since consumers only need to specify
 * values that differ from the defaults. After merging with
 * `defaultOptions` (see util/util_default_options.ts) in the
 * TourGuideClient constructor, virtually all fields are populated at
 * runtime - see `ResolvedTourGuideOptions` below for internal use in
 * handler functions.
 *
 * @public
 */
export interface TourGuideOptions {
  // ---------------------------------------------------------------------
  // Scroll behaviour
  // ---------------------------------------------------------------------
  /** Automatically scroll to the target element when a step is activated. */
  autoScroll?: boolean
  /** Use `scrollIntoView` with `behavior: "smooth"` instead of `"auto"`. */
  autoScrollSmooth?: boolean
  /** Offset (in px) from the viewport edge when auto-scrolling. */
  autoScrollOffset?: number

  // ---------------------------------------------------------------------
  // Backdrop
  // ---------------------------------------------------------------------
  /** Additional CSS class for the backdrop element. */
  backdropClass?: string
  /** Animates the backdrop's position & size on step change. */
  backdropAnimate?: boolean
  /** Backdrop color. Expects a valid CSS color, `rgba(...)` recommended for transparency. */
  backdropColor?: string
  /** Padding (in px) around the highlighted target element. */
  targetPadding?: number

  // ---------------------------------------------------------------------
  // Dialog
  // ---------------------------------------------------------------------
  /** Additional CSS class for the dialog element. */
  dialogClass?: string
  /** Allows the dialog to overlap the target element (see floating-ui `shift.crossAxis`). */
  allowDialogOverlap?: boolean
  /** z-index of the dialog. */
  dialogZ?: number
  /** Fixed width (in px) of the dialog. Recommended when loading images into step content. */
  dialogWidth?: number
  /** Maximum width (in px) of the dialog. */
  dialogMaxWidth?: number
  /** Animates the dialog's position & size on step change. */
  dialogAnimate?: boolean
  /**
   * Preferred placement of the dialog relative to the target element
   * (passed to floating-ui's `computePosition`).
   */
  dialogPlacement?: Side | AlignedPlacement

  // ---------------------------------------------------------------------
  // Buttons & labels
  // ---------------------------------------------------------------------
  /** Text for the "next" button. */
  nextLabel?: string
  /** Text for the "back" button. */
  prevLabel?: string
  /** Text for the button on the final step. */
  finishLabel?: string
  /** Hides the "next" button. */
  hideNext?: boolean
  /** Hides the "back" button. */
  hidePrev?: boolean
  /** Whether to show next/prev buttons at all. */
  showButtons?: boolean
  /** Shows the close button in the dialog header. */
  closeButton?: boolean

  // ---------------------------------------------------------------------
  // Progress indicators
  // ---------------------------------------------------------------------
  /** Shows step-progress dots. */
  showStepDots?: boolean
  /** Placement of the step-progress dots within the dialog. */
  stepDotsPlacement?: "footer" | "body"
  /** Shows textual progress (e.g. "2/5"). */
  showStepProgress?: boolean
  /**
   * Enables the progress bar AND sets its color simultaneously. An
   * empty/undefined value hides the bar.
   */
  progressBar?: string

  // ---------------------------------------------------------------------
  // Behaviour / interaction
  // ---------------------------------------------------------------------
  /** Marks the tour as completed in localStorage on finish (see handleFinishTour.ts). */
  completeOnFinish?: boolean
  /** Enables arrow-key navigation (left/right). */
  keyboardControls?: boolean
  /** Closes the tour on Escape key. */
  exitOnEscape?: boolean
  /** Closes the tour when clicking outside of backdrop/dialog. */
  exitOnClickOutside?: boolean
  /** Resumes the tour on the last active step next time it's started. */
  rememberStep?: boolean
  /** Allows interacting with the currently highlighted target element despite the backdrop. */
  activeStepInteraction?: boolean
  /** Emits debug information via `console.warn`/`console.info`. */
  debug?: boolean
  /**
   * Maximum wait time (in ms) for `waitForElm()` before internal DOM
   * wait operations (e.g. waiting for `.tg-dialog` to appear) are
   * aborted as failed. See util/util_wait_for_element.ts.
   */
  elementTimeout?: number

  // ---------------------------------------------------------------------
  // Steps
  // ---------------------------------------------------------------------
  /** Predefined tour steps (alternative to `data-tg-*` DOM attributes). */
  steps?: TourGuideStep[]
}

/**
 * ResolvedTourGuideOptions
 *
 * Represents the state of `TourGuideClient.options` AFTER merging with
 * `defaultOptions` in the constructor. Since `defaultOptions` provides
 * a value for every field (except `dialogPlacement`, which floating-ui
 * defaults to "bottom" internally), virtually every field is guaranteed
 * to be set at runtime.
 *
 * @public
 */
export type ResolvedTourGuideOptions = Required<
    Omit<TourGuideOptions, "dialogPlacement" | "steps">
> &
    Pick<TourGuideOptions, "dialogPlacement" | "steps">
