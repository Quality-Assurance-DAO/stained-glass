# Phase 4 Quick Test Checklist

**Phase 4 = User Story 1: Search and View Churches and Windows**

## Quick Setup (5 minutes)

```bash
# 1. Ensure database is set up
cd backend
./scripts/init-db.sh

# 2. Seed test data
npx tsx scripts/seed-test-data.ts

# 3. Start servers (from project root)
./scripts/start-dev.sh
# Or manually:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

## Quick Test (10 minutes)

### ✅ Test 1: Search Works
- [ ] Open `http://localhost:5173`
- [ ] Search for "Yorkshire" → Should see 2 churches
- [ ] Search for "York" → Should see 1 church
- [ ] Search for "Kent" → Should see 1 church

### ✅ Test 2: Church Details Load
- [ ] Click on "St. Mary's Church"
- [ ] Should see church name, location, coordinates
- [ ] Should see floor plan image (if URL exists)
- [ ] Should see list of windows

### ✅ Test 3: Windows Display
- [ ] Each window shows location description
- [ ] Windows show submission count (should be 0 for test data)
- [ ] Can navigate back to search

### ✅ Test 4: Error Handling
- [ ] Search for "Nonexistent" → Shows "No churches found"
- [ ] Stop backend → Search shows error message
- [ ] Restart backend → Search works again

## API Quick Test

```bash
# Search by county
curl "http://localhost:3000/api/churches/search?county=Yorkshire"

# Get church details (replace {id} with actual UUID)
curl "http://localhost:3000/api/churches/{id}"

# Get windows for church
curl "http://localhost:3000/api/churches/{id}/windows"
```

## Success Criteria

- ✅ Search completes in < 10 seconds
- ✅ Church details load with floor plan
- ✅ Windows are displayed correctly
- ✅ Navigation works (search ↔ detail page)

## If Something Fails

1. **No churches in search**: Run seed script again
2. **Backend errors**: Check `backend/.env` has `DATABASE_URL`
3. **Frontend errors**: Check browser console
4. **Database issues**: Run `./scripts/reset-db.sh` then seed again

## Full Testing Guide

For comprehensive testing, see: [phase4-testing-guide.md](./phase4-testing-guide.md)

