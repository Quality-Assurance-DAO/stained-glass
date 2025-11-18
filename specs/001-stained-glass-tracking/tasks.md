---
description: "Task list for Stained Glass Window Tracking App implementation"
---

# Tasks: Stained Glass Window Tracking App

**Feature**: Stained Glass Window Tracking App  
**Branch**: `001-stained-glass-tracking`  
**Generated**: 2025-01-27  
**Input**: Design documents from `/specs/001-stained-glass-tracking/`

## Overview

This document provides an actionable, dependency-ordered task list for implementing the Stained Glass Window Tracking App. Tasks are organized by user story to enable independent implementation and testing.

**Total Tasks**: 150+  
**MVP Scope**: User Story 0 + User Story 1 (Developer Setup + Search/View Churches)  
**Full Scope**: All user stories (P0-P4)

## Task Format

Every task follows this strict format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:
- **Checkbox**: `- [ ]` (markdown checkbox)
- **Task ID**: Sequential number (T001, T002, T003...)
- **[P] marker**: Optional, indicates task is parallelizable (different files, no dependencies)
- **[Story] label**: Optional, indicates user story (US0, US1, US2, etc.)
  - Setup phase: NO story label
  - Foundational phase: NO story label
  - User Story phases: MUST have story label
  - Polish phase: NO story label
- **Description**: Clear action with exact file path

**Examples**:
- ✅ `- [ ] T001 Create project structure per implementation plan`
- ✅ `- [ ] T005 [P] Implement authentication middleware in backend/src/middleware/auth.ts`
- ✅ `- [ ] T012 [P] [US1] Create Church model in backend/src/models/Church.ts`
- ✅ `- [ ] T014 [US1] Implement ChurchService in backend/src/services/ChurchService.ts`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project initialization and basic structure  
**Dependencies**: None  
**Parallel Opportunities**: All tasks marked [P] can run in parallel

- [X] T001 Create project structure per implementation plan (backend/ and frontend/ directories at repository root)
- [X] T002 [P] Initialize backend Node.js 20.x project with TypeScript 5.x, Express.js 4.x, and Prisma dependencies in backend/package.json
- [X] T003 [P] Initialize frontend React 18.x project with TypeScript 5.x, Vite 5.x, and Tailwind CSS 3.x dependencies in frontend/package.json
- [X] T004 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.json and backend/.prettierrc
- [X] T005 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.json and frontend/.prettierrc
- [X] T006 [P] Setup Git repository structure and .gitignore files at repository root
- [X] T007 [P] Create environment configuration templates (.env.example) for backend in backend/.env.example
- [X] T008 [P] Create environment configuration templates (.env.example) for frontend in frontend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented  
**Dependencies**: Phase 1 (Setup)  
**⚠️ CRITICAL**: No user story work can begin until this phase is complete  
**Parallel Opportunities**: All tasks marked [P] can run in parallel

- [X] T009 Setup PostgreSQL 15+ database connection and Prisma configuration in backend/src/config/database.ts
- [X] T010 Create Prisma schema file with base models in backend/prisma/schema.prisma
- [X] T011 [P] Setup Express.js API routing structure and middleware in backend/src/api/app.ts
- [X] T012 [P] Configure CORS middleware for frontend URL in backend/src/api/middleware/cors.ts
- [X] T013 [P] Implement error handling middleware in backend/src/api/middleware/errorHandler.ts
- [X] T014 [P] Setup logging infrastructure (Pino) in backend/src/utils/logger.ts
- [X] T015 [P] Create environment configuration management in backend/src/config/env.ts
- [X] T016 [P] Setup React Router 6.x routing structure in frontend/src/App.tsx
- [X] T017 [P] Configure React Query (TanStack Query) for API state management in frontend/src/lib/queryClient.ts
- [X] T018 [P] Create Axios API client configuration in frontend/src/services/api/client.ts
- [X] T019 [P] Setup IndexedDB utilities for offline storage in frontend/src/utils/indexedDB.ts
- [X] T020 Create base database models/entities that all stories depend on (Church, Window, User, PhotoSubmission) in backend/prisma/schema.prisma
- [X] T021 Create initial database migration in backend/prisma/migrations/

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 0 - Developer Sets Up and Tests Local Environment (Priority: P0)

**Goal**: A developer can set up the complete application stack on their local machine, install dependencies, configure services, start all components, and verify core functionality works correctly.

**Independent Test**: Can be fully tested by a developer following setup instructions on a clean machine, successfully starting all application components (frontend, backend, database) without errors, and executing core user workflows to verify expected behavior.

