/**
 * Converts "HH:mm" time string to the number of minutes from midnight.
 * @param time "HH:mm"
 * @returns number of minutes, or null if invalid
 */
export const timeToMinutes = (time: string): number | null => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts a number of minutes from midnight to a "HH:mm" time string.
 * @param minutes The number of minutes from midnight.
 * @returns "HH:mm" string.
 */
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes) % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Formats a "HH:mm" time string to "h:mm A" format.
 * @param time "HH:mm"
 * @returns "h:mm A" string or an empty string if invalid
 */
export const formatTime = (time?: string): string => {
  if (!time) return '';
  try {
    const date = new Date(`1970-01-01T${time}:00`);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch(e) {
    return '';
  }
};

/**
 * Calculates the duration between two time strings and formats it.
 * @param startTime "HH:mm"
 * @param endTime "HH:mm"
 * @returns A formatted duration string like "1 hr 30 min", or an empty string.
 */
export const calculateDuration = (startTime?: string, endTime?: string): string => {
  if (!startTime || !endTime) return '';

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return '';
  }

  const durationInMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} hr`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  return parts.join(' ');
};


/**
 * Checks if two time ranges overlap.
 * Assumes start and end times are valid "HH:mm" strings.
 * An interval ends when the next one begins.
 * So [10:00, 11:00] and [11:00, 12:00] do not overlap.
 * @returns boolean true if they overlap
 */
export const doTimesOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const startAMin = timeToMinutes(startA);
  const endAMin = timeToMinutes(endA);
  const startBMin = timeToMinutes(startB);
  const endBMin = timeToMinutes(endB);

  // Handle nulls if time is not set or invalid
  if (startAMin === null || endAMin === null || startBMin === null || endBMin === null) {
      return false;
  }
  
  return startAMin < endBMin && endAMin > startBMin;
};