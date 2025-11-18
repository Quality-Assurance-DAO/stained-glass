# Feature Specification: Stained Glass Window Tracking App

**Feature Branch**: `001-stained-glass-tracking`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Develop a cross-platform, install-free web app that enables users to easily record and track stained glass windows in churches, storing all image files and metadata on Arweave with an audit trail logged to the Cardano blockchain; the app should open with a simple search interface allowing users to find churches by county and town, then display an orienting visual (e.g., floor plan or spatial overlay) for the selected church; the app must detect whether windows for that church have already been photographed and display existing submissions while still allowing additional crowdsourced uploads, using AI-based image analysis to classify images, identify windows, select the clearest or largest valid photos, and filter out irrelevant or low-quality ones; the app should request location-sharing consent when needed and use the user's geolocation to verify they are at the correct church before accepting an upload; users must be able to take photos directly in the app, receive feedback on unusable shots (too dark, too bright, poorly framed, etc.), and then assign the image to the correct window using a floor plan or another post-facto classification method that organizes multiple images of the same church by window; upon upload, the app should attach metadata such as timestamp and verified location, rejecting submissions that do not match the church's registered coordinates; users do not need to reveal personal identity but should have an anonymous persistent app ID to track contribution volume and quality, with optional contact details, plus the ability to edit or delete their own submissions; finally, include a simple interface for users to view the immutable Arweave records and the Cardano audit trail associated with each window and upload."

## Clarifications

### Session 2025-01-27

- Q: What is the location verification tolerance radius for matching user location to church coordinates? → A: 50 meters
- Q: What happens when a user's device cannot determine location (GPS disabled, indoors, etc.)? → A: Allow manual override with warning (user confirms they're at correct church)
- Q: What happens when Arweave or Cardano networks are temporarily unavailable? → A: Queue uploads locally, retry automatically
- Q: What happens when AI analysis fails or cannot classify an image? → A: Flag for manual assignment, allow upload
- Q: What happens when a user deletes a submission - does it remove from Arweave/Cardano or just mark as deleted? → A: Mark as deleted in app, blockchain records remain

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search and View Churches and Windows (Priority: P1)

A user opens the app and wants to find a church and see what stained glass windows have been documented. They search by county and town, select a church, and view an orienting visual (floor plan or spatial overlay) showing the church layout. The app displays all existing window submissions for that church, organized by window location.

**Why this priority**: This is the core discovery functionality that enables users to understand what has been documented and what still needs to be photographed. Without this, users cannot effectively contribute or explore the collection.

**Independent Test**: Can be fully tested by allowing users to search for churches, view church details with orienting visuals, and browse existing window submissions without requiring any upload functionality. This delivers immediate value as a discovery and exploration tool.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** they search for churches by county and town, **Then** they see a list of matching churches
2. **Given** a user selects a church from search results, **When** the church details load, **Then** they see an orienting visual (floor plan or spatial overlay) showing the church layout
3. **Given** a user views a church with existing window submissions, **When** they examine the orienting visual, **Then** they see which windows have been photographed and can view those images
4. **Given** a user views a church with no existing submissions, **When** they examine the orienting visual, **Then** they see all windows marked as undocumented
5. **Given** a user views existing window submissions, **When** multiple images exist for the same window, **Then** they see the clearest or largest valid photo prominently displayed

---

### User Story 2 - Capture and Upload Photos with Location Verification (Priority: P2)

A user wants to contribute photos of stained glass windows. They take photos directly in the app, receive real-time feedback on photo quality (too dark, too bright, poorly framed), and upload photos that pass quality checks. The app verifies their location matches the church's registered coordinates before accepting the upload, attaching timestamp and verified location metadata.

**Why this priority**: This is the core contribution mechanism that enables crowdsourced documentation. Location verification ensures data integrity and prevents incorrect associations.

**Independent Test**: Can be fully tested by allowing users to take photos, receive quality feedback, verify location, and upload with metadata. This delivers value as a documentation tool even without AI analysis or blockchain storage initially.

**Acceptance Scenarios**:

1. **Given** a user selects a church, **When** they attempt to upload a photo, **Then** the app requests location-sharing consent if not already granted
2. **Given** a user grants location permission, **When** they take a photo in the app, **Then** they receive immediate feedback on photo quality (too dark, too bright, poorly framed, etc.)
3. **Given** a user takes a photo that fails quality checks, **When** they review the feedback, **Then** they understand what needs to be improved and can retake the photo
4. **Given** a user takes a photo that passes quality checks, **When** they attempt to upload, **Then** the app verifies their location matches the church's registered coordinates
5. **Given** a user's location matches the church coordinates, **When** they upload a photo, **Then** the app attaches timestamp and verified location metadata
6. **Given** a user's location does not match the church coordinates, **When** they attempt to upload, **Then** the app rejects the submission with an explanation
7. **Given** a user's device cannot determine location (GPS disabled, indoors, etc.), **When** they attempt to upload, **Then** the app offers a manual override option with a warning requiring confirmation they are at the correct church
8. **Given** a user uses manual location override, **When** they confirm they are at the correct church, **Then** the upload proceeds with location marked as manually verified
9. **Given** Arweave or Cardano networks are temporarily unavailable, **When** a user uploads a photo, **Then** the upload is queued locally and automatically retried until successful
10. **Given** a user successfully uploads a photo, **When** the upload completes, **Then** they receive confirmation and the photo appears in the church's window collection

---

### User Story 3 - Assign Photos to Windows Using Floor Plan (Priority: P3)

A user uploads a photo and needs to assign it to the correct window. They use the floor plan or spatial overlay to select which window the photo represents. The app organizes multiple images of the same church by window, allowing users to see all photos for each specific window.

**Why this priority**: This enables proper organization of contributions and makes the collection navigable. Without window assignment, photos would be disorganized and difficult to use.

**Independent Test**: Can be fully tested by allowing users to upload photos and assign them to windows using the floor plan interface, organizing submissions by window location. This delivers value as an organizational tool.

**Acceptance Scenarios**:

1. **Given** a user uploads a photo, **When** the upload completes, **Then** they are prompted to assign the photo to a window using the floor plan
2. **Given** a user views the floor plan, **When** they select a window location, **Then** the photo is assigned to that window
3. **Given** a user views a church's window collection, **When** they examine a specific window, **Then** they see all photos assigned to that window
4. **Given** multiple photos exist for the same window, **When** a user views that window, **Then** they see all photos organized together, with the clearest or largest valid photo prominently displayed

---

### User Story 4 - AI-Based Image Analysis and Quality Filtering (Priority: P3)

The app automatically analyzes uploaded images using AI to classify images, identify windows, select the clearest or largest valid photos, and filter out irrelevant or low-quality ones. This happens automatically in the background to improve the collection quality.

**Why this priority**: This enhances the user experience by automatically organizing and curating submissions, ensuring the best photos are displayed while filtering out poor-quality or irrelevant images.

**Independent Test**: Can be fully tested by uploading various quality images and verifying that the AI correctly classifies them, identifies windows, selects best photos, and filters low-quality submissions. This delivers value as an automated curation system.

**Acceptance Scenarios**:

1. **Given** a user uploads multiple photos of the same window, **When** AI analysis completes, **Then** the clearest or largest valid photo is selected as the primary display image
2. **Given** a user uploads an irrelevant image (not a stained glass window), **When** AI analysis completes, **Then** the image is filtered out or flagged for review
3. **Given** a user uploads a low-quality image (blurry, too dark, too bright), **When** AI analysis completes, **Then** the image is filtered out or marked as low quality
4. **Given** AI analyzes an uploaded image, **When** classification completes, **Then** the image is automatically assigned to the correct window if possible, or flagged for manual assignment
5. **Given** AI analysis fails or cannot classify an image, **When** the upload completes, **Then** the image is flagged for manual assignment and the upload proceeds successfully

---

### User Story 5 - Anonymous User Identity and Contribution Tracking (Priority: P4)