**Dependencies**: Phase 1 (Setup), Phase 2 (Foundational)

### Implementation for User Story 0

- [X] T022 [US0] Create comprehensive setup documentation in README.md at repository root
- [X] T023 [US0] Create setup script to check prerequisites (Node.js, PostgreSQL) in scripts/check-prerequisites.sh
- [X] T024 [US0] Create database initialization script in backend/scripts/init-db.sh
- [X] T025 [US0] Create development server startup script in backend/scripts/dev.sh
- [X] T026 [US0] Create development server startup script in frontend/scripts/dev.sh
- [X] T027 [US0] Create combined startup script for all services in scripts/start-dev.sh
- [X] T028 [US0] Add npm scripts for development workflow in backend/package.json (dev, build, migrate, reset)
- [X] T029 [US0] Add npm scripts for development workflow in frontend/package.json (dev, build, preview)
- [X] T030 [US0] Create database reset script in backend/scripts/reset-db.sh
- [X] T031 [US0] Create environment validation script in backend/scripts/validate-env.ts
- [X] T032 [US0] Create mock/test versions of external services (Arweave, Cardano) in backend/src/services/mocks/
- [X] T033 [US0] Add health check endpoint in backend/src/api/routes/health.ts
- [ ] T034 [US0] Create quickstart validation checklist in docs/quickstart-checklist.md
- [X] T035 [US0] Add hot-reload configuration for backend in backend/vite.config.ts or backend/tsconfig.json
- [X] T036 [US0] Add hot-reload configuration for frontend in frontend/vite.config.ts
- [X] T037 [US0] Create logging output helpers for developers in backend/src/utils/devLogger.ts

**Checkpoint**: At this point, User Story 0 should be complete. Developers can follow setup instructions, start all services, and verify functionality.

---

## Phase 4: User Story 1 - Search and View Churches and Windows (Priority: P1) 🎯 MVP

**Goal**: Users can search for churches by county and town, view church details with floor plan, and browse existing window submissions organized by window location.

**Independent Test**: Can be fully tested by allowing users to search for churches, view church details with orienting visuals, and browse existing window submissions without requiring any upload functionality. This delivers immediate value as a discovery and exploration tool.

**Dependencies**: Phase 2 (Foundational), Phase 3 (User Story 0)

### Implementation for User Story 1

- [ ] T038 [P] [US1] Create Church model entity in backend/prisma/schema.prisma
- [ ] T039 [P] [US1] Create Window model entity in backend/prisma/schema.prisma
- [ ] T040 [P] [US1] Create PhotoSubmission model entity in backend/prisma/schema.prisma
- [ ] T041 [US1] Create database migration for churches, windows, and photo_submissions tables in backend/prisma/migrations/
- [ ] T042 [US1] Generate Prisma client after schema updates in backend/
- [ ] T043 [US1] Implement ChurchService with search by county and town in backend/src/services/ChurchService.ts
- [ ] T044 [US1] Implement WindowService to get windows for a church in backend/src/services/WindowService.ts
- [ ] T045 [US1] Implement PhotoSubmissionService to get submissions for windows in backend/src/services/PhotoSubmissionService.ts
- [ ] T046 [US1] Create GET /churches/search endpoint in backend/src/api/routes/churches.ts
- [ ] T047 [US1] Create GET /churches/{churchId} endpoint in backend/src/api/routes/churches.ts
- [ ] T048 [US1] Create GET /churches/{churchId}/windows endpoint in backend/src/api/routes/windows.ts
- [ ] T049 [US1] Add validation and error handling for church search endpoints in backend/src/api/routes/churches.ts
- [ ] T050 [US1] Add pagination support for church search in backend/src/services/ChurchService.ts
- [ ] T051 [P] [US1] Create ChurchSearchPage component in frontend/src/pages/ChurchSearchPage.tsx
- [ ] T052 [P] [US1] Create ChurchDetailPage component with floor plan display in frontend/src/pages/ChurchDetailPage.tsx
- [ ] T053 [P] [US1] Create WindowList component to display windows with submissions in frontend/src/components/WindowList.tsx
- [ ] T054 [P] [US1] Create PhotoGallery component to display photos for a window in frontend/src/components/PhotoGallery.tsx
- [ ] T055 [P] [US1] Create FloorPlanViewer component to display church floor plan in frontend/src/components/FloorPlanViewer.tsx
- [ ] T056 [US1] Implement API service methods for church search in frontend/src/services/api/churches.ts
- [ ] T057 [US1] Implement API service methods for window data in frontend/src/services/api/windows.ts
- [ ] T058 [US1] Add React Query hooks for church search in frontend/src/hooks/useChurches.ts
- [ ] T059 [US1] Add React Query hooks for church details in frontend/src/hooks/useChurchDetails.ts
- [ ] T060 [US1] Add React Query hooks for window submissions in frontend/src/hooks/useWindows.ts
- [ ] T061 [US1] Add routing for search and church detail pages in frontend/src/App.tsx
- [ ] T062 [US1] Implement primary photo selection logic (clearest/largest) in frontend/src/utils/photoSelection.ts
- [ ] T063 [US1] Add loading and error states for all API calls in frontend components
- [ ] T064 [US1] Add database indexes for church search performance (county, town, name) in backend/prisma/schema.prisma

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can search churches, view details, and browse window submissions.

