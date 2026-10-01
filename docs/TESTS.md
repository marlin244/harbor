# Testing Guide

## Manual Test Scenarios

### 1. Resource Management

#### Test 1.1: View Room Catalog
1. Open the application
2. Navigate to "Catalog" tab
3. Verify all rooms are displayed with name, capacity, and features
4. Verify all assets are displayed with name and inventory code

**Expected Result:** All resources visible with correct information

#### Test 1.2: Search Resources
1. In Catalog tab, type "101" in search box
2. Verify only rooms/assets matching "101" are shown
3. Clear search and verify all resources reappear

**Expected Result:** Search filters correctly by name

#### Test 1.3: Filter by Capacity
1. In Catalog tab, select "20+" from capacity filter
2. Verify only rooms with capacity ≥ 20 are shown
3. Change filter to "30+" and verify results update

**Expected Result:** Capacity filter works correctly

### 2. Booking Creation and Validation

#### Test 2.1: Create Valid Booking
1. Navigate to "New Booking" tab
2. Select resource type "Room"
3. Select a room from dropdown
4. Enter title "Test Meeting"
5. Select date (today or tomorrow)
6. Enter start time 10:00, end time 11:00
7. Click "Create Booking"

**Expected Result:** Booking created successfully, toast shows "Booking created successfully"

#### Test 2.2: Detect Conflict
1. Create first booking: Room 101, 10:00-11:00
2. Try to create second booking: Room 101, 10:30-11:30
3. Observe conflict warning with list of conflicting bookings

**Expected Result:** Conflict detected, form shows red warning with conflicting booking

#### Test 2.3: Use Suggested Slot
1. Create first booking: Room 101, 10:00-11:00
2. Try to create second booking: Room 101, 10:30-11:30
3. Click on suggested slot (e.g., 11:00-12:00)
4. Verify form updates with new time
5. Click "Create Booking"

**Expected Result:** Suggested slot applied, booking created at new time

#### Test 2.4: Invalid Time Range
1. Try to create booking with end time before start time
2. Verify form shows validation error

**Expected Result:** Form prevents submission with invalid time range

#### Test 2.5: Adjacent Bookings Allowed
1. Create first booking: Room 101, 10:00-11:00
2. Create second booking: Room 101, 11:00-12:00
3. Verify both bookings created successfully (no conflict)

**Expected Result:** Adjacent bookings are allowed

### 3. Booking Management

#### Test 3.1: View Timeline
1. Navigate to "Timeline" tab
2. Verify bookings for today are displayed
3. Click "Today" button to reset to current date

**Expected Result:** Timeline shows bookings for selected day

#### Test 3.2: Navigate Timeline
1. In Timeline tab, click left arrow to go to previous day
2. Verify date changes and bookings update
3. Click right arrow to go to next day
4. Click "Today" to return to current date

**Expected Result:** Navigation works correctly

#### Test 3.3: Edit Booking
1. In Timeline tab, click edit button on a booking
2. Change the title to "Updated Title"
3. Click "Update Booking"
4. Verify booking updated in timeline

**Expected Result:** Booking edited successfully

#### Test 3.4: Delete Booking
1. In Timeline tab, click delete button on a booking
2. Confirm deletion
3. Verify booking removed from timeline
4. Verify toast shows "Booking deleted"

**Expected Result:** Booking deleted successfully

### 4. Time Zone Handling

#### Test 4.1: Time Display in Local Timezone
1. Create booking at 10:00 (local time)
2. Check browser console: verify stored time is in UTC format
3. Verify displayed time matches local time

**Expected Result:** Times stored in UTC, displayed in local timezone

#### Test 4.2: Time Consistency Across Sessions
1. Create booking at specific time
2. Refresh browser page
3. Verify booking time unchanged

**Expected Result:** Time persists correctly across sessions

### 5. Import/Export

#### Test 5.1: Export Data
1. Navigate to "Data" tab
2. Click "Export as JSON"
3. Verify JSON file downloaded with format: `harbor-YYYY-MM-DD.json`
4. Open file and verify structure (rooms, assets, bookings arrays)

**Expected Result:** Valid JSON file exported with correct structure

