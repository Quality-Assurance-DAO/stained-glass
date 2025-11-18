# Data Model: Stained Glass Window Tracking App

**Date**: 2025-01-27  
**Database**: PostgreSQL with Prisma ORM

## Entities

### Church

Represents a physical church building with registered coordinates, location information, and an orienting visual.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `name` (String, Required): Church name
- `county` (String, Required): County name
- `town` (String, Required): Town/city name
- `latitude` (Decimal, Required): GPS latitude coordinate
- `longitude` (Decimal, Required): GPS longitude coordinate
- `floor_plan_url` (String, Optional): URL to floor plan or spatial overlay image
- `created_at` (DateTime, Required): Record creation timestamp
- `updated_at` (DateTime, Required): Record last update timestamp

**Validation Rules**:
- Unique constraint on combination of `name + county + town + coordinates` (per FR-044)
- Coordinates must be valid latitude/longitude values
- Must have coordinates to allow uploads (per FR-045)

**Relationships**:
- One-to-many with `Window` (a church has multiple windows)

**Indexes**:
- Index on `county` and `town` for fast search queries
- Index on `name` for full-text search
- Composite index on `(county, town, name)` for search optimization

### Window

Represents a stained glass window within a church, identified by location on the floor plan.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `church_id` (UUID, Foreign Key → Church.id, Required): Parent church
- `location_description` (String, Optional): Text description of window location (e.g., "North wall, second from left")
- `coordinates_on_plan` (JSON, Optional): Coordinates on floor plan `{x: number, y: number}` or `null`
- `created_at` (DateTime, Required): Record creation timestamp
- `updated_at` (DateTime, Required): Record last update timestamp

**Validation Rules**:
- Must belong to a valid church
- Either `location_description` or `coordinates_on_plan` must be provided

**Relationships**:
- Many-to-one with `Church` (belongs to one church)
- One-to-many with `PhotoSubmission` (a window has multiple photo submissions)

**Indexes**:
- Index on `church_id` for fast church window queries

### PhotoSubmission

Represents a user-uploaded photo of a stained glass window, containing image metadata, location verification, and blockchain references.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `window_id` (UUID, Foreign Key → Window.id, Optional): Assigned window (nullable until assigned)
- `user_id` (UUID, Foreign Key → User.app_id, Required): Anonymous user who uploaded
- `arweave_tx_id` (String, Optional): Arweave transaction ID (null until uploaded)
- `cardano_tx_id` (String, Optional): Cardano transaction ID for audit trail (null until logged)
- `image_hash` (String, Required): SHA-256 hash of image file for duplicate detection
- `timestamp` (DateTime, Required): Photo capture timestamp
- `latitude` (Decimal, Required): Verified GPS latitude at upload time
- `longitude` (Decimal, Required): Verified GPS longitude at upload time
- `location_verified` (Boolean, Required): Whether location was GPS-verified (true) or manually overridden (false)
- `ai_classification` (JSON, Optional): AI analysis results `{window_detected: boolean, quality_score: number, description: string, needs_manual_review: boolean}`
- `metadata` (JSON, Optional): Additional user-provided metadata `{notes: string, description: string}`
- `deleted_at` (DateTime, Optional): Soft delete timestamp (null if active)
- `created_at` (DateTime, Required): Record creation timestamp
- `updated_at` (DateTime, Required): Record last update timestamp

**Validation Rules**:
- `image_hash` must be unique per window within 1 hour (duplicate detection per FR-042)
- `latitude` and `longitude` must be valid coordinates
- Location must be within 50 meters of church coordinates (unless manual override)
- Editable fields: `window_id`, `metadata` (per FR-020)
- Immutable fields: `image_hash`, `timestamp`, `latitude`, `longitude`, `arweave_tx_id`, `cardano_tx_id`, `user_id` (per FR-020)

**Relationships**:
- Many-to-one with `Window` (belongs to one window, nullable)
- Many-to-one with `User` (uploaded by one user)

**Indexes**:
- Index on `window_id` for window photo queries
- Index on `user_id` for user submission queries
- Index on `image_hash` for duplicate detection
- Index on `deleted_at` for filtering active submissions
- Composite index on `(window_id, image_hash, timestamp)` for duplicate detection within time window

### User

Represents an anonymous user identified by persistent app ID, with contribution tracking.

**Fields**:
- `app_id` (UUID, Primary Key): Anonymous persistent app ID (generated client-side)
- `contribution_count` (Integer, Default: 0): Number of photo submissions
- `quality_score` (Decimal, Optional): Aggregate quality score based on AI analysis
- `created_at` (DateTime, Required): First app usage timestamp
- `updated_at` (DateTime, Required): Last activity timestamp

**Validation Rules**:
- `app_id` must be unique (per FR-017)
- Server-side validation to prevent duplicates/spoofing