---

## Phase 5: User Story 2 - Capture and Upload Photos with Location Verification (Priority: P2)

**Goal**: Users can take photos directly in the app, receive real-time feedback on photo quality, verify location matches church coordinates, and upload photos with metadata.

**Independent Test**: Can be fully tested by allowing users to take photos, receive quality feedback, verify location, and upload with metadata. This delivers value as a documentation tool even without AI analysis or blockchain storage initially.

**Dependencies**: Phase 4 (User Story 1 - needs churches and windows to exist)

### Implementation for User Story 2

- [X] T065 [P] [US2] Create User model entity in backend/prisma/schema.prisma
- [X] T066 [US2] Create database migration for users table in backend/prisma/migrations/
- [X] T067 [US2] Implement location verification service using Haversine formula (50-meter tolerance) in backend/src/services/LocationService.ts
- [X] T068 [P] [US2] Implement photo quality assessment service (brightness, contrast, blur detection) in frontend/src/utils/imageQuality.ts
- [X] T069 [P] [US2] Create photo capture component with camera access in frontend/src/components/PhotoCapture.tsx
- [X] T070 [US2] Implement real-time photo quality feedback UI in frontend/src/components/PhotoQualityFeedback.tsx
- [X] T071 [P] [US2] Create geolocation service wrapper with permission handling in frontend/src/utils/geolocation.ts
- [X] T072 [US2] Implement location verification component with manual override option in frontend/src/components/LocationVerification.tsx
- [X] T073 [US2] Create PhotoUploadPage component in frontend/src/pages/PhotoUploadPage.tsx
- [X] T074 [US2] Implement POST /submissions endpoint with location verification in backend/src/api/routes/submissions.ts
- [X] T075 [US2] Add file upload handling with Multer middleware in backend/src/api/middleware/upload.ts
- [X] T076 [US2] Implement PhotoSubmissionService.create method with location validation in backend/src/services/PhotoSubmissionService.ts
- [X] T077 [US2] Add validation for photo upload (file type, size, required fields) in backend/src/api/routes/submissions.ts
- [X] T078 [US2] Implement image hash calculation (SHA-256) for duplicate detection in backend/src/utils/imageHash.ts
- [X] T079 [US2] Add duplicate detection logic (image hash + location + timestamp) in backend/src/services/PhotoSubmissionService.ts
- [X] T080 [US2] Implement upload queue service using database table for offline support in backend/src/services/UploadQueueService.ts
- [X] T081 [US2] Create UploadQueue model in backend/prisma/schema.prisma
- [X] T082 [US2] Create database migration for upload_queue table in backend/prisma/migrations/
- [X] T083 [US2] Implement upload retry mechanism with exponential backoff in backend/src/services/UploadQueueService.ts
- [X] T084 [US2] Implement API service method for photo upload in frontend/src/services/api/submissions.ts
- [X] T085 [US2] Add React Query mutation for photo upload in frontend/src/hooks/usePhotoUpload.ts
- [X] T086 [US2] Add upload progress and status feedback UI in frontend/src/components/UploadStatus.tsx
- [X] T087 [US2] Add error handling for location verification failures in frontend and backend
- [X] T088 [US2] Implement manual location override confirmation flow in frontend/src/components/LocationVerification.tsx
- [X] T089 [US2] Add rate limiting middleware (10 uploads/hour per app ID) in backend/src/api/middleware/rateLimit.ts
- [X] T090 [US2] Add validation to reject uploads for churches without coordinates in backend/src/services/PhotoSubmissionService.ts
- [X] T091 [US2] Add validation to reject uploads for churches that don't exist in backend/src/services/PhotoSubmissionService.ts

**Checkpoint**: At this point, User Story 2 should be fully functional. Users can capture photos, receive quality feedback, verify location, and upload photos with metadata.

