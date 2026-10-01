# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-04

### Added

- **Core Features**
  - Resource catalog with search and filtering by name and capacity
  - Create, read, update, delete bookings
  - Intelligent conflict detection with suggested alternative time slots
  - Timeline view for daily booking schedule
  - Import/export functionality with validation
  - Two import policies: Merge and Replace All

- **Data Management**
  - IndexedDB for persistent local storage
  - UTC (RFC 3339/ISO 8601) time storage with local timezone display
  - Automatic timezone conversion
  - Referential integrity validation
  - Self-intersection detection in bookings

- **Business Logic**
  - Booking interval overlap detection using formula: `start1 < end2 AND end1 > start2`
  - Adjacent bookings allowed (end1 === start2 does not conflict)
  - Suggested slot generation for conflicting bookings
  - Validation of booking time ranges and resource references

- **User Interface**
  - Four main views: Catalog, Timeline, New Booking, Import/Export
  - Responsive design for desktop, tablet, and mobile
  - Real-time form validation with visual feedback
  - Conflict warning with alternative suggestions
  - Toast notifications for user feedback
  - Dialog-based booking form

- **Documentation**
  - Comprehensive specification (SPEC.md)
  - Data model documentation (DATA.md)
  - Architecture decisions (DECISIONS.md)
  - UI documentation (UI.md)
  - Testing guide (TESTS.md)
  - Cross-platform compatibility notes (COMPAT.md)
  - Detailed README with quick start guide

- **Development**
  - TypeScript for type safety
  - React 19 with Context API for state management
  - Vite for fast development and optimized builds
  - Tailwind CSS 4 for styling
  - shadcn/ui components for consistent UI
  - Git with proper line ending normalization (.gitattributes)

### Technical Details

- **Time Handling**: All times stored in UTC, displayed in local timezone
- **Storage**: IndexedDB with indexes on resourceId, start, and end
- **Conflict Detection**: O(n) algorithm for efficient overlap checking
- **Import Validation**: Schema validation, referential integrity, conflict detection
- **Cross-Platform**: Works on Windows, Linux, and macOS

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Limitations

- No real-time synchronization across devices
- No user authentication in MVP
- Single browser instance (no multi-device sync)
- No recurring bookings
- No push notifications

---

## Planned Features (Future Releases)

- [ ] Recurring bookings with pattern support
- [ ] Booking notifications and reminders
- [ ] User authentication and multi-user support
- [ ] Server-side synchronization
- [ ] Mobile native apps
- [ ] Calendar view with month/week options
- [ ] Resource availability heatmap
- [ ] Booking history and audit log
- [ ] Advanced filtering and search
- [ ] Booking templates
- [ ] Resource capacity warnings
- [ ] Integration with calendar services (Google Calendar, Outlook)
