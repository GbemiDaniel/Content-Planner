/**
 * Formats an ISO date string into a `yyyy-MM-ddThh:mm` format suitable for datetime-local input fields.
 * It correctly handles timezone offsets to display the local time.
 * @param isoString - The ISO date string to format.
 * @returns The formatted string, or an empty string if the input is invalid.
 */
export const formatDateTimeForInput = (isoString?: string | null): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // getTimezoneOffset returns the difference in minutes, convert it to milliseconds
        const tzoffset = date.getTimezoneOffset() * 60000; 
        // Subtract the offset to get the local time, then format as ISO string
        const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
        return localISOTime;
    } catch (e) {
        console.error("Error formatting date:", e);
        return '';
    }
};