---

## Phase 6: User Story 3 - Assign Photos to Windows Using Floor Plan (Priority: P3)

**Goal**: Users can assign uploaded photos to specific windows using the floor plan interface, organizing submissions by window location.

**Independent Test**: Can be fully tested by allowing users to upload photos and assign them to windows using the floor plan interface, organizing submissions by window location.

**Dependencies**: Phase 5 (User Story 2 - needs photo submissions to assign)

### Implementation for User Story 3

- [X] T092 [US3] Create floor plan interactive component with clickable window areas in frontend/src/components/FloorPlan.tsx
- [X] T093 [US3] Implement window selection handler in floor plan component in frontend/src/components/FloorPlan.tsx
- [X] T094 [US3] Create photo assignment UI component in frontend/src/pages/PhotoAssignmentPage.tsx
- [X] T095 [US3] Implement POST /submissions/{submissionId}/assign endpoint in backend/src/api/routes/submissions.ts
- [X] T096 [US3] Add window assignment logic to PhotoSubmissionService in backend/src/services/PhotoSubmissionService.ts
- [X] T097 [US3] Update PhotoSubmission model to handle window assignment (window_id field already exists) in backend/prisma/schema.prisma
- [X] T098 [US3] Create database migration for window assignment updates if needed in backend/prisma/migrations/
- [X] T099 [US3] Implement API service method for photo assignment in frontend/src/services/api/submissions.ts
- [X] T100 [US3] Add React Query mutation for photo assignment in frontend/src/hooks/usePhotoAssignment.ts
- [X] T101 [US3] Update WindowList component to show assigned photos organized by window in frontend/src/components/WindowList.tsx
- [X] T102 [US3] Add validation to ensure window belongs to correct church in backend/src/services/PhotoSubmissionService.ts
- [X] T103 [US3] Update PhotoGallery component to filter photos by window assignment in frontend/src/components/PhotoGallery.tsx
- [X] T104 [US3] Add alternative window assignment methods (text description, manual coordinates) in frontend/src/components/WindowAssignment.tsx
- [X] T105 [US3] Add floor plan mismatch reporting UI in frontend/src/components/FloorPlanMismatchReport.tsx
- [X] T106 [US3] Create floor plan mismatch reporting endpoint in backend/src/api/routes/churches.ts

**Checkpoint**: At this point, User Story 3 should be fully functional. Users can assign photos to windows using the floor plan and view organized submissions.

---

## Phase 7: User Story 4 - AI-Based Image Analysis and Quality Filtering (Priority: P3)

**Goal**: The app automatically analyzes uploaded images using AI to classify images, identify windows, select best photos, and filter out irrelevant or low-quality ones.

**Independent Test**: Can be fully tested by uploading various quality images and verifying that the AI correctly classifies them, identifies windows, selects best photos, and filters low-quality submissions.

**Dependencies**: Phase 5 (User Story 2 - analyzes uploaded photos), can run parallel with Phase 6 (User Story 3)

### Implementation for User Story 4

- [ ] T107 [US4] Setup OpenAI GPT-4 Vision API client in backend/src/services/AIService.ts
- [ ] T108 [US4] Implement AI image classification service method in backend/src/services/AIService.ts
- [ ] T109 [US4] Implement AI quality assessment service method in backend/src/services/AIService.ts
- [ ] T110 [US4] Implement AI window identification service method in backend/src/services/AIService.ts
- [ ] T111 [US4] Create background job processor for AI analysis queue in backend/src/jobs/aiAnalysisProcessor.ts
- [ ] T112 [US4] Add AI analysis results storage to PhotoSubmission model (ai_classification JSON field) in backend/prisma/schema.prisma
- [ ] T113 [US4] Create database migration for AI classification fields in backend/prisma/migrations/
- [ ] T114 [US4] Integrate AI analysis into photo upload flow (async processing) in backend/src/services/PhotoSubmissionService.ts
- [ ] T115 [US4] Implement primary photo selection algorithm based on AI quality scores in backend/src/services/PhotoSubmissionService.ts
- [ ] T116 [US4] Add AI-suggested window assignment logic in backend/src/services/PhotoSubmissionService.ts
- [ ] T117 [US4] Implement image filtering logic (irrelevant/low-quality) in backend/src/services/PhotoSubmissionService.ts
- [ ] T118 [US4] Add flagging mechanism for manual assignment when AI fails in backend/src/services/PhotoSubmissionService.ts
- [ ] T119 [US4] Create API endpoint to get AI analysis results in backend/src/api/routes/submissions.ts
- [ ] T120 [US4] Update frontend to display AI analysis status and results in frontend/src/components/AIAnalysisStatus.tsx
- [ ] T121 [US4] Add UI for AI-suggested window assignments in frontend/src/components/AISuggestions.tsx
- [ ] T122 [US4] Implement error handling for AI API failures (fallback to manual assignment) in backend/src/services/AIService.ts
- [ ] T123 [US4] Add caching for AI analysis results to avoid re-analysis in backend/src/services/AIService.ts

