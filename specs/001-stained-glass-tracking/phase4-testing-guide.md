# Phase 4 Testing Guide: User Story 1 - Search and View Churches and Windows

**Phase**: Phase 4  
**User Story**: User Story 1 (Priority: P1) 🎯 MVP  
**Goal**: Users can search for churches by county and town, view church details with floor plan, and browse existing window submissions organized by window location.

## Prerequisites

Before testing Phase 4, ensure:

1. **Database is set up and migrated**
   ```bash
   cd backend
   ./scripts/init-db.sh
   ```

2. **Development servers are running**
   ```bash
   # From project root
   ./scripts/start-dev.sh
   # Or manually:
   # Terminal 1: cd backend && npm run dev
   # Terminal 2: cd frontend && npm run dev
   ```

3. **Test data exists in the database** (see "Setting Up Test Data" below)

## Setting Up Test Data

You'll need sample churches and windows in the database to test Phase 4. You can add test data using one of these methods:

### Option 1: Using Prisma Studio (Recommended)

```bash
cd backend
npx prisma studio
```

Then manually add:
- At least 2-3 churches with different counties/towns
- At least 1-2 windows per church
- Optionally, some photo submissions (though not required for Phase 4)

### Option 2: Using the Seed Script (Recommended)

A seed script is already available at `backend/scripts/seed-test-data.ts`. Run it:

```bash
cd backend
npx tsx scripts/seed-test-data.ts
```

This will create:
- 3 test churches (in Yorkshire and Kent)
- Multiple windows per church
- Mix of churches with and without floor plans

**Note**: If you already have data in the database, the script will warn you but won't fail. Use `./scripts/reset-db.sh` first if you want a clean slate.

## Manual Testing Steps

### Test 1: Search Churches by County

**Acceptance Criteria**: Users can search for churches by county and town, and see a list of matching churches.

1. Open the app in your browser: `http://localhost:5173`
2. You should see the search interface with County and Town fields
3. Enter "Yorkshire" in the County field
4. Click "Search" or press Enter
5. **Expected**: You should see a list of churches in Yorkshire (e.g., St. Mary's Church in York, St. Peter's Cathedral in Leeds)
6. **Verify**: Each church card shows:
   - Church name
   - Town and county
   - "✓ Floor plan available" indicator if floor_plan_url exists

### Test 2: Search Churches by Town

