# Compatibility and Cross-Platform Notes

## Operating System Compatibility

### Windows 10/11

**Tested:** Windows 10 22H2, Windows 11

**Requirements:**
- Node.js 18+ (for development)
- Modern browser (Chrome, Edge, Firefox)

**Known Issues:**
- Line endings: Git may convert LF to CRLF. Use `.gitattributes` to normalize
- Path separators: Use forward slashes in code, Windows handles them correctly
- Environment variables: Use `set` command in cmd.exe, `$env:` in PowerShell

**Development Setup:**
```bash
# Install Node.js from https://nodejs.org/
# Install pnpm
npm install -g pnpm

# Clone and setup
git clone <repo>
cd Harbor
pnpm install
pnpm dev
```

**Building:**
```bash
pnpm build
# Output in dist/ directory
```

### Linux (Ubuntu 20.04+, Debian, Fedora)

**Tested:** Ubuntu 22.04 LTS

**Requirements:**
- Node.js 18+ (via nvm or package manager)
- Modern browser (Chrome, Firefox)

**Development Setup:**
```bash
# Install Node.js via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install pnpm
npm install -g pnpm

# Clone and setup
git clone <repo>
cd Harbor
pnpm install
pnpm dev
```

**Building:**
```bash
pnpm build
# Output in dist/ directory
```

### macOS

**Tested:** macOS 12+

**Requirements:**
- Node.js 18+ (via Homebrew or nvm)
- Modern browser (Chrome, Safari, Firefox)

**Development Setup:**
```bash
# Install Node.js via Homebrew
brew install node

# Install pnpm
npm install -g pnpm

# Clone and setup
git clone <repo>
cd Harbor
pnpm install
pnpm dev
```

## Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ Supported | Full support for all features |
| Firefox | 88+ | ✅ Supported | Full support for all features |
| Safari | 14+ | ✅ Supported | Full support for all features |
| Edge | 90+ | ✅ Supported | Full support for all features |
| IE 11 | Any | ❌ Not supported | No ES2020 support |

### Feature Support by Browser

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| ES2020 | ✅ | ✅ | ✅ | ✅ |
| Fetch API | ✅ | ✅ | ✅ | ✅ |
| Web Storage | ✅ | ✅ | ✅ | ✅ |
| File API | ✅ | ✅ | ✅ | ✅ |

## Line Endings (CRLF/LF)

### Problem
Windows uses CRLF (`\r\n`), Unix/Linux use LF (`\n`). Git can auto-convert, causing inconsistencies.

### Solution
Use `.gitattributes` file:

```
* text=auto
*.json text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.md text eol=lf
```

### Normalize Existing Repository
```bash
# Remove all files from git index
git rm --cached -r .

# Restore with correct line endings
git reset --hard

# Commit changes
git add -A
git commit -m "Normalize line endings"
```

## Timezone Handling

### How It Works
1. **Storage:** All times stored in UTC (ISO 8601 format)
2. **Display:** JavaScript `Date` object automatically uses local timezone
3. **Input:** User enters time in local timezone, converted to UTC for storage

### Testing Across Timezones
1. Create booking at 10:00 local time
2. Verify stored as UTC (check browser DevTools → Application → IndexedDB)
3. Verify displayed as 10:00 local time
4. Change system timezone and refresh
5. Verify still shows 10:00 in new timezone (because stored in UTC)

### Daylight Saving Time
- No special handling needed
- JavaScript `Date` object handles DST automatically
- UTC timestamps are unaffected by DST transitions

## Locale and Language

### Current Implementation
- Application text in English
- Date/time formatting uses browser locale

### Future Localization
To add language support:
1. Extract all strings to translation files
2. Use i18n library (e.g., i18next)
3. Provide language selector in UI

## File System Paths

### Development
- **Windows:** `C:\Users\username\Harbor`
- **Linux:** `/home/username/Harbor`
- **macOS:** `/Users/username/Harbor`

### Build Output
- **All platforms:** `dist/` directory in project root
- **Static files:** `dist/index.html` and assets

### Data Storage
- **All platforms:** Browser IndexedDB (location varies by browser)
- **No local files** created by application

## Environment Variables

### Development
Create `.env.local` file (git-ignored):

```bash
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

### Production
Environment variables set during deployment (varies by hosting platform).

## Performance Considerations

### Windows
- File I/O may be slower on network drives
- Use local SSD for development
- Antivirus may slow down npm install

### Linux
- Generally faster file I/O
- Recommended for development
- Use `pnpm` for faster package installation

### macOS
- Similar performance to Linux
- M1/M2 chips fully supported (native Node.js binaries available)

## Known Issues and Workarounds

### Issue: `pnpm install` slow on Windows
**Cause:** Antivirus scanning
**Solution:** Add project folder to antivirus exclusions

### Issue: Port 3000 already in use
**Cause:** Another application using the port
**Solution:** 
```bash
# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS: Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
pnpm dev -- --port 3001
```

### Issue: IndexedDB quota exceeded
**Cause:** Too much data stored
**Solution:** Export data, clear browser storage, import selectively

### Issue: Timezone mismatch in tests
**Cause:** Test running in different timezone than expected
**Solution:** Always use UTC in tests, convert to local for display verification

## Deployment Checklist

- [ ] Test on Windows 10/11
- [ ] Test on Ubuntu 20.04+
- [ ] Test on macOS 12+
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Verify line endings normalized
- [ ] Test import/export with sample data
- [ ] Test timezone handling
- [ ] Verify responsive design on mobile
- [ ] Check accessibility with keyboard navigation
- [ ] Performance test with 1000+ bookings

## Support and Troubleshooting

### Getting Help
1. Check documentation in `docs/` folder
2. Review test scenarios in `TESTS.md`
3. Check browser console for errors (F12 → Console)
4. Check IndexedDB data (F12 → Application → IndexedDB)

### Reporting Issues
Include:
- Operating system and version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Browser console errors (if any)