**Checkpoint**: At this point, User Story 4 should be fully functional. AI automatically analyzes images, suggests window assignments, and filters low-quality submissions.

---

## Phase 8: User Story 5 - Anonymous User Identity and Contribution Tracking (Priority: P4)

**Goal**: Users receive anonymous persistent app IDs, track contributions, and manage their own submissions.

**Independent Test**: Can be fully tested by using the app anonymously, verifying that contributions are tracked by app ID, and managing own submissions.

**Dependencies**: Phase 5 (User Story 2 - tracks user contributions), can run parallel with Phase 6 (User Story 3) and Phase 7 (User Story 4)

### Implementation for User Story 5

- [ ] T124 [US5] Implement anonymous app ID generation (client-side UUID) in frontend/src/utils/appId.ts
- [ ] T125 [US5] Store app ID in IndexedDB for persistence in frontend/src/utils/appId.ts
- [ ] T126 [US5] Implement UserService.getOrCreate method for user lookup/creation in backend/src/services/UserService.ts
- [ ] T127 [US5] Add contribution tracking logic (count, quality average) to UserService in backend/src/services/UserService.ts
- [ ] T128 [US5] Update PhotoSubmissionService to update user contribution stats in backend/src/services/PhotoSubmissionService.ts
- [ ] T129 [US5] Create GET /users/{appId} endpoint in backend/src/api/routes/users.ts
- [ ] T130 [US5] Create GET /users/{appId}/submissions endpoint in backend/src/api/routes/users.ts
- [ ] T131 [US5] Create UserProfilePage component in frontend/src/pages/UserProfilePage.tsx
- [ ] T132 [US5] Create UserSubmissionsList component in frontend/src/components/UserSubmissionsList.tsx
- [ ] T133 [US5] Implement API service methods for user profile in frontend/src/services/api/users.ts
- [ ] T134 [US5] Add React Query hooks for user profile in frontend/src/hooks/useUserProfile.ts
- [ ] T135 [US5] Implement PATCH /submissions/{submissionId} endpoint with ownership verification in backend/src/api/routes/submissions.ts
- [ ] T136 [US5] Implement DELETE /submissions/{submissionId} endpoint with soft delete in backend/src/api/routes/submissions.ts
- [ ] T137 [US5] Add soft delete logic (deleted_at field) to PhotoSubmissionService in backend/src/services/PhotoSubmissionService.ts
- [ ] T138 [US5] Create AuditTrail model for Cardano audit trail entries in backend/prisma/schema.prisma
- [ ] T139 [US5] Create database migration for audit_trail table in backend/prisma/migrations/
- [ ] T140 [US5] Create EditSubmissionPage component in frontend/src/pages/EditSubmissionPage.tsx
- [ ] T141 [US5] Add edit/delete UI controls to submission detail views in frontend/src/components/SubmissionActions.tsx
- [ ] T142 [US5] Implement ownership verification middleware in backend/src/api/middleware/ownership.ts
- [ ] T143 [US5] Update PhotoSubmission queries to filter deleted submissions in backend/src/services/PhotoSubmissionService.ts
- [ ] T144 [US5] Add contribution statistics display in UserProfilePage in frontend/src/pages/UserProfilePage.tsx
- [ ] T145 [US5] Add validation to ensure only editable fields (window_id, metadata) can be updated in backend/src/api/routes/submissions.ts
- [ ] T146 [US5] Add server-side validation for app ID uniqueness in backend/src/services/UserService.ts

**Checkpoint**: At this point, User Story 5 should be fully functional. Users have anonymous IDs, can track contributions, and manage their submissions.

---

## Phase 9: User Story 6 - View Blockchain Records and Audit Trail (Priority: P4)

**Goal**: Users can view Arweave records storing images and metadata, and Cardano audit trail associated with each window and upload.

**Independent Test**: Can be fully tested by viewing any window submission and accessing its associated Arweave record and Cardano audit trail.

**Dependencies**: Phase 5 (User Story 2 - needs submissions to store on blockchain), can run parallel with Phase 6 (User Story 3), Phase 7 (User Story 4), and Phase 8 (User Story 5)

