# Harbor — Resource Booking System

A cross-platform web application for managing room and asset bookings with intelligent conflict detection and UTC-based time handling.

## Features

- **Resource Catalog:** Browse and search rooms and assets with filtering
- **Smart Booking:** Create bookings with automatic conflict detection
- **Alternative Suggestions:** Get suggested time slots when conflicts occur
- **Timeline View:** See all bookings for a specific day
- **UTC Time Handling:** Consistent time storage with local timezone display
- **Import/Export:** Backup and restore data as JSON
- **Offline First:** All data stored locally in IndexedDB
- **Cross-Platform:** Works on Windows, Linux, and macOS

## Quick Start

### Prerequisites

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **pnpm** - Install globally: `npm install -g pnpm`
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Harbor

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build static assets
pnpm build

# Preview production build
pnpm preview
```

Output will be in the `dist/` directory.

## Project Structure

```
Harbor/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (AppContext)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities (time, database, validation)
│   │   ├── pages/          # Page components
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── public/             # Static files
│   └── index.html          # HTML template
├── docs/                   # Documentation
│   ├── SPEC.md            # Feature specification
│   ├── DATA.md            # Data model documentation
│   ├── DECISIONS.md       # Architecture decisions
│   ├── UI.md              # UI documentation
│   ├── TESTS.md           # Testing guide
│   └── COMPAT.md          # Compatibility notes
├── seed/
│   └── seed.example.json  # Example data for import
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Usage Guide

### Creating a Booking

1. Navigate to **"New Booking"** tab
2. Select resource type (Room or Asset)
3. Choose specific resource
4. Enter booking title
5. Select date and time range
6. Add notes (optional)
7. Click "Create Booking"

**Conflict Handling:**
- If time slot conflicts with existing booking, a red warning appears
- Review suggested alternative slots
- Click a suggestion to apply it automatically
- Or manually adjust time and retry

### Managing Bookings

1. Navigate to **"Timeline"** tab
2. Use navigation arrows to browse days
3. Click "Today" to return to current date
4. Click edit icon to modify a booking
5. Click delete icon to remove a booking

### Viewing Resources

1. Navigate to **"Catalog"** tab
2. Use search bar to find resources by name
3. Filter rooms by capacity (for rooms only)
4. Click "Book Room" or "Book Asset" to create booking

### Import/Export Data

**Export:**
1. Navigate to **"Data"** tab
2. Click "Export as JSON"
3. File downloads as `harbor-YYYY-MM-DD.json`

**Import:**
1. Navigate to **"Data"** tab
2. Click "Select JSON File"
3. Review import preview
4. Choose policy: "Merge" (add/update) or "Replace All" (clear and import)
5. Click "Import Data"

## Time Zone Handling

- **Storage:** All times stored in UTC (RFC 3339/ISO 8601 format)
- **Display:** Times shown in your local timezone
- **Input:** Enter times in your local timezone
- **Consistency:** No issues with daylight saving time or timezone changes

## Data Format

### Import/Export JSON Structure

```json
{
  "rooms": [
    {
      "id": "r-101",
      "name": "Аудитория 101",
      "capacity": 30,
      "features": ["projector", "whiteboard"]
    }
  ],
  "assets": [
    {
      "id": "a-proj-1",
      "name": "Проектор Epson",
      "inventoryCode": "PRJ-001",
      "status": "available"
    }
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

See `seed/seed.example.json` for a complete example.

## Development

### Available Commands

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Format code
pnpm format
```

### Technology Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui
- **State Management:** React Context API
- **Storage:** IndexedDB
- **Routing:** Wouter

### Key Utilities

- **Time Utilities** (`client/src/lib/timeUtils.ts`): UTC ↔ Local timezone conversion
- **Database** (`client/src/lib/db.ts`): IndexedDB operations
- **Booking Logic** (`client/src/lib/bookingUtils.ts`): Conflict detection and validation

## Testing

See `docs/TESTS.md` for comprehensive testing guide including:
- Manual test scenarios
- Business logic tests
- Cross-browser testing
- Accessibility testing
- Performance testing

### Quick Manual Test

1. Create a booking for Room 101 from 10:00-11:00
2. Try to create overlapping booking 10:30-11:30
3. Verify conflict detected
4. Click suggested slot 11:00-12:00
5. Verify booking created at new time
6. Export data and verify JSON format
7. Import data back and verify consistency

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| IE 11 | Any | ❌ Not supported |

## Documentation

Comprehensive documentation available in `docs/` folder:

- **SPEC.md** - Feature specification and user stories
- **DATA.md** - Data model and storage details
- **DECISIONS.md** - Architecture and technology decisions
- **UI.md** - User interface documentation
- **TESTS.md** - Testing guide and scenarios
- **COMPAT.md** - Cross-platform compatibility notes

## Known Limitations

1. **No Real-Time Sync:** Data only syncs within single browser instance
2. **No User Authentication:** Anyone with browser access can see/modify data
3. **Storage Limit:** IndexedDB limited to ~50MB (sufficient for thousands of bookings)
4. **Single Device:** Data not synchronized across devices
5. **No Recurring Bookings:** Each booking is independent

## Troubleshooting

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Or use different port
pnpm dev -- --port 3001
```

### Data Not Persisting
- Check browser storage is not disabled
- Verify IndexedDB is available (F12 → Application → IndexedDB)
- Try clearing browser cache and reloading

### Import Fails
- Verify JSON file format matches specification
- Check for self-intersecting bookings in import file
- Ensure all referenced resources exist

### Timezone Issues
- Verify system timezone is set correctly
- Times should display in local timezone
- Check browser console for any errors

## Performance

- **Bookings:** Efficiently handles 1000+ bookings
- **Search:** Debounced for smooth typing experience
- **Timeline:** Optimized for daily view
- **Import/Export:** Fast JSON processing

## Future Enhancements

- Recurring bookings
- Booking notifications
- User authentication
- Server-side synchronization
- Mobile app
- Calendar view
- Resource availability heatmap
- Booking history and audit log

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
1. Check documentation in `docs/` folder
2. Review test scenarios in `TESTS.md`
3. Check browser console for errors (F12)
4. Create an issue on GitHub

## Version History

### v1.0.0 (2025-09-04)
- Initial MVP release
- Resource catalog with search and filtering
- Booking creation with conflict detection
- Timeline view
- Import/export functionality
- UTC time handling with local timezone display
- Cross-platform support

---

**Built with ❤️ for efficient resource management**