**Relationships**:
- One-to-many with `PhotoSubmission` (a user has multiple submissions)

**Indexes**:
- Index on `app_id` for user lookup (primary key)

### AuditTrail

Represents Cardano blockchain audit trail entries for photo submissions and edits.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `submission_id` (UUID, Foreign Key → PhotoSubmission.id, Required): Related photo submission
- `action` (String, Required): Action type `'upload' | 'edit' | 'delete'`
- `cardano_tx_id` (String, Optional): Cardano transaction ID (null until confirmed)
- `metadata` (JSON, Optional): Action-specific metadata `{field_changed: string, old_value: any, new_value: any}`
- `queued_at` (DateTime, Required): When audit entry was created
- `confirmed_at` (DateTime, Optional): When Cardano transaction was confirmed
- `retry_count` (Integer, Default: 0): Number of retry attempts
- `created_at` (DateTime, Required): Record creation timestamp

**Validation Rules**:
- `action` must be one of: 'upload', 'edit', 'delete'
- `submission_id` must reference valid photo submission

**Relationships**:
- Many-to-one with `PhotoSubmission` (belongs to one submission)

**Indexes**:
- Index on `submission_id` for submission audit queries
- Index on `cardano_tx_id` for blockchain verification
- Index on `confirmed_at` for pending transaction queries

### UploadQueue

Represents queued uploads to Arweave and Cardano when networks are unavailable.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `submission_id` (UUID, Foreign Key → PhotoSubmission.id, Required): Related photo submission
- `queue_type` (String, Required): Queue type `'arweave' | 'cardano'`
- `payload` (JSON, Required): Queue-specific payload data
- `status` (String, Required): Status `'pending' | 'processing' | 'completed' | 'failed'`
- `retry_count` (Integer, Default: 0): Number of retry attempts
- `next_retry_at` (DateTime, Optional): Next retry timestamp (exponential backoff)
- `error_message` (String, Optional): Last error message if failed
- `created_at` (DateTime, Required): Queue entry creation timestamp
- `updated_at` (DateTime, Required): Last update timestamp

**Validation Rules**:
- `queue_type` must be 'arweave' or 'cardano'
- `status` must be one of: 'pending', 'processing', 'completed', 'failed'
- Maximum retry count: 10 (then flag for manual review)

**Relationships**:
- Many-to-one with `PhotoSubmission` (belongs to one submission)

**Indexes**:
- Index on `status` and `next_retry_at` for queue processing
- Index on `submission_id` for submission queue queries
- Composite index on `(status, next_retry_at)` for efficient queue polling

## State Transitions

### PhotoSubmission Lifecycle

1. **Created**: User uploads photo → `PhotoSubmission` created with `window_id = null`, `arweave_tx_id = null`, `cardano_tx_id = null`
2. **Queued**: If Arweave/Cardano unavailable → `UploadQueue` entries created
3. **Arweave Uploaded**: Arweave upload succeeds → `arweave_tx_id` updated, `UploadQueue` status = 'completed'
4. **Cardano Logged**: Cardano transaction succeeds → `cardano_tx_id` updated, `AuditTrail` entry created with `confirmed_at`
5. **Window Assigned**: User assigns to window → `window_id` updated, new `AuditTrail` entry for edit action
6. **Edited**: User edits metadata → `metadata` updated, new `AuditTrail` entry for edit action
7. **Deleted**: User deletes submission → `deleted_at` set, new `AuditTrail` entry for delete action (blockchain records remain)

### UploadQueue Lifecycle

1. **Pending**: Queue entry created → `status = 'pending'`, `next_retry_at` set
2. **Processing**: Worker picks up entry → `status = 'processing'`
3. **Completed**: Upload succeeds → `status = 'completed'`
4. **Failed**: Upload fails → `status = 'failed'`, `retry_count++`, `next_retry_at` recalculated (exponential backoff)
5. **Max Retries**: After 10 retries → Flag for manual review

## Validation Rules Summary

### Church
- Unique: `(name, county, town, latitude, longitude)`
- Coordinates required for uploads

### PhotoSubmission
- Duplicate detection: Same `image_hash` + same `window_id` + within 1 hour = reject
- Location verification: Within 50m of church coordinates (or manual override)
- Immutable fields: `image_hash`, `timestamp`, `latitude`, `longitude`, `arweave_tx_id`, `cardano_tx_id`, `user_id`
- Editable fields: `window_id`, `metadata`

### User
- Unique: `app_id`
- Server-side validation to prevent duplicates

## Database Migrations

Initial migration will create all tables with:
- Proper foreign key constraints
- Indexes for performance
- Unique constraints
- Default values
- Timestamp tracking (created_at, updated_at)

Future migrations may include:
- Additional indexes based on query patterns
- New fields for enhanced features
- Data migrations for schema changes
