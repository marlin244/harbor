# Harbor — Specification

## Overview

Harbor is a cross-platform web application for managing room and asset bookings with conflict detection. The application works entirely offline with local data storage, supporting import/export functionality for data portability.

## User Stories

### As a User, I want to:

1. **Browse Resources**
   - View a catalog of all available rooms and assets
   - Search resources by name
   - Filter rooms by capacity
   - See resource details (capacity, features, status)

2. **Create Bookings**
   - Create a new booking for a room or asset
   - Specify resource type, date, time range, title, and notes
   - Receive immediate feedback if the booking conflicts with existing ones
   - See suggested alternative time slots when conflicts occur

3. **Manage Bookings**
   - View all bookings in a timeline/schedule view
   - Edit existing bookings
   - Delete bookings with undo capability
   - See booking details (resource, time, notes)

4. **Handle Conflicts**
   - System prevents overlapping bookings for the same resource
   - Adjacent bookings (end time of one equals start time of another) are allowed
   - Conflict detection happens in UTC to avoid timezone issues
   - User receives clear conflict information with suggested alternatives

5. **Import/Export Data**
   - Export all data (rooms, assets, bookings) as JSON
   - Import data from JSON file
   - Choose between "Replace All" and "Merge" import policies
   - Validate imported data before applying changes

## Business Rules

### Time Management
- All timestamps are stored in **UTC (RFC 3339/ISO 8601 format)**
- User interface displays times in **local timezone**
- All calculations (duration, overlap detection) use UTC
- This prevents errors at DST boundaries and across different system locales

### Booking Validation
- Booking start time must be before end time
- Referenced resource (room/asset) must exist
- No overlapping bookings for the same resource
- Overlap rule: `new.start < existing.end AND new.end > existing.start`
- Adjacent bookings (when `end1 === start2`) do NOT overlap

### Data Integrity
- Referential integrity: each booking references an existing resource
- No self-intersections within imported data
- No conflicts with existing data when merging

## Data Model

### Room
```typescript
{
  id: string;           // Unique identifier
  name: string;         // Room name
  capacity: number;     // Number of people
  features: string[];   // List of features (e.g., "projector", "whiteboard")
}
```

### Asset
```typescript
{
  id: string;                      // Unique identifier
  name: string;                    // Asset name
  inventoryCode: string;           // Inventory code/serial number
  status: 'available' | 'unavailable' | 'maintenance';
}
```

### Booking
```typescript
{
  id: string;              // Unique identifier
  resourceType: 'room' | 'asset';
  resourceId: string;      // Reference to room or asset ID
  title: string;           // Booking title
  start: string;           // ISO 8601 UTC timestamp
  end: string;             // ISO 8601 UTC timestamp
  notes: string;           // Additional notes
}
```

### AppData (Export/Import)
```typescript
{
  rooms: Room[];
  assets: Asset[];
  bookings: Booking[];
  exportedAt?: string;     // ISO 8601 UTC timestamp
  schemaVersion?: string;  // Version of the schema
}
```

## Features

### MVP (Minimum Viable Product)

- [x] Resource catalog with search and filtering
- [x] Create, read, update, delete bookings
- [x] Conflict detection with suggested alternatives
- [x] Timeline view of bookings
- [x] UTC time storage with local timezone display
- [x] Import/export with validation
- [x] IndexedDB for local data persistence
- [x] Cross-platform support (web-based)

### Future Enhancements

- [ ] Recurring bookings
- [ ] Booking notifications
- [ ] User authentication
- [ ] Server-side synchronization
- [ ] Mobile app
- [ ] Calendar view
- [ ] Resource availability heatmap
- [ ] Booking history/audit log

## Constraints

- Application works offline (no server required)
- All data stored locally in browser (IndexedDB)
- No user authentication in MVP
- No real-time collaboration
- Single-device usage (no sync across devices)

## Success Criteria

- ✅ No overlapping bookings for the same resource
- ✅ Correct time handling across timezones
- ✅ Successful import/export with validation
- ✅ Responsive UI on desktop and mobile
- ✅ Cross-platform compatibility (Windows/Linux/Mac)
- ✅ Data persistence across browser sessions
