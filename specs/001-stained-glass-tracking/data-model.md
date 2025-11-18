# Data Model: Stained Glass Window Tracking App

**Date**: 2025-01-27  
**Source**: Feature specification entities and requirements

## Overview

The data model consists of five core entities: Church, Window, PhotoSubmission, User, and supporting reference entities (ArweaveRecord, CardanoAuditTrail). The model supports anonymous user contributions, location verification, AI-based image analysis, and blockchain integration.

## Entities

### Church

Represents a physical church building with registered coordinates, location information, and an orienting visual.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `name` (String, Required): Church name
- `county` (String, Required, Indexed): County name for search
- `town` (String, Required, Indexed): Town/city name for search
- `latitude` (Decimal, Required): GPS latitude coordinate
- `longitude` (Decimal, Required): GPS longitude coordinate
- `floor_plan_url` (String, Optional): URL to floor plan or spatial overlay image
- `floor_plan_coordinates` (JSON, Optional): Metadata about floor plan layout (window positions, etc.)
- `created_at` (Timestamp): Record creation timestamp
- `updated_at` (Timestamp): Record last update timestamp

**Relationships**:
- One-to-Many: Church → Windows (a church has multiple windows)

**Validation Rules**:
- `name`, `county`, `town` must not be empty
- `latitude` must be between -90 and 90
- `longitude` must be between -180 and 180
- Coordinates must be valid decimal numbers

**State Transitions**: None (static entity, updated only by administrators)

**Indexes**:
- Composite index on (`county`, `town`) for search performance
- Index on (`latitude`, `longitude`) for geospatial queries

### Window

Represents a stained glass window within a church, identified by location on the floor plan.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `church_id` (UUID, Foreign Key → Church.id, Required): Parent church
- `location_identifier` (String, Required): Identifier for window location (e.g., "North Wall, Window 3", "Chancel East")
- `floor_plan_coordinates` (JSON, Optional): Coordinates on floor plan (x, y, width, height, or polygon)
- `description` (String, Optional): Additional description of the window
- `created_at` (Timestamp): Record creation timestamp
- `updated_at` (Timestamp): Record last update timestamp

**Relationships**:
- Many-to-One: Window → Church (each window belongs to one church)
- One-to-Many: Window → PhotoSubmissions (a window can have multiple photo submissions)

**Validation Rules**:
- `location_identifier` must not be empty
- `church_id` must reference an existing church

**State Transitions**: None (static entity, updated only by administrators or users adding new windows)

**Indexes**:
- Index on `church_id` for efficient querying of all windows for a church

### PhotoSubmission

Represents a user-uploaded photo of a stained glass window, containing the image file, metadata, and references to blockchain records.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `window_id` (UUID, Foreign Key → Window.id, Optional): Assigned window (null if unassigned)
- `user_id` (UUID, Foreign Key → User.id, Required): User who submitted the photo
- `image_url` (String, Required): URL to image (may be Arweave URL or temporary storage)
- `arweave_tx_id` (String, Optional): Arweave transaction ID (null until uploaded)
- `cardano_tx_hash` (String, Optional): Cardano transaction hash (null until logged)
- `timestamp` (Timestamp, Required): When photo was taken (from EXIF or user input)
- `location_latitude` (Decimal, Required): GPS latitude where photo was taken
- `location_longitude` (Decimal, Required): GPS longitude where photo was taken
- `location_verified` (Boolean, Required): Whether location was GPS-verified (true) or manually verified (false)
- `location_distance_meters` (Decimal, Optional): Distance from church coordinates in meters
- `ai_classification` (JSON, Optional): AI analysis results (window identification, quality score, etc.)
- `quality_score` (Decimal, Optional): Overall quality score (0-1)
- `is_primary` (Boolean, Default: false): Whether this is the primary/clearest photo for the window
- `is_deleted` (Boolean, Default: false): Soft delete flag (FR-021: blockchain records remain immutable)
- `metadata` (JSON, Optional): Additional metadata (camera settings, EXIF data, etc.)
- `created_at` (Timestamp): Record creation timestamp
- `updated_at` (Timestamp): Record last update timestamp

**Relationships**:
- Many-to-One: PhotoSubmission → Window (each submission can be assigned to one window)
- Many-to-One: PhotoSubmission → User (each submission belongs to one user)
- One-to-One: PhotoSubmission → ArweaveRecord (via arweave_tx_id reference)
- One-to-One: PhotoSubmission → CardanoAuditTrail (via cardano_tx_hash reference)

**Validation Rules**:
- `image_url` must be a valid URL
- `location_latitude` must be between -90 and 90
- `location_longitude` must be between -180 and 180
- `timestamp` must be a valid timestamp
- `quality_score` must be between 0 and 1 if provided
- If `window_id` is provided, it must reference an existing window
- If `location_verified` is false, user must have confirmed manual override

**State Transitions**:
1. **Created** → **Uploading**: Photo captured, queued for upload
2. **Uploading** → **Processing**: Uploaded to Arweave, awaiting AI analysis
3. **Processing** → **Assigned**: AI analysis complete, assigned to window (or flagged for manual assignment)
4. **Assigned** → **Deleted**: User deletes submission (soft delete, `is_deleted = true`)
5. **Assigned** → **Updated**: User edits submission metadata