A user uses the app without revealing personal identity. They receive an anonymous persistent app ID that tracks their contribution volume and quality. They can optionally provide contact details and can edit or delete their own submissions.

**Why this priority**: This enables user accountability and contribution tracking while respecting privacy. The ability to manage own submissions provides user control and data quality.

**Independent Test**: Can be fully tested by using the app anonymously, verifying that contributions are tracked by app ID, optionally adding contact details, and managing own submissions. This delivers value as a privacy-respecting contribution system.

**Acceptance Scenarios**:

1. **Given** a user opens the app for the first time, **When** they begin using it, **Then** they receive an anonymous persistent app ID automatically
2. **Given** a user makes contributions, **When** they view their profile, **Then** they see their contribution volume and quality metrics tracked by app ID
3. **Given** a user wants to provide contact details, **When** they access settings, **Then** they can optionally add contact information
4. **Given** a user views their own submissions, **When** they select a submission, **Then** they can edit or delete it
5. **Given** a user edits their submission, **When** they save changes, **Then** the updated information is reflected in the collection
6. **Given** a user deletes their submission, **When** they confirm deletion, **Then** the submission is marked as deleted and removed from the active collection, but Arweave and Cardano records remain immutable

---

### User Story 6 - View Blockchain Records and Audit Trail (Priority: P4)

A user wants to verify the immutability and provenance of window submissions. They can view the Arweave records storing images and metadata, and the Cardano audit trail associated with each window and upload.

**Why this priority**: This provides transparency and verifiability, demonstrating that records are immutable and auditable. This is important for trust and long-term preservation.

**Independent Test**: Can be fully tested by viewing any window submission and accessing its associated Arweave record and Cardano audit trail. This delivers value as a transparency and verification tool.

**Acceptance Scenarios**:

1. **Given** a user views a window submission, **When** they access record details, **Then** they can view the immutable Arweave record containing the image and metadata
2. **Given** a user views a window submission, **When** they access audit trail, **Then** they can view the Cardano blockchain audit trail associated with that upload
3. **Given** a user views multiple submissions for a window, **When** they examine each submission, **Then** each has its own Arweave record and Cardano audit trail
4. **Given** a user views blockchain records, **When** they examine the data, **Then** they can verify timestamp, location, and other metadata matches what is displayed in the app

---

### Edge Cases

- What happens when a user's device cannot determine location (GPS disabled, indoors, etc.)? (Answer: Manual override with warning and user confirmation per FR-026)
- How does the system handle churches with identical names in the same county/town?
- What happens when a user uploads a photo but their location is more than 50 meters from the church's registered coordinates? (Answer: Submission is rejected per FR-008)
- How does the system handle churches with no registered coordinates?
- What happens when AI analysis fails or cannot classify an image? (Answer: Flag for manual assignment and allow upload per FR-028)
- How does the system handle users who delete all their submissions - does their app ID remain? (Answer: App ID remains; deleted submissions are marked as deleted in app but blockchain records remain immutable per FR-021)
- What happens when Arweave or Cardano networks are temporarily unavailable? (Answer: Queue uploads locally and retry automatically per FR-027)
- How does the system handle duplicate submissions of the same photo?
- What happens when a user uploads photos for a church that doesn't exist in the database?
- How does the system handle floor plans that don't match the actual church layout?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a search interface allowing users to find churches by county and town
- **FR-002**: System MUST display an orienting visual (floor plan or spatial overlay) for each selected church
- **FR-003**: System MUST detect and display existing window submissions for each church
- **FR-004**: System MUST allow users to take photos directly within the app
- **FR-005**: System MUST provide real-time feedback on photo quality (too dark, too bright, poorly framed, etc.)
- **FR-006**: System MUST request location-sharing consent when needed
- **FR-007**: System MUST verify user's geolocation is within 50 meters of the church's registered coordinates before accepting uploads, OR allow manual override with user confirmation when location cannot be determined
- **FR-008**: System MUST reject submissions when user location is more than 50 meters from church coordinates (unless manual override is used)
- **FR-026**: System MUST display a warning and require explicit user confirmation when manual location override is used
- **FR-009**: System MUST attach timestamp and verified location metadata to all uploads
- **FR-010**: System MUST allow users to assign photos to windows using floor plan or spatial overlay
- **FR-011**: System MUST organize multiple images of the same church by window
- **FR-012**: System MUST use AI-based image analysis to classify images and identify windows
- **FR-013**: System MUST use AI to select the clearest or largest valid photos for display
- **FR-014**: System MUST use AI to filter out irrelevant or low-quality images
- **FR-028**: System MUST flag images for manual assignment when AI analysis fails or cannot classify, and allow upload to proceed
- **FR-015**: System MUST store all image files and metadata on Arweave (queue locally and retry automatically if network unavailable)
- **FR-016**: System MUST log an audit trail to the Cardano blockchain for each upload (queue locally and retry automatically if network unavailable)
- **FR-027**: System MUST queue uploads locally when Arweave or Cardano networks are unavailable and automatically retry until successful
- **FR-017**: System MUST generate an anonymous persistent app ID for each user automatically
- **FR-018**: System MUST track contribution volume and quality by app ID
- **FR-019**: System MUST allow users to optionally provide contact details
- **FR-020**: System MUST allow users to edit their own submissions
- **FR-021**: System MUST allow users to delete their own submissions (marks as deleted in app; Arweave and Cardano records remain immutable)
- **FR-022**: System MUST provide an interface for users to view Arweave records associated with each window and upload
- **FR-023**: System MUST provide an interface for users to view Cardano audit trail associated with each window and upload
- **FR-024**: System MUST function as a cross-platform, install-free web app
- **FR-025**: System MUST continue allowing additional crowdsourced uploads even when windows have already been photographed