#### Test 5.2: Import with Merge Policy
1. Export current data
2. Create new booking manually
3. Import previously exported file with "Merge" policy
4. Verify new booking still exists (not overwritten)
5. Verify imported bookings added

**Expected Result:** Merge policy preserves existing data

#### Test 5.3: Import with Replace All Policy
1. Export current data
2. Create new booking manually
3. Import previously exported file with "Replace All" policy
4. Verify new booking removed
5. Verify only imported data present

**Expected Result:** Replace All policy clears existing data

#### Test 5.4: Import Validation
1. Create invalid JSON file (missing required fields)
2. Try to import
3. Verify validation error shown
4. Verify data not imported

**Expected Result:** Invalid data rejected with error message

#### Test 5.5: Import with Conflicts
1. Export data with bookings
2. Manually create conflicting booking in file
3. Try to import
4. Verify conflict detected and import blocked

**Expected Result:** Conflicting data rejected

### 6. Data Persistence

#### Test 6.1: Data Persists After Refresh
1. Create several bookings
2. Refresh browser page
3. Verify all bookings still present

**Expected Result:** Data persists in IndexedDB

#### Test 6.2: Clear Browser Data
1. Create bookings
2. Clear browser storage (DevTools → Application → Clear storage)
3. Refresh page
4. Verify data cleared

**Expected Result:** Data cleared when browser storage cleared

### 7. Cross-Browser Testing

#### Test 7.1: Chrome/Chromium
1. Open application in Chrome
2. Run through basic workflows (create booking, export, import)

**Expected Result:** All features work correctly

#### Test 7.2: Firefox
1. Open application in Firefox
2. Run through basic workflows

**Expected Result:** All features work correctly

#### Test 7.3: Safari
1. Open application in Safari
2. Run through basic workflows

**Expected Result:** All features work correctly

### 8. Responsive Design

#### Test 8.1: Desktop View
1. Open application on desktop (1920x1080)
2. Verify layout looks good
3. Verify all buttons and inputs accessible

**Expected Result:** Desktop layout is clear and usable

#### Test 8.2: Tablet View
1. Open application on tablet (768x1024)
2. Verify layout adapts correctly
3. Verify navigation works

**Expected Result:** Tablet layout is responsive

#### Test 8.3: Mobile View
1. Open application on mobile (375x667)
2. Verify layout adapts correctly
3. Verify touch interactions work

**Expected Result:** Mobile layout is usable

## Business Logic Tests

### Interval Overlap Detection

Test the formula: `start1 < end2 AND end1 > start2`

| Booking 1 | Booking 2 | Expected | Test Case |
|-----------|-----------|----------|-----------|
| 10:00-11:00 | 10:30-11:30 | Conflict | Partial overlap |
| 10:00-11:00 | 11:00-12:00 | No conflict | Adjacent (allowed) |
| 10:00-11:00 | 09:00-10:00 | No conflict | Before |
| 10:00-11:00 | 12:00-13:00 | No conflict | After |
| 10:00-12:00 | 10:30-11:30 | Conflict | Contained |
| 10:00-11:00 | 10:00-11:00 | Conflict | Identical |

### Time Conversion

Test UTC ↔ Local timezone conversion:

1. Create booking at local time 10:00
2. Verify stored as UTC (accounting for timezone offset)
3. Verify displayed as local time 10:00
4. Export and verify UTC format in JSON

## Performance Tests

### Large Dataset Handling

1. Import file with 1000+ bookings
2. Verify application remains responsive
3. Verify timeline loads quickly
4. Verify search/filter performance acceptable

## Accessibility Tests

### Keyboard Navigation
1. Tab through form fields
2. Use Enter to submit forms
3. Use arrow keys in dropdowns
4. Verify all interactive elements reachable

### Screen Reader
1. Test with screen reader (NVDA, JAWS, or built-in)
2. Verify form labels announced correctly
3. Verify error messages announced
4. Verify navigation announced

## Known Limitations

1. **No Real-Time Sync:** Data only syncs within single browser instance
2. **No User Authentication:** Anyone with access to browser can see/modify data
3. **Storage Limit:** IndexedDB limited to ~50MB (sufficient for thousands of bookings)
4. **No Recurring Bookings:** Each booking is independent
5. **No Notifications:** No alerts for upcoming bookings
