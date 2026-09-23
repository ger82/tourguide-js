##### Docs

Types
=====

Definitions for TourGuide JS.

### TourGuide

TourGuide JS works by initializing a class, it contains all the relevant events, methods & properties.


```ts
{
    // Primary elements
    backdrop : HTMLElement // The backdrop & element highlighter element
    dialog : HTMLElement // The main tour guide dialog
    // Attributes
    group: string = "" // The internal binding value for the active tour group
    isVisible: boolean = false // If the tour guide is visible/active
    activeStep: number = 0 // The internal binding value for the active tour step (index from 0)
    tourSteps: TourGuideStepType[] = [] // The internal binding value for the tour's steps
    options: TourGuideOptionsType = defaultOptions // The internal binding value for tour options
    isFinished = getIsFinished // A getter for if the tour group is completed (fetches from a record in localStorage)
    // Methods
    start: (group?: string) => Promise<true> // start method handler
    visitStep: (stepIndex: "next" | "prev" | number) => Promise<true> // visitStep method handler
    nextStep: () => Promise<true> // nextStep method handler
    prevStep: () => Promise<true> // prevStep method handler
    addSteps: (newSteps: TourGuideStep[]) => Promise<void> // addSteps method handler
    exit: () => Promise<true> // exit method handler
    refresh: () => Promise<true> // refresh method handler
    refreshDialog: () => Promise<true> // refreshDialog method handler
    finishTour: (exit?: boolean, tourGroup?: string) => Promise<boolean> // finishTour method handler
    updatePositions: () => Promise<true> // updatePositions method handler
    deleteFinishedTour: (tourGroup?: string) => void // Remove a completed tour record from localStorage. Pass a group key, or omit to target the default "tour" group.
    setOptions: (options: TourGuideOptions) => Promise<TourGuideClient> // setOptions method handler
    // Listeners 💡 Only call or modify these for advanced usage
    initListeners: () => Promise<true> // Initialise event listeners for click events, keyboard controls etc.
    destroyListeners: () => Promise<true> // Destroy event listeners for click events, keyboard controls etc.
    // Callback registration
    onFinish: (callback: () => (void | Promise<unknown>)) => void // Register a callback fired when the tour finishes
    onBeforeExit: (callback: () => (void | Promise<unknown>)) => void // Register a callback fired before the tour exits
    onAfterExit: (callback: () => (void | Promise<unknown>)) => void // Register a callback fired after the tour exits
    onBeforeStepChange: (callback: (currentStepIndex: number, stepIndex: number) => (void | Promise<unknown>)) => void // Register a callback fired before each step change
    onAfterStepChange: (callback: (previousStepIndex: number, stepIndex: number) => (void | Promise<unknown>)) => void // Register a callback fired after each step change
    // Callback removal 💡 Prevents memory leaks (e.g. on SPA route changes / component unmount)
    offFinish: () => void // Remove a previously registered onFinish callback
    offBeforeExit: () => void // Remove a previously registered onBeforeExit callback
    offAfterExit: () => void // Remove a previously registered onAfterExit callback
    offBeforeStepChange: () => void // Remove a previously registered onBeforeStepChange callback
    offAfterStepChange: () => void // Remove a previously registered onAfterStepChange callback
}