### Key Entities

- **Church**: Represents a physical church building with registered coordinates, county, town, name, and an orienting visual (floor plan or spatial overlay). Has multiple windows.
- **Window**: Represents a stained glass window within a church, identified by location on the floor plan. Has multiple photo submissions.
- **Photo Submission**: Represents a user-uploaded photo of a stained glass window, containing the image file, timestamp, verified location (GPS-verified or manually verified), assigned window, and references to Arweave record and Cardano audit trail.
- **User**: Represents an anonymous user identified by persistent app ID, with optional contact details, contribution volume, and quality metrics. Has multiple photo submissions.
- **Arweave Record**: Represents the immutable storage record containing image file and metadata, referenced by photo submissions.
- **Cardano Audit Trail**: Represents the blockchain audit log entry for a photo submission, referenced by photo submissions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can search for and find a church by county and town in under 10 seconds
- **SC-002**: Users can successfully upload a photo with location verification in under 2 minutes from photo capture to confirmation
- **SC-003**: 95% of uploaded photos pass initial quality checks or receive actionable feedback
- **SC-004**: 90% of location verifications correctly match or reject submissions based on coordinate proximity
- **SC-005**: AI analysis correctly classifies and identifies windows in 85% of uploaded images
- **SC-006**: Users can assign a photo to a window using the floor plan in under 30 seconds
- **SC-007**: All successful uploads are stored on Arweave and logged to Cardano within 5 minutes of submission (or queued for automatic retry if networks unavailable)
- **SC-008**: Users can view Arweave records and Cardano audit trails for any submission in under 3 seconds
- **SC-009**: The app functions correctly across all major web browsers and mobile devices without requiring installation
- **SC-010**: Users can edit or delete their own submissions within 10 seconds of accessing the submission details

## Assumptions

- Churches have registered coordinates used for location verification with a 50-meter tolerance radius
- Floor plans or spatial overlays are available for churches in the database (or can be added during church registration)
- Arweave and Cardano networks are generally available and accessible from the web app
- Users have devices with camera and location services capabilities when contributing photos
- AI image analysis services are available and can process images within reasonable timeframes
- The app will support common image formats (JPEG, PNG) from device cameras
- Anonymous app IDs are generated client-side and stored locally, with server-side association for contribution tracking
- Users understand that deleting submissions removes them from the active collection but blockchain records remain immutable (Arweave and Cardano records cannot be deleted)
