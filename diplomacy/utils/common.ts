// Placeholder for common utility functions

/**
 * Calculates the time elapsed since a given start time.
 * @param startTime - The start time (e.g., from Date.now()).
 * @returns A string representing the time elapsed in seconds with one decimal place.
 */
export function time_since(startTime: number): string {
    const elapsedMs = Date.now() - startTime;
    return (elapsedMs / 1000).toFixed(1) + 's';
}

/**
 * Generates a pseudo-random integer between min (inclusive) and max (inclusive).
 * @param min - The minimum possible value.
 * @param max - The maximum possible value.
 * @returns A random integer within the specified range.
 */
export function randint(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add other common utility functions as needed from the Python codebase.
// e.g., deepcopy (though structuredClone is preferred if available),
// specific string manipulations, etc.