### Implementation for User Story 6

- [ ] T147 [US6] Setup arweave-js SDK configuration in backend/src/storage/arweave.ts
- [ ] T148 [US6] Implement Arweave upload service for images and metadata in backend/src/storage/arweave.ts
- [ ] T149 [US6] Setup Cardano SDK (@emurgo/cardano-serialization-lib) configuration in backend/src/storage/cardano.ts
- [ ] T150 [US6] Implement Cardano transaction service for audit trail logging in backend/src/storage/cardano.ts
- [ ] T151 [US6] Update UploadQueue model to handle Arweave/Cardano uploads in backend/prisma/schema.prisma
- [ ] T152 [US6] Create database migration for upload_queue table updates if needed in backend/prisma/migrations/
- [ ] T153 [US6] Implement upload queue processor with retry logic in backend/src/jobs/blockchainProcessor.ts
- [ ] T154 [US6] Integrate Arweave upload into photo submission flow in backend/src/services/PhotoSubmissionService.ts
- [ ] T155 [US6] Integrate Cardano audit trail logging into photo submission flow in backend/src/services/PhotoSubmissionService.ts
- [ ] T156 [US6] Integrate Cardano audit trail logging into edit/delete flows in backend/src/services/PhotoSubmissionService.ts
- [ ] T157 [US6] Update PhotoSubmission model to store arweave_tx_id and cardano_tx_hash in backend/prisma/schema.prisma
- [ ] T158 [US6] Create database migration for blockchain transaction IDs in backend/prisma/migrations/
- [ ] T159 [US6] Create GET /blockchain/arweave/{txId} endpoint in backend/src/api/routes/blockchain.ts
- [ ] T160 [US6] Create GET /blockchain/cardano/{txHash} endpoint in backend/src/api/routes/blockchain.ts
- [ ] T161 [US6] Implement Arweave record retrieval service in backend/src/storage/arweave.ts
- [ ] T162 [US6] Implement Cardano transaction retrieval service in backend/src/storage/cardano.ts
- [ ] T163 [US6] Create BlockchainRecordViewer component in frontend/src/components/BlockchainRecordViewer.tsx
- [ ] T164 [US6] Add Arweave explorer link generation in frontend/src/utils/blockchain.ts
- [ ] T165 [US6] Add Cardano explorer link generation in frontend/src/utils/blockchain.ts
- [ ] T166 [US6] Implement API service methods for blockchain records in frontend/src/services/api/blockchain.ts
- [ ] T167 [US6] Add React Query hooks for blockchain records in frontend/src/hooks/useBlockchainRecords.ts
- [ ] T168 [US6] Integrate blockchain record viewer into submission detail pages in frontend/src/pages/SubmissionDetailPage.tsx
- [ ] T169 [US6] Add blockchain record status indicators (pending, uploaded, failed) in frontend/components
- [ ] T170 [US6] Implement retry mechanism for failed blockchain uploads in backend/src/jobs/blockchainProcessor.ts
- [ ] T171 [US6] Add exponential backoff retry schedule (1min, 5min, 15min, 1hr, 6hr) in backend/src/jobs/blockchainProcessor.ts

**Checkpoint**: At this point, User Story 6 should be fully functional. Users can view Arweave records and Cardano audit trails for all submissions.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories  
**Dependencies**: All desired user stories complete  
**Parallel Opportunities**: All tasks marked [P] can run in parallel

