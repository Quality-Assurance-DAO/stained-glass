---
description: "Task list for Stained Glass Window Tracking App implementation"
---

# Tasks: Stained Glass Window Tracking App

**Input**: Design documents from `/specs/001-stained-glass-tracking/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included unless explicitly requested. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/` (per plan.md structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan (backend/ and frontend/ directories)
- [ ] T002 Initialize backend Node.js 20.x project with TypeScript 5.x and Express.js 4.x dependencies in backend/
- [ ] T003 Initialize frontend React 18.x project with TypeScript 5.x, Vite 5.x, and Tailwind CSS 3.x dependencies in frontend/
- [ ] T004 [P] Configure ESLint and Prettier for backend in backend/
- [ ] T005 [P] Configure ESLint and Prettier for frontend in frontend/
- [ ] T006 [P] Setup Git repository structure and .gitignore files
- [ ] T007 [P] Create environment configuration templates (.env.example) for backend and frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Setup PostgreSQL 15+ database connection and TypeORM/Prisma configuration in backend/src/config/database.ts
- [ ] T009 Create database migration framework and initial migration setup in backend/src/migrations/
- [ ] T010 [P] Setup Express.js API routing structure and middleware in backend/src/api/app.ts
- [ ] T011 [P] Configure CORS middleware for frontend URL in backend/src/api/middleware/cors.ts
- [ ] T012 [P] Implement error handling middleware in backend/src/api/middleware/errorHandler.ts
- [ ] T013 [P] Setup logging infrastructure (Winston/Pino) in backend/src/utils/logger.ts
- [ ] T014 [P] Create environment configuration management in backend/src/config/env.ts
- [ ] T015 [P] Setup React Router 6.x routing structure in frontend/src/App.tsx
- [ ] T016 [P] Configure React Query (TanStack Query) for API state management in frontend/src/lib/queryClient.ts
- [ ] T017 [P] Create Axios API client configuration in frontend/src/services/api/client.ts
- [ ] T018 [P] Setup IndexedDB utilities for offline storage in frontend/src/utils/indexedDB.ts
- [ ] T019 Create base database models/entities that all stories depend on (Church, Window, User, PhotoSubmission) in backend/src/models/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search and View Churches and Windows (Priority: P1) 🎯 MVP

**Goal**: Users can search for churches by county and town, view church details with floor plan, and browse existing window submissions organized by window location.

**Independent Test**: Can be fully tested by allowing users to search for churches, view church details with orienting visuals, and browse existing window submissions without requiring any upload functionality. This delivers immediate value as a discovery and exploration tool.

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create Church model entity in backend/src/models/Church.ts
- [ ] T021 [P] [US1] Create Window model entity in backend/src/models/Window.ts
- [ ] T022 [P] [US1] Create PhotoSubmission model entity in backend/src/models/PhotoSubmission.ts
- [ ] T023 [US1] Create database migration for churches, windows, and photo_submissions tables in backend/src/migrations/
- [ ] T024 [US1] Implement ChurchService with search by county and town in backend/src/services/ChurchService.ts
- [ ] T025 [US1] Implement WindowService to get windows for a church in backend/src/services/WindowService.ts
- [ ] T026 [US1] Implement PhotoSubmissionService to get submissions for windows in backend/src/services/PhotoSubmissionService.ts
- [ ] T027 [US1] Create GET /churches/search endpoint in backend/src/api/routes/churches.ts
- [ ] T028 [US1] Create GET /churches/{churchId} endpoint in backend/src/api/routes/churches.ts
- [ ] T029 [US1] Create GET /churches/{churchId}/windows endpoint in backend/src/api/routes/windows.ts
- [ ] T030 [US1] Add validation and error handling for church search endpoints in backend/src/api/routes/churches.ts
- [ ] T031 [US1] Create ChurchSearchPage component in frontend/src/pages/ChurchSearchPage.tsx
- [ ] T032 [US1] Create ChurchDetailPage component with floor plan display in frontend/src/pages/ChurchDetailPage.tsx
- [ ] T033 [US1] Create WindowList component to display windows with submissions in frontend/src/components/WindowList.tsx
- [ ] T034 [US1] Create PhotoGallery component to display photos for a window in frontend/src/components/PhotoGallery.tsx
- [ ] T035 [US1] Implement API service methods for church search in frontend/src/services/api/churches.ts
- [ ] T036 [US1] Implement API service methods for window data in frontend/src/services/api/windows.ts
- [ ] T037 [US1] Add React Query hooks for church search in frontend/src/hooks/useChurches.ts
- [ ] T038 [US1] Add React Query hooks for church details in frontend/src/hooks/useChurchDetails.ts
- [ ] T039 [US1] Add React Query hooks for window submissions in frontend/src/hooks/useWindows.ts
- [ ] T040 [US1] Add routing for search and church detail pages in frontend/src/App.tsx
- [ ] T041 [US1] Implement primary photo selection logic (clearest/largest) in frontend/src/utils/photoSelection.ts
- [ ] T042 [US1] Add loading and error states for all API calls in frontend components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can search churches, view details, and browse window submissions.

---

## Phase 4: User Story 2 - Capture and Upload Photos with Location Verification (Priority: P2)

**Goal**: Users can take photos directly in the app, receive real-time feedback on photo quality, verify location matches church coordinates, and upload photos with metadata.

**Independent Test**: Can be fully tested by allowing users to take photos, receive quality feedback, verify location, and upload with metadata. This delivers value as a documentation tool even without AI analysis or blockchain storage initially.

### Implementation for User Story 2

- [ ] T043 [P] [US2] Create User model entity in backend/src/models/User.ts
- [ ] T044 [US2] Create database migration for users table in backend/src/migrations/
- [ ] T045 [US2] Implement location verification service using Haversine formula (50-meter tolerance) in backend/src/services/LocationService.ts
- [ ] T046 [US2] Implement photo quality assessment service (brightness, contrast, blur detection) in frontend/src/utils/imageQuality.ts
- [ ] T047 [US2] Create photo capture component with camera access in frontend/src/components/PhotoCapture.tsx
- [ ] T048 [US2] Implement real-time photo quality feedback UI in frontend/src/components/PhotoQualityFeedback.tsx
- [ ] T049 [US2] Create geolocation service wrapper with permission handling in frontend/src/utils/geolocation.ts
- [ ] T050 [US2] Implement location verification component with manual override option in frontend/src/components/LocationVerification.tsx
- [ ] T051 [US2] Create PhotoUploadPage component in frontend/src/pages/PhotoUploadPage.tsx
- [ ] T052 [US2] Implement POST /submissions endpoint with location verification in backend/src/api/routes/submissions.ts
- [ ] T053 [US2] Add file upload handling with Multer middleware in backend/src/api/middleware/upload.ts
- [ ] T054 [US2] Implement PhotoSubmissionService.create method with location validation in backend/src/services/PhotoSubmissionService.ts
- [ ] T055 [US2] Add validation for photo upload (file type, size, required fields) in backend/src/api/routes/submissions.ts
- [ ] T056 [US2] Implement upload queue service using IndexedDB for offline support in frontend/src/services/uploadQueue.ts
- [ ] T057 [US2] Create upload retry mechanism with exponential backoff in frontend/src/services/uploadQueue.ts
- [ ] T058 [US2] Implement API service method for photo upload in frontend/src/services/api/submissions.ts
- [ ] T059 [US2] Add React Query mutation for photo upload in frontend/src/hooks/usePhotoUpload.ts
- [ ] T060 [US2] Add upload progress and status feedback UI in frontend/src/components/UploadStatus.tsx
- [ ] T061 [US2] Add error handling for location verification failures in frontend and backend
- [ ] T062 [US2] Implement manual location override confirmation flow in frontend/src/components/LocationVerification.tsx

**Checkpoint**: At this point, User Story 2 should be fully functional. Users can capture photos, receive quality feedback, verify location, and upload photos with metadata.

---

## Phase 5: User Story 3 - Assign Photos to Windows Using Floor Plan (Priority: P3)

**Goal**: Users can assign uploaded photos to specific windows using the floor plan interface, organizing submissions by window location.

**Independent Test**: Can be fully tested by allowing users to upload photos and assign them to windows using the floor plan interface, organizing submissions by window location.

### Implementation for User Story 3

- [ ] T063 [US3] Create floor plan interactive component with clickable window areas in frontend/src/components/FloorPlan.tsx
- [ ] T064 [US3] Implement window selection handler in floor plan component in frontend/src/components/FloorPlan.tsx
- [ ] T065 [US3] Create photo assignment UI component in frontend/src/pages/PhotoAssignmentPage.tsx
- [ ] T066 [US3] Implement POST /submissions/{submissionId}/assign endpoint in backend/src/api/routes/submissions.ts
- [ ] T067 [US3] Add window assignment logic to PhotoSubmissionService in backend/src/services/PhotoSubmissionService.ts
- [ ] T068 [US3] Update PhotoSubmission model to handle window assignment in backend/src/models/PhotoSubmission.ts
- [ ] T069 [US3] Create database migration for window assignment updates in backend/src/migrations/
- [ ] T070 [US3] Implement API service method for photo assignment in frontend/src/services/api/submissions.ts
- [ ] T071 [US3] Add React Query mutation for photo assignment in frontend/src/hooks/usePhotoAssignment.ts
- [ ] T072 [US3] Update WindowList component to show assigned photos organized by window in frontend/src/components/WindowList.tsx
- [ ] T073 [US3] Add validation to ensure window belongs to correct church in backend/src/services/PhotoSubmissionService.ts
- [ ] T074 [US3] Update PhotoGallery component to filter photos by window assignment in frontend/src/components/PhotoGallery.tsx

**Checkpoint**: At this point, User Story 3 should be fully functional. Users can assign photos to windows using the floor plan and view organized submissions.

---

## Phase 6: User Story 4 - AI-Based Image Analysis and Quality Filtering (Priority: P3)

**Goal**: The app automatically analyzes uploaded images using AI to classify images, identify windows, select best photos, and filter out irrelevant or low-quality ones.

**Independent Test**: Can be fully tested by uploading various quality images and verifying that the AI correctly classifies them, identifies windows, selects best photos, and filters low-quality submissions.

### Implementation for User Story 4

- [ ] T075 [US4] Setup OpenAI GPT-4 Vision API or Google Cloud Vision API client in backend/src/services/AIService.ts
- [ ] T076 [US4] Implement AI image classification service method in backend/src/services/AIService.ts
- [ ] T077 [US4] Implement AI quality assessment service method in backend/src/services/AIService.ts
- [ ] T078 [US4] Implement AI window identification service method in backend/src/services/AIService.ts
- [ ] T079 [US4] Create background job processor for AI analysis queue in backend/src/jobs/aiAnalysisProcessor.ts
- [ ] T080 [US4] Add AI analysis results storage to PhotoSubmission model (ai_classification JSON field) in backend/src/models/PhotoSubmission.ts
- [ ] T081 [US4] Create database migration for AI classification fields in backend/src/migrations/
- [ ] T082 [US4] Integrate AI analysis into photo upload flow (async processing) in backend/src/services/PhotoSubmissionService.ts
- [ ] T083 [US4] Implement primary photo selection algorithm based on AI quality scores in backend/src/services/PhotoSubmissionService.ts
- [ ] T084 [US4] Add AI-suggested window assignment logic in backend/src/services/PhotoSubmissionService.ts
- [ ] T085 [US4] Implement image filtering logic (irrelevant/low-quality) in backend/src/services/PhotoSubmissionService.ts
- [ ] T086 [US4] Add flagging mechanism for manual assignment when AI fails in backend/src/services/PhotoSubmissionService.ts
- [ ] T087 [US4] Create API endpoint to get AI analysis results in backend/src/api/routes/submissions.ts
- [ ] T088 [US4] Update frontend to display AI analysis status and results in frontend/src/components/AIAnalysisStatus.tsx
- [ ] T089 [US4] Add UI for AI-suggested window assignments in frontend/src/components/AISuggestions.tsx
- [ ] T090 [US4] Implement error handling for AI API failures (fallback to manual assignment) in backend/src/services/AIService.ts

**Checkpoint**: At this point, User Story 4 should be fully functional. AI automatically analyzes images, suggests window assignments, and filters low-quality submissions.

---

## Phase 7: User Story 5 - Anonymous User Identity and Contribution Tracking (Priority: P4)

**Goal**: Users receive anonymous persistent app IDs, can optionally provide contact details, track contributions, and manage their own submissions.

**Independent Test**: Can be fully tested by using the app anonymously, verifying that contributions are tracked by app ID, optionally adding contact details, and managing own submissions.

### Implementation for User Story 5

- [ ] T091 [US5] Implement anonymous app ID generation (client-side UUID) in frontend/src/utils/appId.ts
- [ ] T092 [US5] Store app ID in IndexedDB for persistence in frontend/src/utils/appId.ts
- [ ] T093 [US5] Implement UserService.getOrCreate method for user lookup/creation in backend/src/services/UserService.ts
- [ ] T094 [US5] Add contribution tracking logic (count, quality average) to UserService in backend/src/services/UserService.ts
- [ ] T095 [US5] Update PhotoSubmissionService to update user contribution stats in backend/src/services/PhotoSubmissionService.ts
- [ ] T096 [US5] Create GET /users/{appId} endpoint in backend/src/api/routes/users.ts
- [ ] T097 [US5] Create PATCH /users/{appId} endpoint for contact details in backend/src/api/routes/users.ts
- [ ] T098 [US5] Create GET /users/{appId}/submissions endpoint in backend/src/api/routes/users.ts
- [ ] T099 [US5] Create UserProfilePage component in frontend/src/pages/UserProfilePage.tsx
- [ ] T100 [US5] Create UserSubmissionsList component in frontend/src/components/UserSubmissionsList.tsx
- [ ] T101 [US5] Implement API service methods for user profile in frontend/src/services/api/users.ts
- [ ] T102 [US5] Add React Query hooks for user profile in frontend/src/hooks/useUserProfile.ts
- [ ] T103 [US5] Implement PATCH /submissions/{submissionId} endpoint with ownership verification in backend/src/api/routes/submissions.ts
- [ ] T104 [US5] Implement DELETE /submissions/{submissionId} endpoint with soft delete in backend/src/api/routes/submissions.ts
- [ ] T105 [US5] Add soft delete logic (is_deleted flag) to PhotoSubmissionService in backend/src/services/PhotoSubmissionService.ts
- [ ] T106 [US5] Create EditSubmissionPage component in frontend/src/pages/EditSubmissionPage.tsx
- [ ] T107 [US5] Add edit/delete UI controls to submission detail views in frontend/src/components/SubmissionActions.tsx
- [ ] T108 [US5] Implement ownership verification middleware in backend/src/api/middleware/ownership.ts
- [ ] T109 [US5] Update PhotoSubmission queries to filter deleted submissions in backend/src/services/PhotoSubmissionService.ts
- [ ] T110 [US5] Add contribution statistics display in UserProfilePage in frontend/src/pages/UserProfilePage.tsx

**Checkpoint**: At this point, User Story 5 should be fully functional. Users have anonymous IDs, can track contributions, and manage their submissions.

---

## Phase 8: User Story 6 - View Blockchain Records and Audit Trail (Priority: P4)

**Goal**: Users can view Arweave records storing images and metadata, and Cardano audit trail associated with each window and upload.

**Independent Test**: Can be fully tested by viewing any window submission and accessing its associated Arweave record and Cardano audit trail.

### Implementation for User Story 6

- [ ] T111 [US6] Setup arweave-js SDK configuration in backend/src/storage/arweave.ts
- [ ] T112 [US6] Implement Arweave upload service for images and metadata in backend/src/storage/arweave.ts
- [ ] T113 [US6] Setup Cardano SDK (@meshsdk/core) configuration in backend/src/storage/cardano.ts
- [ ] T114 [US6] Implement Cardano transaction service for audit trail logging in backend/src/storage/cardano.ts
- [ ] T115 [US6] Create database queue table for Arweave/Cardano uploads in backend/src/migrations/
- [ ] T116 [US6] Implement upload queue processor with retry logic in backend/src/jobs/blockchainProcessor.ts
- [ ] T117 [US6] Integrate Arweave upload into photo submission flow in backend/src/services/PhotoSubmissionService.ts
- [ ] T118 [US6] Integrate Cardano audit trail logging into photo submission flow in backend/src/services/PhotoSubmissionService.ts
- [ ] T119 [US6] Update PhotoSubmission model to store arweave_tx_id and cardano_tx_hash in backend/src/models/PhotoSubmission.ts
- [ ] T120 [US6] Create database migration for blockchain transaction IDs in backend/src/migrations/
- [ ] T121 [US6] Create GET /blockchain/arweave/{txId} endpoint in backend/src/api/routes/blockchain.ts
- [ ] T122 [US6] Create GET /blockchain/cardano/{txHash} endpoint in backend/src/api/routes/blockchain.ts
- [ ] T123 [US6] Implement Arweave record retrieval service in backend/src/storage/arweave.ts
- [ ] T124 [US6] Implement Cardano transaction retrieval service in backend/src/storage/cardano.ts
- [ ] T125 [US6] Create BlockchainRecordViewer component in frontend/src/components/BlockchainRecordViewer.tsx
- [ ] T126 [US6] Add Arweave explorer link generation in frontend/src/utils/blockchain.ts
- [ ] T127 [US6] Add Cardano explorer link generation in frontend/src/utils/blockchain.ts
- [ ] T128 [US6] Implement API service methods for blockchain records in frontend/src/services/api/blockchain.ts
- [ ] T129 [US6] Add React Query hooks for blockchain records in frontend/src/hooks/useBlockchainRecords.ts
- [ ] T130 [US6] Integrate blockchain record viewer into submission detail pages in frontend/src/pages/SubmissionDetailPage.tsx
- [ ] T131 [US6] Add blockchain record status indicators (pending, uploaded, failed) in frontend components
- [ ] T132 [US6] Implement retry mechanism for failed blockchain uploads in backend/src/jobs/blockchainProcessor.ts

**Checkpoint**: At this point, User Story 6 should be fully functional. Users can view Arweave records and Cardano audit trails for all submissions.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T133 [P] Add comprehensive error boundaries in frontend/src/components/ErrorBoundary.tsx
- [ ] T134 [P] Implement loading skeletons for all async operations in frontend/src/components/LoadingSkeleton.tsx
- [ ] T135 [P] Add responsive design improvements for mobile devices across all pages
- [ ] T136 [P] Optimize image loading and lazy loading in frontend/src/components/ImageLoader.tsx
- [ ] T137 [P] Add pagination for large result sets (churches, windows, submissions) in backend services
- [ ] T138 [P] Implement caching strategy for frequently accessed church data in backend/src/services/CacheService.ts
- [ ] T139 [P] Add rate limiting middleware for API endpoints in backend/src/api/middleware/rateLimit.ts
- [ ] T140 [P] Implement input validation and sanitization across all API endpoints
- [ ] T141 [P] Add comprehensive logging for all critical operations in backend services
- [ ] T142 [P] Create API documentation using OpenAPI spec in backend/docs/
- [ ] T143 [P] Add accessibility improvements (ARIA labels, keyboard navigation) across frontend components
- [ ] T144 [P] Optimize database queries with proper indexes (verify all indexes from data-model.md)
- [ ] T145 [P] Add monitoring and health check endpoints in backend/src/api/routes/health.ts
- [ ] T146 [P] Implement CDN configuration for static assets and images
- [ ] T147 [P] Run quickstart.md validation checklist
- [ ] T148 [P] Add performance monitoring and analytics
- [ ] T149 [P] Security audit: HTTPS enforcement, CORS validation, input sanitization review
- [ ] T150 [P] Cross-browser testing and compatibility fixes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3 → P4)
  - US2 depends on US1 (needs churches and windows to exist)
  - US3 depends on US2 (needs photo submissions to assign)
  - US4 can start after US2 (analyzes uploaded photos)
  - US5 can start after US2 (tracks user contributions)
  - US6 depends on US2 (needs submissions to store on blockchain)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (needs churches and windows to upload photos for)
