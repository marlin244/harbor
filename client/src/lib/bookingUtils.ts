/**
 * Booking validation and business logic utilities
 */

import type { Booking, BookingValidationResult, ConflictBooking, SuggestedSlot } from '@/types';
import { intervalsOverlap, getDurationMinutes, addMinutes, getStartOfDay } from './timeUtils';

/**
 * Validate a booking against existing bookings for the same resource
 * @param booking - Booking to validate
 * @param existingBookings - All existing bookings for the same resource
 * @returns Validation result with conflicts and suggested slots if any
 */
export function validateBooking(
  booking: Booking,
  existingBookings: Booking[]
): BookingValidationResult {
  // Check if start < end
  if (booking.start >= booking.end) {
    return {
      valid: false,
      conflicts: [
        {
          booking,
          conflictReason: 'Start time must be before end time',
        },
      ],
    };
  }

  // Find conflicts
  const conflicts: ConflictBooking[] = [];
  for (const existing of existingBookings) {
    // Skip the same booking (when editing)
    if (existing.id === booking.id) continue;
    // Cancelled bookings no longer hold the slot
    if (existing.status === 'cancelled') continue;

    if (intervalsOverlap(booking.start, booking.end, existing.start, existing.end)) {
      conflicts.push({
        booking: existing,
        conflictReason: `Overlaps with existing booking "${existing.title}"`,
      });
    }
  }

  if (conflicts.length > 0) {
    const suggestedSlots = findSuggestedSlots(booking, existingBookings);
    return {
      valid: false,
      conflicts,
      suggestedSlots,
    };
  }

  return {
    valid: true,
    conflicts: [],
  };
}

/**
 * Find suggested alternative time slots for a booking
 * @param booking - Booking with conflicting time
 * @param existingBookings - All existing bookings for the same resource
 * @returns Array of suggested slots with the same duration
 */
export function findSuggestedSlots(
  booking: Booking,
  existingBookings: Booking[]
): SuggestedSlot[] {
  const duration = getDurationMinutes(booking.start, booking.end);
  const dayStart = getStartOfDay(booking.start);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCHours(23, 59, 59, 999);

  // Sort existing bookings by start time
  const sorted = [...existingBookings]
    .filter((b) => b.id !== booking.id && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const suggestions: SuggestedSlot[] = [];

  // Check slot at the start of the day
  const dayStartTime = new Date(dayStart);
  const firstSlotEnd = addMinutes(dayStart, duration);
  if (!sorted.some((b) => intervalsOverlap(dayStart, firstSlotEnd, b.start, b.end))) {
    suggestions.push({
      start: dayStart,
      end: firstSlotEnd,
    });
  }

  // Check slots after each existing booking
  for (const existing of sorted) {
    const slotStart = existing.end;
    const slotEnd = addMinutes(slotStart, duration);

    // Check if slot fits within the day
    if (new Date(slotEnd).getTime() <= dayEnd.getTime()) {
      // Check if slot doesn't conflict with other bookings
      if (!sorted.some((b) => intervalsOverlap(slotStart, slotEnd, b.start, b.end))) {
        suggestions.push({
          start: slotStart,
          end: slotEnd,
        });
      }
    }
  }

  return suggestions.slice(0, 3); // Return up to 3 suggestions
}

/**
 * Check if there are any self-intersections in a set of bookings
 * @param bookings - Array of bookings
 * @returns Array of conflict pairs or empty if no conflicts
 */
export function checkSelfIntersections(
  bookings: Booking[]
): Array<{ booking1: Booking; booking2: Booking }> {
  const conflicts: Array<{ booking1: Booking; booking2: Booking }> = [];

  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      const b1 = bookings[i];
      const b2 = bookings[j];

      // Only check bookings for the same resource, ignoring cancelled ones
      if (
        b1.resourceType === b2.resourceType &&
        b1.resourceId === b2.resourceId &&
        b1.status !== 'cancelled' &&
        b2.status !== 'cancelled'
      ) {
        if (intervalsOverlap(b1.start, b1.end, b2.start, b2.end)) {
          conflicts.push({ booking1: b1, booking2: b2 });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Check referential integrity of bookings
 * @param bookings - Array of bookings
 * @param roomIds - Set of valid room IDs
 * @param assetIds - Set of valid asset IDs
 * @returns Array of bookings with invalid references
 */
export function checkReferentialIntegrity(
  bookings: Booking[],
  roomIds: Set<string>,
  assetIds: Set<string>
): Booking[] {
  return bookings.filter((booking) => {
    if (booking.resourceType === 'room') {
      return !roomIds.has(booking.resourceId);
    } else if (booking.resourceType === 'asset') {
      return !assetIds.has(booking.resourceId);
    }
    return true;
  });
}

/**
 * Validate ISO 8601 timestamp format
 * @param timestamp - String to validate
 * @returns true if valid ISO 8601 format
 */
export function isValidISO8601(timestamp: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/;
  if (!iso8601Regex.test(timestamp)) {
    return false;
  }

  // Try to parse and ensure it's a valid date
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}
