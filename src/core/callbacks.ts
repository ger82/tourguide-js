import {TourGuideClient} from "../Tour";

/**
 * Generic helper to validate & assign a callback to a property on the
 * TourGuideClient instance.
 *
 * @param instance - The TourGuideClient instance the callback is assigned to
 * @param propertyKey - The property key under which the callback is stored
 * @param providedCallback - The callback to validate and assign
 * @param callbackName - Name used in the error message (e.g. "onFinish")
 */
function assignCallback<K extends keyof TourGuideClient>(
    instance: TourGuideClient,
    propertyKey: K,
    providedCallback: TourGuideClient[K],
    callbackName: string
): void {
    if (typeof providedCallback !== "function") {
        throw new Error(`Provided callback for ${callbackName} was not a function`)
    }
    instance[propertyKey] = providedCallback
}

/**
 * handleOnFinish
 *
 * @param providedCallback - Callback invoked when the tour completes
 */
function handleOnFinish(
    this: TourGuideClient,
    providedCallback: () => (void | Promise<unknown>)
): void {
    assignCallback(this, "_globalFinishCallback", providedCallback, "onFinish")
}

/**
 * handleOnBeforeExit
 *
 * @param providedCallback - Callback invoked before the tour is closed
 */
function handleOnBeforeExit(
    this: TourGuideClient,
    providedCallback: () => (void | Promise<unknown>)
): void {
    assignCallback(this, "_globalBeforeExitCallback", providedCallback, "onBeforeExit")
}

/**
 * handleOnAfterExit
 *
 * @param providedCallback - Callback invoked after the tour is closed
 */
function handleOnAfterExit(
    this: TourGuideClient,
    providedCallback: () => (void | Promise<unknown>)
): void {
    assignCallback(this, "_globalAfterExitCallback", providedCallback, "onAfterExit")
}

/**
 * handleOnBeforeStepChange
 *
 * @param providedCallback - Callback invoked before every step change
 */
function handleOnBeforeStepChange(
    this: TourGuideClient,
    providedCallback: (currentStepIndex: number, stepIndex: number) => (void | Promise<unknown>)
): void {
    assignCallback(this, "_globalBeforeChangeCallback", providedCallback, "onBeforeStepChange")
}

/**
 * handleOnAfterStepChange
 *
 * @param providedCallback - Callback invoked after every step change
 */
function handleOnAfterStepChange(
    this: TourGuideClient,
    providedCallback: (previousStepIndex: number, stepIndex: number) => (void | Promise<unknown>)
): void {
    assignCallback(this, "_globalAfterChangeCallback", providedCallback, "onAfterStepChange")
}

export {
    handleOnFinish,
    handleOnBeforeExit,
    handleOnAfterExit,
    handleOnBeforeStepChange,
    handleOnAfterStepChange
}