- **User Story 3 (P3)**: Depends on US2 (needs photo submissions to assign)
- **User Story 4 (P3)**: Depends on US2 (analyzes uploaded photos), can run parallel with US3
- **User Story 5 (P4)**: Depends on US2 (tracks contributions), can run parallel with US3/US4
- **User Story 6 (P4)**: Depends on US2 (needs submissions to store on blockchain), can run parallel with US3/US4/US5

### Within Each User Story

- Models before services
- Services before endpoints/UI
- Backend API before frontend integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Models within a story marked [P] can run in parallel
- US4, US5, and US6 can run in parallel after US2 completes
- Different components/services marked [P] within a story can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create Church model entity in backend/src/models/Church.ts"
Task: "Create Window model entity in backend/src/models/Window.ts"
Task: "Create PhotoSubmission model entity in backend/src/models/PhotoSubmission.ts"

# Launch all service implementations together (after models):
Task: "Implement ChurchService with search by county and town in backend/src/services/ChurchService.ts"
Task: "Implement WindowService to get windows for a church in backend/src/services/WindowService.ts"
Task: "Implement PhotoSubmissionService to get submissions for windows in backend/src/services/PhotoSubmissionService.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch frontend and backend work in parallel:
Task: "Implement photo quality assessment service in frontend/src/utils/imageQuality.ts"
Task: "Implement location verification service using Haversine formula in backend/src/services/LocationService.ts"
Task: "Create photo capture component with camera access in frontend/src/components/PhotoCapture.tsx"
Task: "Create geolocation service wrapper in frontend/src/utils/geolocation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Search and View Churches and Windows)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Polish & Cross-Cutting → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: Prepares User Story 2 components
3. After US1 completes:
   - Developer A: User Story 2
   - Developer B: User Story 3
   - Developer C: User Story 4 (can start after US2)
4. After US2 completes:
   - Developer A: User Story 5
   - Developer B: User Story 6
   - Developer C: Polish & optimization

Stories complete and integrate independently.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths follow web app structure: `backend/src/` and `frontend/src/`
- Tests are OPTIONAL - not included unless explicitly requested
- Focus on implementation tasks that deliver working features