- [ ] T172 [P] Add comprehensive error boundaries in frontend/src/components/ErrorBoundary.tsx
- [ ] T173 [P] Implement loading skeletons for all async operations in frontend/src/components/LoadingSkeleton.tsx
- [ ] T174 [P] Add responsive design improvements for mobile devices across all pages
- [ ] T175 [P] Optimize image loading and lazy loading in frontend/src/components/ImageLoader.tsx
- [ ] T176 [P] Add pagination for large result sets (churches, windows, submissions) in backend services
- [ ] T177 [P] Implement caching strategy for frequently accessed church data in backend/src/services/CacheService.ts
- [ ] T178 [P] Add rate limiting middleware for API endpoints (already partially done in US2) in backend/src/api/middleware/rateLimit.ts
- [ ] T179 [P] Implement input validation and sanitization across all API endpoints
- [ ] T180 [P] Add comprehensive logging for all critical operations in backend services
- [ ] T181 [P] Create API documentation using OpenAPI spec in backend/docs/
- [ ] T182 [P] Add accessibility improvements (ARIA labels, keyboard navigation) across frontend components
- [ ] T183 [P] Optimize database queries with proper indexes (verify all indexes from data-model.md) in backend/prisma/schema.prisma
- [ ] T184 [P] Add monitoring and health check endpoints (already partially done in US0) in backend/src/api/routes/health.ts
- [ ] T185 [P] Implement PWA service worker for offline capability in frontend/src/service-worker.ts
- [ ] T186 [P] Create Web App Manifest for installability in frontend/public/manifest.json
- [ ] T187 [P] Run quickstart.md validation checklist
- [ ] T188 [P] Add performance monitoring and analytics
- [ ] T189 [P] Security audit: HTTPS enforcement, CORS validation, input sanitization review
- [ ] T190 [P] Cross-browser testing and compatibility fixes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 0 (Phase 3)**: Depends on Foundational completion
- **User Stories (Phase 4-9)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Depends on US1 (needs churches and windows to exist)
  - User Story 3 (P3): Depends on US2 (needs photo submissions to assign)
  - User Story 4 (P3): Depends on US2 (analyzes uploaded photos), can run parallel with US3
  - User Story 5 (P4): Depends on US2 (tracks user contributions), can run parallel with US3/US4
  - User Story 6 (P4): Depends on US2 (needs submissions to store on blockchain), can run parallel with US3/US4/US5
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies Graph

```
Phase 2 (Foundational)
    ↓
Phase 3 (US0 - Developer Setup)
    ↓
Phase 4 (US1 - Search/View) ← MVP START
    ↓
Phase 5 (US2 - Upload)
    ↓
    ├─→ Phase 6 (US3 - Assign Windows)
    ├─→ Phase 7 (US4 - AI Analysis) [parallel with US3]
    ├─→ Phase 8 (US5 - User Identity) [parallel with US3/US4]
    └─→ Phase 9 (US6 - Blockchain) [parallel with US3/US4/US5]
            ↓
    Phase 10 (Polish)
```

### Within Each User Story

- Models before services
- Services before endpoints/UI
- Backend API before frontend integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: All tasks marked [P] can run in parallel
- **Foundational Phase**: All tasks marked [P] can run in parallel (within Phase 2)
- **User Story Phases**: Models marked [P] can run in parallel within a story
- **Cross-Story Parallelism**: US4, US5, and US6 can run in parallel after US2 completes
- **Polish Phase**: All tasks marked [P] can run in parallel

---

## Parallel Execution Examples

### Example 1: User Story 1 - Models

```bash
# Launch all models for User Story 1 together:
- [ ] T038 [P] [US1] Create Church model entity in backend/prisma/schema.prisma
- [ ] T039 [P] [US1] Create Window model entity in backend/prisma/schema.prisma
- [ ] T040 [P] [US1] Create PhotoSubmission model entity in backend/prisma/schema.prisma
```

**Why parallel**: Different entities, no dependencies between them, all in same file (schema.prisma) but different sections.

### Example 2: User Story 2 - Frontend Components

```bash
# Launch frontend and backend work in parallel:
- [ ] T068 [P] [US2] Implement photo quality assessment service in frontend/src/utils/imageQuality.ts
- [ ] T069 [P] [US2] Create photo capture component with camera access in frontend/src/components/PhotoCapture.tsx
- [ ] T071 [P] [US2] Create geolocation service wrapper in frontend/src/utils/geolocation.ts
- [ ] T067 [US2] Implement location verification service using Haversine formula in backend/src/services/LocationService.ts
```

**Why parallel**: Frontend utilities/components don't depend on backend services, backend service doesn't depend on frontend.

### Example 3: Cross-Story Parallelism

```bash
# After US2 completes, these can run in parallel:
- [ ] T092 [US3] Create floor plan interactive component... (User Story 3)
- [ ] T107 [US4] Setup OpenAI GPT-4 Vision API client... (User Story 4)
- [ ] T124 [US5] Implement anonymous app ID generation... (User Story 5)
- [ ] T147 [US6] Setup arweave-js SDK configuration... (User Story 6)
```

**Why parallel**: Different user stories, different files, no dependencies between them.

---

## Implementation Strategy

### MVP First (User Story 0 + User Story 1 Only)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. ✅ Complete Phase 3: User Story 0 (Developer Setup)
4. ✅ Complete Phase 4: User Story 1 (Search and View Churches and Windows)
5. **STOP and VALIDATE**: Test User Story 0 and User Story 1 independently
6. Deploy/demo if ready

**MVP Deliverable**: A working application where developers can set up locally, and users can search for churches, view church details with floor plans, and browse existing window submissions.

### Incremental Delivery