**Indexes**:
- Index on `window_id` for efficient querying of all photos for a window
- Index on `user_id` for user contribution tracking
- Index on `is_deleted` for filtering active submissions
- Index on `is_primary` for finding primary photos
- Index on (`location_latitude`, `location_longitude`) for geospatial queries
- Index on `created_at` for chronological sorting

### User

Represents an anonymous user identified by persistent app ID, with contribution tracking.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `app_id` (String, Unique, Required, Indexed): Anonymous persistent app ID (generated client-side)
- `contribution_count` (Integer, Default: 0): Total number of photo submissions
- `contribution_quality_avg` (Decimal, Optional): Average quality score of contributions
- `created_at` (Timestamp): Record creation timestamp
- `updated_at` (Timestamp): Record last update timestamp

**Relationships**:
- One-to-Many: User → PhotoSubmissions (a user can have multiple submissions)

**Validation Rules**:
- `app_id` must be unique and not empty
- `app_id` format: Should be a secure random string (e.g., UUID v4 or crypto.randomUUID())
- `contribution_count` must be non-negative
- `contribution_quality_avg` must be between 0 and 1 if provided

**State Transitions**: None (user record is created on first use, updated as contributions are made)

**Indexes**:
- Unique index on `app_id` for user lookup
- Index on `contribution_count` for leaderboards/statistics

### ArweaveRecord (Reference Entity)

Represents the immutable storage record on Arweave. Not stored in database, but referenced by PhotoSubmission.

**Fields** (stored on Arweave, referenced by `arweave_tx_id`):
- Transaction ID: Arweave transaction ID (stored in PhotoSubmission.arweave_tx_id)
- Image file: The actual image file
- Metadata: JSON metadata including timestamp, location, user app_id, window_id, etc.

**Access Pattern**: 
- Frontend queries Arweave network using transaction ID
- Backend may cache Arweave data for performance

### CardanoAuditTrail (Reference Entity)

Represents the blockchain audit log entry on Cardano. Not stored in database, but referenced by PhotoSubmission.

**Fields** (stored on Cardano, referenced by `cardano_tx_hash`):
- Transaction hash: Cardano transaction hash (stored in PhotoSubmission.cardano_tx_hash)
- Audit data: JSON data including photo submission ID, timestamp, Arweave transaction ID, user app_id, etc.

**Access Pattern**:
- Frontend queries Cardano blockchain using transaction hash
- Backend may cache Cardano data for performance

## Database Schema Summary

### Tables

1. **churches**
   - Primary Key: `id` (UUID)
   - Indexes: (`county`, `town`), (`latitude`, `longitude`)

2. **windows**
   - Primary Key: `id` (UUID)
   - Foreign Key: `church_id` → `churches.id`
   - Indexes: `church_id`

3. **users**
   - Primary Key: `id` (UUID)
   - Unique: `app_id` (String)
   - Indexes: `app_id`, `contribution_count`

4. **photo_submissions**
   - Primary Key: `id` (UUID)
   - Foreign Keys: `window_id` → `windows.id`, `user_id` → `users.id`
   - Indexes: `window_id`, `user_id`, `is_deleted`, `is_primary`, (`location_latitude`, `location_longitude`), `created_at`

### Relationships Diagram

```
Church (1) ──< (Many) Window (1) ──< (Many) PhotoSubmission
                                                      │
                                                      │
User (1) ──< (Many) PhotoSubmission ──> (1) ArweaveRecord (via tx_id)
                                                      │
                                                      │
                                            (1) CardanoAuditTrail (via tx_hash)
```

## Data Validation Rules

### Location Verification

- User location must be within 50 meters of church coordinates (Haversine formula)
- If GPS unavailable, manual override requires user confirmation (FR-026)
- Distance stored in `location_distance_meters` for audit purposes

### Image Quality

- Quality score calculated from:
  - Brightness analysis (client-side)
  - Contrast analysis (client-side)
  - Sharpness/blur detection (client-side)
  - AI classification (server-side)
- Primary photo selection: Highest quality score for each window

### AI Classification

- AI analysis results stored in `ai_classification` JSON field:
  - `window_identified`: Boolean (whether window was identified)
  - `suggested_window_id`: UUID (suggested window assignment)
  - `confidence`: Decimal (0-1 confidence score)
  - `quality_issues`: Array of strings (e.g., ["too_dark", "blurry"])
  - `is_relevant`: Boolean (whether image is relevant stained glass window)

### Soft Delete

- When user deletes submission (FR-021):
  - `is_deleted` set to `true`
  - Removed from active collection views
  - Arweave and Cardano records remain immutable (cannot be deleted)

## Data Migration Considerations

- Initial schema creation with migrations (TypeORM/Prisma)
- Future migrations may add:
  - Additional metadata fields
  - New indexes for performance
  - Additional relationships

## Performance Considerations

- Database indexes on all foreign keys and search fields
- Pagination for large result sets (churches, windows, submissions)
- Caching for frequently accessed church data
- Lazy loading of images (load on demand)
- CDN for image delivery

