import {TourGuideClient} from "../Tour";

const FINISHED_TOURS_STORAGE_KEY = "tg_tours_complete"

/**
 * getCompletedTours
 *
 * Safely reads the list of completed tour groups from localStorage.
 */
function getCompletedTours(): string[] {
    try {
        const raw = localStorage.getItem(FINISHED_TOURS_STORAGE_KEY)
        if (!raw) return []
        return raw.split(',').filter(Boolean)
    } catch {
        return []
    }
}

/**
 * setCompletedTours
 *
 * Persists the list of completed tours, or removes the storage key
 * entirely if the list is empty.
 */
function setCompletedTours(tours: string[], debug: boolean): void {
    try {
        if (tours.length === 0) {
            localStorage.removeItem(FINISHED_TOURS_STORAGE_KEY)
        } else {
            localStorage.setItem(FINISHED_TOURS_STORAGE_KEY, tours.join(','))
        }
    } catch (e) {
        if (debug) console.warn("Could not persist finished tour state:", e)
    }
}

/**
 * handleFinishTour
 *
 * Marks the tour group as completed and optionally closes the tour.
 *
 * @param exit - Automatically close the tour after completion (default: true)
 * @param tourGroup - Group key to mark as completed
 * @param _isInternalCall - **Not part of the public API.** Set exclusively
 * by handleVisitStep.ts when the navigation lock is already held by the
 * calling context, to support safe reentrancy.
 */
async function handleFinishTour(
    this: TourGuideClient,
    exit: boolean = true,
    tourGroup: string = "tour",
    _isInternalCall: boolean = false
): Promise<boolean> {
    if (this._navigationLock && !_isInternalCall) {
        throw new Error("Promise waiting")
    }

    // Only acquire the lock if it isn't already held by the calling context.
    const acquiredLock = !this._navigationLock
    if (acquiredLock) this._navigationLock = true

    try {
        if (this._globalFinishCallback) {
            try {
                await this._globalFinishCallback()
            } catch (e) {
                if (this.options.debug) console.warn(e)
                return false
            }
        }

        if (this.options.completeOnFinish) {
            const completedTours = getCompletedTours()
            if (!completedTours.includes(tourGroup)) {
                completedTours.push(tourGroup)
                setCompletedTours(completedTours, Boolean(this.options.debug))
            }
        }

        if (exit) await this.exit()
        this.activeStep = 0

        return true
    } finally {
        if (acquiredLock) this._navigationLock = false
    }
}

/**
 * getIsFinished
 */
function getIsFinished(this: TourGuideClient, tourGroup: string = 'tour'): boolean {
    return getCompletedTours().includes(tourGroup)
}

/**
 * delFinishedTour
 *
 * @param tourGroup - Group key, or "all" to clear every completed tour
 */
function delFinishedTour(this: TourGuideClient, tourGroup: string = 'tour'): void {
    if (tourGroup === "all") {
        setCompletedTours([], Boolean(this.options.debug))
        return
    }
    const remaining = getCompletedTours().filter((x) => x !== tourGroup)
    setCompletedTours(remaining, Boolean(this.options.debug))
}

export default handleFinishTour
export {getIsFinished, delFinishedTour}
