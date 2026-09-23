/**
 * Simple debounce utility.
 * Verzögert die Ausführung einer Funktion, bis seit dem letzten Aufruf
 * `wait` Millisekunden vergangen sind. Nützlich für Resize-/Scroll-Handler,
 * um unnötig häufige DOM-Reads/Writes zu vermeiden.
 */
export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    wait: number = 100
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    return function (this: unknown, ...args: Parameters<T>) {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            fn.apply(this, args)
        }, wait)
    }
}