1. Clear the County field
2. Enter "York" in the Town field
3. Click "Search"
4. **Expected**: You should see churches in York (e.g., St. Mary's Church)
5. **Verify**: Results are filtered correctly

### Test 3: Search Churches by County AND Town

1. Enter "Yorkshire" in County field
2. Enter "York" in Town field
3. Click "Search"
4. **Expected**: You should see churches matching both criteria (churches in Yorkshire AND York)

### Test 4: Pagination

**Prerequisite**: Ensure you have more than 20 churches in the database (or set limit lower in test data)

1. Perform a search that returns many results
2. **Expected**: Pagination controls appear at the bottom
3. Click "Next" button
4. **Expected**: Page number updates, different churches are shown
5. Click "Previous" button
6. **Expected**: Returns to previous page

### Test 5: View Church Details

**Acceptance Criteria**: Users can view church details with orienting visual (floor plan) and see existing window submissions.

1. From search results, click on a church card
2. **Expected**: Navigate to church detail page (`/churches/{churchId}`)
3. **Verify** church details section shows:
   - Church name
   - Town and county
   - Coordinates (latitude, longitude)
4. **Verify** floor plan section:
   - If `floor_plan_url` exists: Floor plan image is displayed
   - If `floor_plan_url` is null: "No floor plan available" message is shown
   - If windows exist: Window list overlay appears on floor plan
5. **Verify** windows section:
   - List of all windows for the church
   - Each window shows location description
   - Each window shows submission count (if any)
   - Photo gallery displays photos for each window (if submissions exist)

### Test 6: View Windows Without Submissions

1. Navigate to a church that has windows but no photo submissions
2. **Expected**: 
   - Windows are listed
   - Each window shows "No photos" or empty gallery
   - Submission count is 0

### Test 7: View Windows With Submissions

**Prerequisite**: Add some photo submissions to windows (can be done via Prisma Studio or API)

1. Navigate to a church with windows that have photo submissions
2. **Expected**:
   - Windows show submission count > 0
   - Photo gallery displays photos for windows with submissions
   - Primary photo (clearest/largest) is prominently displayed

### Test 8: Empty Search Results

1. Enter a county/town combination that doesn't exist (e.g., "Nonexistent County")
2. Click "Search"
3. **Expected**: "No churches found matching your search criteria" message

### Test 9: Error Handling

1. Stop the backend server
2. Try to search for churches
3. **Expected**: Error message displayed: "Error loading churches: [error message]"
4. Restart backend server
5. Try again
6. **Expected**: Search works normally

### Test 10: Navigation

1. From search page, click on a church
2. **Expected**: Navigate to church detail page
3. Click "Back to Search" button
4. **Expected**: Return to search page
5. **Verify**: Search parameters are preserved (if implemented) or reset

## API Testing (Using curl or Postman)

### Test API Endpoint: Search Churches

```bash
# Search by county
curl "http://localhost:3000/api/churches/search?county=Yorkshire&page=1&limit=20"

# Search by town
curl "http://localhost:3000/api/churches/search?town=York&page=1&limit=20"

# Search by both
curl "http://localhost:3000/api/churches/search?county=Yorkshire&town=York&page=1&limit=20"

# Test pagination
curl "http://localhost:3000/api/churches/search?county=Yorkshire&page=2&limit=10"

# Test error: missing parameters
curl "http://localhost:3000/api/churches/search"
# Expected: 400 error with message about required parameters
```

**Expected Response Format**:
```json
{
  "churches": [
    {
      "id": "uuid",
      "name": "St. Mary's Church",
      "county": "Yorkshire",
      "town": "York",
      "latitude": 53.96,
      "longitude": -1.08,
      "floor_plan_url": "https://example.com/floor-plan.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Test API Endpoint: Get Church Details

```bash
# Replace {churchId} with actual UUID from search results
curl "http://localhost:3000/api/churches/{churchId}"
```

**Expected Response Format**:
```json
{
  "id": "uuid",
  "name": "St. Mary's Church",
  "county": "Yorkshire",
  "town": "York",
  "latitude": 53.96,
  "longitude": -1.08,
  "floor_plan_url": "https://example.com/floor-plan.jpg",
  "windows": [
    {
      "id": "uuid",
      "location_description": "North Window",
      "coordinates_on_plan": { "x": 100, "y": 200 },
      "submissionCount": 0
    }
  ]
}
```

### Test API Endpoint: Get Windows for Church

```bash
# Replace {churchId} with actual UUID
curl "http://localhost:3000/api/churches/{churchId}/windows"
```

## Acceptance Criteria Verification Checklist

Based on the spec, verify these acceptance scenarios:

- [ ] **AC1**: Given a user opens the app, When they search for churches by county and town, Then they see a list of matching churches
- [ ] **AC2**: Given a user selects a church from search results, When the church details load, Then they see an orienting visual (floor plan or spatial overlay) showing the church layout
- [ ] **AC3**: Given a user views a church with existing window submissions, When they examine the orienting visual, Then they see which windows have been photographed and can view those images
- [ ] **AC4**: Given a user views a church with no existing submissions, When they examine the orienting visual, Then they see all windows marked as undocumented
- [ ] **AC5**: Given a user views existing window submissions, When multiple images exist for the same window, Then they see the clearest or largest valid photo prominently displayed

## Success Criteria Verification

From the spec, verify these measurable outcomes:

- [ ] **SC-001**: Users can search for and find a church by county and town in under 10 seconds
  - **Test**: Time the search operation from clicking Search to seeing results
  - **Target**: < 10 seconds

## Common Issues and Troubleshooting

### Issue: No churches appear in search results

**Solutions**:
- Verify database has churches with matching county/town
- Check database connection: `cd backend && npx prisma studio`
- Check backend logs for errors
- Verify search is case-insensitive (should work)

### Issue: Floor plan image doesn't load

**Solutions**:
- Verify `floor_plan_url` is a valid, accessible URL
- Check browser console for CORS or network errors
- Test URL directly in browser
- Floor plan is optional - app should handle missing floor plans gracefully

### Issue: Windows don't appear on church detail page

**Solutions**:
- Verify windows exist for the church in database
- Check API response includes windows array
- Check frontend console for errors
- Verify `useWindowsByChurch` hook is working

### Issue: Backend API returns 500 errors

**Solutions**:
- Check backend logs for detailed error messages
- Verify database connection string in `backend/.env`
- Ensure Prisma client is generated: `cd backend && npx prisma generate`
- Check database migrations are applied: `cd backend && npx prisma migrate status`

## Next Steps After Phase 4

Once Phase 4 is fully tested and working, you can proceed to:
- **Phase 5**: User Story 2 - Capture and Upload Photos with Location Verification
- This will add the ability to upload photos, which Phase 4 displays

## Notes

- Phase 4 is **independent** - it doesn't require upload functionality to work
- Phase 4 delivers immediate value as a discovery and exploration tool
- All photo submission features are optional for Phase 4 testing (windows can exist without photos)

