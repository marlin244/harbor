# Architecture Decisions

## Technology Stack

### Frontend Framework: React 19 + TypeScript + Vite

**Decision:** Use React with TypeScript for type safety and component-based architecture.

**Rationale:**
- **React:** Mature ecosystem, large community, excellent tooling
- **TypeScript:** Catches errors at compile time, improves code maintainability
- **Vite:** Fast development server, optimized production builds, excellent DX

**Alternatives Considered:**
- Svelte: More compact, but smaller ecosystem
- Vue: Good alternative, but React has better integration with shadcn/ui
- Lit: Lightweight, but less suitable for complex state management

### UI Component Library: shadcn/ui

**Decision:** Use shadcn/ui for consistent, accessible components.

**Rationale:**
- Built on Radix UI (accessible primitives)
- Fully customizable with Tailwind CSS
- Excellent TypeScript support
- Large component library covering all needs

### Styling: Tailwind CSS 4

**Decision:** Utility-first CSS framework for rapid UI development.

**Rationale:**
- Fast development with utility classes
- Consistent design system
- Excellent responsive design support
- Built-in dark mode support

### Client-Side Storage: IndexedDB

**Decision:** Use IndexedDB for persistent local storage instead of localStorage.

**Rationale:**
- **Async API:** Non-blocking operations, better performance
- **Storage Capacity:** Up to 50MB+ (vs 5-10MB for localStorage)
- **Indexing:** Built-in support for efficient queries
- **Transactions:** ACID guarantees for data consistency
- **Structured Data:** Native support for complex objects

**Comparison with localStorage:**
- localStorage is synchronous and can block the UI
- localStorage has limited storage capacity
- localStorage is suitable only for small amounts of data
- IndexedDB is designed for larger datasets with complex queries

### Routing: Wouter

**Decision:** Use Wouter for client-side routing.

**Rationale:**
- Lightweight and fast
- Minimal configuration
- Works well with static sites
- Good TypeScript support

### State Management: React Context API

**Decision:** Use React Context for global state management.

**Rationale:**
- No additional dependencies
- Sufficient for MVP scope
- Easy to understand and maintain
- Can be upgraded to Redux/Zustand if needed

**Future Upgrade Path:**
- If state complexity grows, migrate to Zustand or Redux

## Data Model Design

### Time Storage: UTC (RFC 3339/ISO 8601)

**Decision:** Store all timestamps in UTC, display in local timezone.

**Rationale:**
- **Consistency:** Same timestamp regardless of user location
- **DST Safety:** Avoids ambiguities at daylight saving time boundaries
- **Portability:** Data can be shared across timezones
- **Calculations:** Interval overlap detection is unambiguous

**Implementation:**
- Store: `new Date().toISOString()` → `"2025-09-05T08:00:00.000Z"`
- Display: `new Date(isoString).toLocaleString()` → `"9/5/2025, 8:00:00 AM"`

### Booking Conflict Detection

**Decision:** Use interval overlap formula: `start1 < end2 AND end1 > start2`

**Rationale:**
- Simple and efficient O(n) algorithm
- Correctly handles all edge cases
- Adjacent bookings (end1 === start2) are not considered conflicts
- Works correctly in UTC

**Example:**
```
Booking 1: 08:00 - 09:00
Booking 2: 09:00 - 10:00
Result: No conflict (adjacent bookings allowed)

Booking 1: 08:00 - 09:00
Booking 2: 08:30 - 09:30
Result: Conflict
```

## API Design

### AppContext Interface

**Decision:** Provide unified interface for all data operations.

**Rationale:**
- Centralized state management
- Consistent error handling
- Easy to add logging/analytics
- Facilitates testing

**Operations:**
- CRUD for rooms, assets, bookings
- Import/export with validation
- Data refresh

## Import/Export Strategy

### Two-Policy Approach: Replace All vs. Merge

**Decision:** Support both "Replace All" and "Merge" import policies.

**Rationale:**
- **Replace All:** For complete data restoration from backup
- **Merge:** For incremental updates and combining data sources
- Gives users flexibility for different use cases

### Validation Before Import

**Decision:** Validate all data before applying changes.

**Rationale:**
- Prevents corrupted state
- Provides clear error messages
- Allows user to fix issues before retry
- Atomic operations (all or nothing)

## Error Handling

**Decision:** Use toast notifications for user feedback.

**Rationale:**
- Non-intrusive notifications
- Clear success/error messages
- Doesn't interrupt workflow
- Consistent with modern UX patterns

## Accessibility

**Decision:** Follow WAI-ARIA guidelines and semantic HTML.

**Rationale:**
- Inclusive design for all users
- Better SEO
- Better keyboard navigation
- Compliance with accessibility standards

## Testing Strategy

**Decision:** Focus on business logic unit tests, manual UI testing.

**Rationale:**
- Business logic (time calculations, conflict detection) is critical
- UI testing is better done manually for MVP
- Can add E2E tests later with Playwright/Cypress

## Cross-Platform Compatibility

### Browser Support
- **Target:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Requirement:** ES2020+ support
- **No IE11 support:** Simplifies development

### Operating System Support
- **Windows:** Tested with Windows 10+
- **Linux:** Tested with Ubuntu 20.04+
- **macOS:** Should work (not explicitly tested)

### Line Endings
- **Configuration:** `.gitattributes` with `* text=auto`
- **Reason:** Prevents CRLF/LF issues between Windows and Linux

## Deployment Strategy

**Decision:** Static site deployment (no server required).

**Rationale:**
- No backend infrastructure needed
- Easy to host on CDN
- Fast load times
- Reduced operational complexity

**Deployment Options:**
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## Future Considerations

### Server-Side Sync
- Add backend API for multi-device sync
- Implement user authentication
- Add real-time collaboration features

### Database Migration
- If data grows beyond IndexedDB limits
- Migrate to backend database
- Keep offline-first capability with sync

### Performance Optimization
- Implement virtual scrolling for large lists
- Add pagination for timeline view
- Optimize re-renders with React.memo

### Analytics
- Track user interactions
- Monitor error rates
- Understand feature usage

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-09-04 | Initial MVP release |
