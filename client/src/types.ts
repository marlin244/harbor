/**
 * Core data types for Harbor application
 * All timestamps are stored in UTC (RFC 3339/ISO 8601 format)
 */

export type ResourceType = 'room' | 'asset';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  category?: string;
  location?: string;
  requiresApproval?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  inventoryCode: string;
  status: 'available' | 'unavailable' | 'maintenance';
  category?: string;
  location?: string;
  requiresApproval?: boolean;
}

export interface Booking {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  title: string;
  start: string; // ISO 8601 UTC
  end: string;   // ISO 8601 UTC
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'pending' | 'confirmed' | 'cancelled'; // absent = 'confirmed'
  seriesId?: string;
  seriesIndex?: number;
  seriesTotal?: number;
}

export interface AppData {
  rooms: Room[];
  assets: Asset[];
  bookings: Booking[];
  exportedAt?: string;
  schemaVersion?: string;
}

export interface AppNotification {
  id: string;
  type: 'booking_pending' | 'booking_approved' | 'booking_rejected' | 'booking_upcoming';
  message: string;
  relatedBookingId?: string;
  createdAt: string; // ISO 8601 UTC
  read: boolean;
}

export interface ConflictBooking {
  booking: Booking;
  conflictReason: string;
}

export interface BookingValidationResult {
  valid: boolean;
  conflicts: ConflictBooking[];
  suggestedSlots?: SuggestedSlot[];
}

export interface SuggestedSlot {
  start: string; // ISO 8601 UTC
  end: string;   // ISO 8601 UTC
}
