# User Interface Documentation

## Application Structure

The Harbor application consists of four main views accessible through tabs:

### 1. Catalog View
**Purpose:** Browse and search all available rooms and assets

**Components:**
- Search bar for filtering by name
- Capacity filter dropdown (for rooms only)
- Two tabs: Rooms and Assets
- Resource cards with details and action buttons

**User Actions:**
- Search by resource name
- Filter rooms by minimum capacity
- Click "Book Room" or "Book Asset" to create a booking

**Layout:**
```
┌─────────────────────────────────────────┐
│ Search [_________] Capacity [dropdown]  │
├─────────────────────────────────────────┤
│ Rooms | Assets                          │
├─────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐     │
│ │ Room 101     │  │ Room 203     │     │
│ │ 30 people    │  │ 20 people    │     │
│ │ [Features]   │  │ [Features]   │     │
│ │ [Book Room]  │  │ [Book Room]  │     │
│ └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────┘
```

### 2. Timeline View
**Purpose:** View bookings for a specific day and manage them

**Components:**
- Date navigation (previous/next day, today button)
- List of bookings for selected day
- Edit and delete buttons for each booking

**User Actions:**
- Navigate between days
- View booking details (title, resource, time, notes)
- Edit existing bookings
- Delete bookings with confirmation

**Layout:**
```
┌─────────────────────────────────────────┐
│ Friday, September 5, 2025  [<] [Today] [>]
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Seminar on TypeScript               │ │
│ │ Room 101 | 08:00 - 09:30            │ │
│ │ Notes: Need HDMI cable              │ │
│ │                        [Edit] [Delete]│ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Team Meeting                        │ │
│ │ Room 101 | 10:00 - 11:00            │ │
│ │                        [Edit] [Delete]│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3. New Booking View
**Purpose:** Create a new booking with conflict detection

**Components:**
- Resource type selector (Room/Asset)
- Resource selector dropdown
- Title input field
- Date, start time, end time inputs
- Notes textarea
- Conflict warning (if applicable)
- Suggested alternative slots (if conflict)
- Create/Cancel buttons

**User Actions:**
- Select resource type and specific resource
- Enter booking details
- Submit form
- If conflict: review suggested slots and click to apply
- Retry with new time or cancel

**Validation:**
- Start time must be before end time
- Resource must be selected
- Title must be provided
- No overlapping bookings for same resource

**Layout:**
```
┌─────────────────────────────────────────┐
│ Create New Booking                      │
├─────────────────────────────────────────┤
│ Resource Type: [Room ▼]                 │
│ Select Room: [Room 101 ▼]               │
│ Title: [Seminar on TypeScript]          │
│ Date: [2025-09-05]                      │
│ Start: [10:00]  End: [11:00]            │
│ Notes: [Need projector]                 │
│                                         │
│ ⚠️ CONFLICT DETECTED                    │
│ Conflicts with:                         │
│ • Team Meeting (10:30-11:30)            │
│                                         │
│ Suggested slots:                        │
│ [11:00-12:00] [13:00-14:00] [14:00-15:00]
│                                         │
│ [Cancel] [Create Booking]               │
└─────────────────────────────────────────┘
```

### 4. Data Import/Export View
**Purpose:** Backup and restore application data

**Components:**
- Export tab: Summary and export button
- Import tab: File selector and import options
- Import preview with validation results
- Policy selector (Merge/Replace All)

**User Actions:**
- Click "Export as JSON" to download backup
- Click "Select JSON File" to import
- Review import preview
- Choose import policy
- Confirm import

**Layout:**
```
┌─────────────────────────────────────────┐
│ Export | Import                         │
├─────────────────────────────────────────┤
│ Export Data                             │
│ ─────────────────────────────────────── │
│ Current data summary:                   │
│ • Rooms: 3                              │
│ • Assets: 5                             │
│ • Bookings: 12                          │
│                                         │
│ [Export as JSON]                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Import Data                             │
│ ─────────────────────────────────────── │
│ [Select JSON File]                      │
│                                         │
│ Import Preview:                         │
│ • Rooms: 3                              │
│ • Assets: 5                             │
│ • Bookings: 12                          │
│                                         │
│ ✅ File validation passed               │
│                                         │
│ Import Policy:                          │
│ ○ Merge (add/update by ID)              │
│ ○ Replace All (clear and import)        │
│                                         │
│ [Cancel] [Import Data]                  │
└─────────────────────────────────────────┘
```

## Booking Form Details

### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Resource Type | Dropdown | Yes | room \| asset |
| Resource | Dropdown | Yes | Must exist |
| Title | Text | Yes | Non-empty string |
| Date | Date Input | Yes | Valid date |
| Start Time | Time Input | Yes | Valid time |
| End Time | Time Input | Yes | Valid time, > start |
| Notes | Textarea | No | Any text |

### Conflict Detection UI

When a conflict is detected:

1. **Red warning box** appears with:
   - Alert icon and "Conflict Detected" heading
   - List of conflicting bookings
   - Suggested alternative time slots (up to 3)

2. **User can:**
   - Click suggested slot to apply it
   - Manually adjust time and retry
   - Cancel and choose different resource

3. **Form state:**
   - Submit button disabled while conflicts exist
   - Green checkmark appears when valid

### Time Input Behavior

- **Date input:** Shows calendar picker, accepts format YYYY-MM-DD
- **Time input:** Shows time picker, accepts format HH:MM (24-hour)
- **Display:** Shows times in local timezone
- **Storage:** Converts to UTC for storage

## Responsive Design

### Desktop (1200px+)
- Full-width layout with comfortable spacing
- Two-column resource cards
- Full form fields

### Tablet (768px - 1199px)
- Adjusted spacing
- Single-column resource cards
- Stacked form fields

### Mobile (< 768px)
- Full-width single column
- Compact buttons and inputs
- Simplified navigation
- Touch-friendly tap targets (44px minimum)

## Color Scheme

### Light Theme (Default)
- **Background:** White
- **Text:** Dark gray (#1F2937)
- **Primary:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Red (#EF4444)
- **Border:** Light gray (#E5E7EB)

### Semantic Colors
- **Success:** Green (booking created, import successful)
- **Warning:** Red (conflict detected, validation error)
- **Info:** Blue (suggestions, informational messages)

## Typography

- **Headings:** Bold, larger font size for hierarchy
- **Body text:** Regular weight, readable size
- **Form labels:** Medium weight, slightly larger than body
- **Buttons:** Medium weight, uppercase or title case

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit forms
- Arrow keys in dropdowns
- Escape to close dialogs

### Screen Reader Support
- Semantic HTML with proper heading hierarchy
- Form labels associated with inputs
- ARIA labels for icon buttons
- Error messages announced

### Visual Accessibility
- Sufficient color contrast (WCAG AA)
- Focus indicators on all interactive elements
- Clear visual hierarchy
- Icons paired with text labels

## Error States

### Validation Errors
- **Display:** Red border on invalid field
- **Message:** Clear explanation below field
- **Action:** User corrects and retries

### Conflict Errors
- **Display:** Red warning box with details
- **Suggestions:** Alternative time slots provided
- **Action:** User applies suggestion or adjusts manually

### System Errors
- **Display:** Toast notification (top-right)
- **Message:** User-friendly error description
- **Action:** User can retry or contact support

## Success States

### Booking Created
- Toast: "Booking created successfully"
- Timeline updates to show new booking
- Form clears for next entry

### Data Exported
- Toast: "Data exported successfully"
- File downloaded to Downloads folder

### Data Imported
- Toast: "Data imported successfully"
- Application data updates
- Timeline and catalog refresh

## Loading States

### Initial Load
- Spinner animation while loading from IndexedDB
- "Loading application..." message
- Prevents interaction until ready

### Async Operations
- Buttons disabled during operation
- Toast shows progress/completion
- UI updates when complete

## Empty States

### No Resources
- Icon and message: "No rooms found"
- User prompted to add resources or check filters

### No Bookings
- Icon and message: "No bookings for this day"
- User can navigate to different day or create booking

### No Search Results
- Icon and message: "No results found"
- User can clear search or adjust filters

## Dialog/Modal Behavior

### Booking Form Dialog
- Opens when user clicks "Book Room/Asset" or "New Booking"
- Modal overlay prevents background interaction
- Close button (X) or Cancel button to dismiss
- Escape key closes dialog

### Confirmation Dialogs
- Used for destructive actions (delete)
- Two buttons: Cancel and Confirm
- Clear warning message

## Notifications (Toasts)

### Success
- Green background, checkmark icon
- Message: "Action completed successfully"
- Auto-dismisses after 3 seconds

### Error
- Red background, error icon
- Message: Specific error description
- Auto-dismisses after 5 seconds

### Info
- Blue background, info icon
- Message: Informational message
- Auto-dismisses after 3 seconds

## Navigation

### Main Navigation
- Tab-based navigation at top
- Four main sections: Catalog, Timeline, New Booking, Data
- Active tab highlighted
- Responsive: icons only on mobile, text on desktop

### Secondary Navigation
- Date navigation in Timeline (previous/next/today)
- Resource type tabs in Catalog (Rooms/Assets)
- Policy selection in Import (Merge/Replace)

## Performance Considerations

- **List virtualization:** For large booking lists (future enhancement)
- **Lazy loading:** Resources loaded on demand
- **Debounced search:** Search input debounced to reduce queries
- **Memoized components:** Prevent unnecessary re-renders
