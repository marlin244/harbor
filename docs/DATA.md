# Data Model and Storage

## Overview

Harbor uses IndexedDB for client-side data persistence. All data is stored locally in the browser with no server-side synchronization.

## Data Schema

### Rooms Object Store

```typescript
interface Room {
  id: string;           // Primary key
  name: string;
  capacity: number;
  features: string[];
}
```

**Example:**
```json
{
  "id": "r-101",
  "name": "Аудитория 101",
  "capacity": 30,
  "features": ["projector", "whiteboard", "air-conditioning"]
}
```

### Assets Object Store

```typescript
interface Asset {
  id: string;                      // Primary key
  name: string;
  inventoryCode: string;
  status: "available" | "unavailable" | "maintenance";
}
```

**Example:**
```json
{
  "id": "a-proj-1",
  "name": "Проектор Epson",
  "inventoryCode": "PRJ-001",
  "status": "available"
}
```

### Bookings Object Store

```typescript
interface Booking {
  id: string;              // Primary key
  resourceType: "room" | "asset";
  resourceId: string;      // Foreign key (references Room or Asset)
  title: string;
  start: string;           // ISO 8601 UTC: "2025-09-05T08:00:00Z"
  end: string;             // ISO 8601 UTC: "2025-09-05T09:30:00Z"
  notes: string;
}
```

**Indexes:**
- `resourceId` - for efficient queries of bookings by resource
- `start` - for timeline queries
- `end` - for availability checks

**Example:**
```json
{
  "id": "b-1",
  "resourceType": "room",
  "resourceId": "r-101",
  "title": "Семинар по TypeScript",
  "start": "2025-09-05T08:00:00Z",
  "end": "2025-09-05T09:30:00Z",
  "notes": "Нужен HDMI кабель"
}
```

## Time Storage and Handling

### Storage Format
- **Format:** RFC 3339 / ISO 8601
- **Timezone:** UTC (always)
- **Example:** `2025-09-05T08:00:00Z` or `2025-09-05T08:00:00.000Z`

### Display Format
- Times are converted to **local timezone** for display
- User input is in **local timezone**
- Conversion happens automatically in the UI layer

### Why UTC?
1. **Consistency:** Same timestamp regardless of user location
2. **DST Safety:** Avoids ambiguities at daylight saving time boundaries
3. **Calculations:** Interval overlap detection is unambiguous
4. **Portability:** Data can be shared across timezones without reinterpretation

## Import/Export Format

### Export File Structure

```json
{
  "rooms": [
    { "id": "r-101", "name": "Аудитория 101", "capacity": 30, "features": ["projector"] }
  ],
  "assets": [
    { "id": "a-proj-1", "name": "Проектор Epson", "inventoryCode": "PRJ-001", "status": "available" }
  ],
  "bookings": [
    {
      "id": "b-1",
      "resourceType": "room",
      "resourceId": "r-101",
      "title": "Семинар",
      "start": "2025-09-05T08:00:00Z",
      "end": "2025-09-05T09:30:00Z",
      "notes": "Нужен HDMI"
    }
  ],
  "exportedAt": "2025-09-04T12:00:00Z",
  "schemaVersion": "1.0.0"
}
```

### Filename Convention
- Format: `harbor-YYYY-MM-DD.json`
- Example: `harbor-2025-09-04.json`

## Import Policies

### Merge Policy
- Adds new resources and bookings
- Updates existing items by ID
- Preserves existing data not in the import file
- **Use case:** Incremental updates, combining data from multiple sources

### Replace All Policy
- Clears all existing data
- Imports everything from the file
- **Use case:** Full data restoration, backup recovery

## Validation Rules

### On Import
1. **Schema Validation**
   - Required fields present
   - Correct data types
   - Valid enum values

2. **Referential Integrity**
   - Each booking references an existing room or asset
   - Resource type matches the reference

3. **Time Format Validation**
   - ISO 8601 format compliance
   - Valid date/time values
   - Start time before end time

4. **Conflict Detection**
   - No self-intersecting bookings within import file
   - No conflicts with existing bookings (for merge policy)

### Error Handling
- Invalid records are reported to user
- Import is rejected if errors found
- User can review and fix issues before retry

## IndexedDB Implementation

### Database Name
- `Harbor`

### Version
- `1`

### Object Stores
1. `rooms` - keyPath: `id`
2. `assets` - keyPath: `id`
3. `bookings` - keyPath: `id`
   - Index: `resourceId`
   - Index: `start`
   - Index: `end`

### Operations
- All operations are asynchronous
- Transactions ensure data consistency
- Automatic persistence across browser sessions

## Data Backup Strategy

### Manual Backup
1. Use "Export Data" feature
2. Save JSON file to safe location
3. Can restore anytime using "Import Data"

### Recovery
1. Export current data before major operations
2. Use "Replace All" import to restore from backup
3. Use "Merge" import to combine data

## Performance Considerations

### Indexing
- `resourceId` index speeds up booking queries by resource
- `start` and `end` indexes optimize timeline queries

### Query Patterns
- Get all bookings for a resource: `index('resourceId').getAll(resourceId)`
- Get all bookings: `store.getAll()`
- Filter by date range: Done in application layer (IndexedDB doesn't support range queries on multiple fields)

### Scalability
- IndexedDB can handle thousands of bookings efficiently
- No practical limit for MVP usage
- Consider server-side storage for enterprise scale
