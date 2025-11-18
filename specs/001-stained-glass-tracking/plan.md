# Implementation Plan: Stained Glass Window Tracking App

**Branch**: `001-stained-glass-tracking` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-stained-glass-tracking/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Develop a cross-platform, install-free web application that enables users to record and track stained glass windows in churches. The app stores images and metadata on Arweave with an audit trail on Cardano blockchain. Key features include church search by county/town, location verification, AI-based image analysis, floor plan-based window assignment, and anonymous user tracking. Technical approach: React + TypeScript frontend, Node.js + Express + TypeScript backend, OpenAI GPT-4 Vision API for AI analysis, arweave-js for Arweave integration, Cardano serialization library for blockchain audit trail.

## Technical Context

**Language/Version**: TypeScript 5+ (frontend and backend), Node.js 20+ LTS (backend)  
**Primary Dependencies**: React 18+ (frontend), Express 4.x (backend), Prisma (ORM), OpenAI API (AI), arweave-js (Arweave), @emurgo/cardano-serialization-lib (Cardano), sharp (image processing)  
**Storage**: PostgreSQL (churches, windows, submissions, users, audit trail) + Arweave (immutable image/metadata) + Cardano (audit trail transactions)  
**Testing**: Vitest + React Testing Library + Playwright (frontend), Jest + Supertest (backend)  
**Target Platform**: Cross-platform web browsers (desktop and mobile) - Progressive Web App (PWA) with service workers  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Church search <10s (SC-001), upload completion <2min (SC-002), AI analysis <30s async, blockchain confirmations async (Arweave 1-5min, Cardano 10-60s), record viewing <3s (SC-008)  
**Constraints**: Offline queue with exponential backoff (1min, 5min, 15min, 1hr, 6hr), rate limiting 10 uploads/hour per app ID with progressive delays, 50m location tolerance radius, PWA install-free requirement, browser camera/location API compatibility  
**Scale/Scope**: Initial 100-1,000 users scaling to 10,000, 1,000-10,000 churches, 50,000-500,000 photos, design for 50-100 req/s backend capacity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-Phase 0 Status**: PENDING - Constitution file appears to be a template. Gates evaluated based on standard development principles.

**Post-Phase 1 Status**: PASSED

**Evaluation**:
- **Architecture**: Web application (frontend + backend) is standard and appropriate for requirements
- **Complexity**: Two-project structure (frontend/backend) is justified by separation of concerns and independent deployment
- **Dependencies**: All dependencies are well-established, maintained libraries with clear purposes
- **Testing**: Comprehensive testing strategy (unit, integration, E2E) defined for both frontend and backend
- **Security**: Anonymous user IDs, server-side validation, location verification, rate limiting implemented
- **Performance**: Targets defined based on success criteria, async processing for blockchain operations
- **Scalability**: Design supports horizontal scaling, database indexing strategy defined

**No violations identified** - Architecture is appropriate for the feature scope and requirements.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── models/           # Database models (Church, Window, PhotoSubmission, User)
│   ├── services/         # Business logic (location verification, AI integration, blockchain)
│   ├── api/              # REST API endpoints
│   └── queue/            # Local queue for Arweave/Cardano when offline
└── tests/
    ├── contract/         # API contract tests
    ├── integration/      # Integration tests
    └── unit/             # Unit tests

frontend/
├── src/
│   ├── components/       # React/Vue/Svelte components
│   ├── pages/            # Page components (search, church view, upload, etc.)
│   ├── services/         # API client, location, camera, blockchain viewers
│   └── utils/            # Helper functions
└── tests/
    ├── e2e/              # End-to-end tests
    └── unit/             # Component tests
```

**Structure Decision**: Web application structure selected (Option 2) - separate frontend and backend directories. Frontend handles UI, camera, location, and user interactions. Backend handles API, database, AI integration, Arweave uploads, and Cardano audit trail logging. Both can be developed and deployed independently.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