1. **Foundation**: Setup + Foundational → Foundation ready
2. **MVP**: Add User Story 0 + User Story 1 → Test independently → Deploy/Demo
3. **Upload**: Add User Story 2 → Test independently → Deploy/Demo
4. **Organization**: Add User Story 3 → Test independently → Deploy/Demo
5. **Intelligence**: Add User Story 4 → Test independently → Deploy/Demo
6. **Identity**: Add User Story 5 → Test independently → Deploy/Demo
7. **Blockchain**: Add User Story 6 → Test independently → Deploy/Demo
8. **Polish**: Polish & Cross-Cutting → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together**
2. **Once Foundational is done**:
   - Developer A: User Story 0 (Developer Setup)
   - Developer B: Prepares User Story 1 components
3. **After US0 completes**:
   - Developer A: User Story 1 (MVP)
   - Developer B: Prepares User Story 2 components
4. **After US1 completes**:
   - Developer A: User Story 2 (Upload)
   - Developer B: User Story 3 (Assign Windows)
   - Developer C: User Story 4 (AI Analysis) [can start after US2]
5. **After US2 completes**:
   - Developer A: User Story 5 (User Identity)
   - Developer B: User Story 6 (Blockchain)
   - Developer C: Polish & optimization

Stories complete and integrate independently.

---

## Task Summary

### Total Task Count

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 13 tasks
- **Phase 3 (US0 - Developer Setup)**: 16 tasks
- **Phase 4 (US1 - Search/View)**: 27 tasks
- **Phase 5 (US2 - Upload)**: 27 tasks
- **Phase 6 (US3 - Assign Windows)**: 15 tasks
- **Phase 7 (US4 - AI Analysis)**: 17 tasks
- **Phase 8 (US5 - User Identity)**: 23 tasks
- **Phase 9 (US6 - Blockchain)**: 25 tasks
- **Phase 10 (Polish)**: 19 tasks

**Total**: ~190 tasks

### Task Count Per User Story

- **User Story 0**: 16 tasks
- **User Story 1**: 27 tasks
- **User Story 2**: 27 tasks
- **User Story 3**: 15 tasks
- **User Story 4**: 17 tasks
- **User Story 5**: 23 tasks
- **User Story 6**: 25 tasks

### Parallel Opportunities Identified

- **Setup Phase**: 7 parallel tasks
- **Foundational Phase**: 10 parallel tasks
- **User Story 1**: 5 parallel tasks (models + frontend components)
- **User Story 2**: 3 parallel tasks (frontend utilities)
- **Cross-Story**: US4, US5, US6 can run in parallel after US2
- **Polish Phase**: 19 parallel tasks

### Independent Test Criteria

- **User Story 0**: Developer can follow setup instructions, start all services, verify functionality
- **User Story 1**: Users can search churches, view details, browse window submissions (no upload needed)
- **User Story 2**: Users can capture photos, receive quality feedback, verify location, upload (no AI/blockchain needed)
- **User Story 3**: Users can assign photos to windows using floor plan (needs US2)
- **User Story 4**: AI analyzes images, suggests assignments, filters quality (needs US2)
- **User Story 5**: Users have anonymous IDs, track contributions, manage submissions (needs US2)
- **User Story 6**: Users can view Arweave records and Cardano audit trails (needs US2)

### Suggested MVP Scope

**MVP = User Story 0 + User Story 1**

- Complete developer setup and local environment
- Enable church search and viewing
- Display existing window submissions
- No upload, AI, or blockchain features required

This delivers immediate value as a discovery and exploration tool.

---

## Notes

- **[P] tasks** = Different files, no dependencies - can run in parallel
- **[Story] label** = Maps task to specific user story for traceability
- **File paths** = All paths follow web app structure: `backend/src/` and `frontend/src/`
- **Each user story** = Independently completable and testable
- **Commit strategy** = Commit after each task or logical group
- **Checkpoint validation** = Stop at any checkpoint to validate story independently
- **Avoid** = Vague tasks, same file conflicts, cross-story dependencies that break independence
- **Tests** = OPTIONAL - not included unless explicitly requested (focus on implementation tasks)
- **Format validation** = ALL tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Format Validation

✅ **Confirmed**: ALL tasks follow the strict checklist format:
- Checkbox: `- [ ]`
- Task ID: Sequential (T001, T002, T003...)
- [P] marker: Included where tasks are parallelizable
- [Story] label: Included for user story phase tasks (US0, US1, US2, etc.)
- File paths: Included in every task description
- No missing components: All tasks have checkbox, ID, description, and file path
