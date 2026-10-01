/**
 * Time utilities for Harbor
 * All internal storage and calculations use UTC (RFC 3339/ISO 8601)
 * Display and user input use local timezone
 */

/**
 * Convert local date/time to UTC ISO string
 * @param date - Date object (interpreted as local time)
 * @returns ISO 8601 UTC string
 */
export function localToUTC(date: Date): string {
  return date.toISOString();
}

/**
 * Convert UTC ISO string to local Date object
 * @param isoString - ISO 8601 UTC string
 * @returns Date object (represents the same moment in time)
 */
export function utcToLocal(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Format UTC ISO string for display in local timezone
 * @param isoString - ISO 8601 UTC string
 * @returns Formatted string like "2025-09-05 14:30"
 */
export function formatUTCForDisplay(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Format UTC ISO string for date input element
 * @param isoString - ISO 8601 UTC string
 * @returns String in format "2025-09-05"
 */
export function formatUTCForDateInput(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format UTC ISO string for time input element
 * @param isoString - ISO 8601 UTC string
 * @returns String in format "14:30"
 */
export function formatUTCForTimeInput(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse local date and time inputs to UTC ISO string
 * @param dateStr - Date string in format "2025-09-05"
 * @param timeStr - Time string in format "14:30"
 * @returns ISO 8601 UTC string
 */
export function parseLocalToUTC(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return date.toISOString();
}

/**
 * Check if two time intervals overlap
 * Intervals are considered overlapping if: start1 < end2 AND end1 > start2
 * Adjacent intervals (end1 === start2) do NOT overlap
 * @param start1 - ISO 8601 UTC string
 * @param end1 - ISO 8601 UTC string
 * @param start2 - ISO 8601 UTC string
 * @param end2 - ISO 8601 UTC string
 * @returns true if intervals overlap
 */
export function intervalsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  
  return s1 < e2 && e1 > s2;
}

/**
 * Get duration in minutes between two UTC timestamps
 * @param start - ISO 8601 UTC string
 * @param end - ISO 8601 UTC string
 * @returns Duration in minutes
 */
export function getDurationMinutes(start: string, end: string): number {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return Math.round((endTime - startTime) / (1000 * 60));
}

/**
 * Add minutes to a UTC timestamp
 * @param isoString - ISO 8601 UTC string
 * @param minutes - Number of minutes to add
 * @returns New ISO 8601 UTC string
 */
export function addMinutes(isoString: string, minutes: number): string {
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

/**
 * Add days to a UTC timestamp (used to generate recurring booking occurrences)
 * @param isoString - ISO 8601 UTC string
 * @param days - Number of days to add
 * @returns New ISO 8601 UTC string
 */
export function addDays(isoString: string, days: number): string {
  const date = new Date(isoString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Get current time as UTC ISO string
 * @returns ISO 8601 UTC string
 */
export function getNowUTC(): string {
  return new Date().toISOString();
}

/**
 * Get start of day (00:00:00) in UTC for a given date
 * @param isoString - ISO 8601 UTC string
 * @returns ISO 8601 UTC string at 00:00:00
 */
export function getStartOfDay(isoString: string): string {
  const date = new Date(isoString);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Get end of day (23:59:59) in UTC for a given date
 * @param isoString - ISO 8601 UTC string
 * @returns ISO 8601 UTC string at 23:59:59
 */
export function getEndOfDay(isoString: string): string {
  const date = new Date(isoString);
  date.setUTCHours(23, 59, 59, 999);
  return date.toISOString();
}
