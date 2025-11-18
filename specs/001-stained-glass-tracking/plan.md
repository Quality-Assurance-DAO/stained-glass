# Implementation Plan: Stained Glass Window Tracking App

**Branch**: `001-stained-glass-tracking` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-stained-glass-tracking/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Develop a cross-platform, install-free web application that enables users to record and track stained glass windows in churches. The app stores images and metadata on Arweave with an audit trail on Cardano blockchain. Key features include church search by location, photo capture with quality feedback, location verification, AI-based image analysis, window assignment via floor plans, and blockchain record viewing.

## Technical Context

**Language/Version**: 
  - Frontend: TypeScript 5.x with React 18.x
  - Backend: Node.js 20.x LTS with TypeScript 5.x and Express.js 4.x

**Primary Dependencies**: 
  - Frontend: React 18.x, React Router 6.x, Vite 5.x, Tailwind CSS 3.x, React Query, Axios, arweave-js, @meshsdk/core or @cardano-foundation/cardano-connect-with-wallet
  - Backend: Express.js 4.x, TypeORM or Prisma, arweave-js, Cardano SDK, Multer, JWT, Winston/Pino

**Storage**: 
  - Arweave: Immutable storage for images and metadata (arweave-js SDK)
  - Cardano: Blockchain audit trail (@meshsdk/core or Cardano Connect)
  - Local Storage: IndexedDB for offline upload queue, anonymous app ID, user preferences
  - Backend Database: PostgreSQL 15+ with TypeORM or Prisma ORM (for church data, window metadata, user contributions, upload queue)

**Testing**: 
  - Frontend: Vitest + React Testing Library + Playwright (E2E)
  - Backend: Jest + Supertest

**Target Platform**: Cross-platform web browsers (Chrome, Firefox, Safari, Edge) - mobile and desktop, no installation required

**Project Type**: Web application (frontend + backend architecture)

**Performance Goals**: 
  - Church search: <10 seconds (SC-001)
  - Photo upload with verification: <2 minutes (SC-002)
  - View blockchain records: <3 seconds (SC-008)
  - Edit/delete submissions: <10 seconds (SC-010)

**Constraints**: 
  - Must work offline-capable (queue uploads when networks unavailable)
  - Location verification: 50-meter tolerance radius (Haversine formula)
  - Cross-browser compatibility (no installation)
  - Camera and geolocation API access required (HTTPS only)
  - Arweave/Cardano network availability (with retry logic and exponential backoff)

**Scale/Scope**: 
  - Initial targets: 1,000-10,000 active users, 5,000-50,000 churches, 50,000-500,000 windows, 100,000-1,000,000 photo submissions over time
  - Database indexes on search fields, caching for frequent queries, pagination for large result sets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: Constitution file (`.specify/memory/constitution.md`) appears to be a template and needs to be filled in with project-specific principles before gates can be evaluated.

**Action Required**: Define constitution principles before proceeding with implementation. Common gates to evaluate:
- Library-first architecture (if applicable)
- Test-first development requirements
- Integration testing requirements
- Observability requirements
- Versioning and breaking change policies
- Simplicity and YAGNI principles

**Note**: Proceeding with Phase 0 research to resolve technical unknowns. Constitution gates will be re-evaluated after Phase 1 design.

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

```text
backend/
├── src/
│   ├── models/          # Data models (Church, Window, PhotoSubmission, User, etc.)
│   ├── services/        # Business logic (location verification, AI integration, blockchain services)
│   ├── api/             # REST API endpoints
│   └── storage/         # Arweave and Cardano integration
└── tests/
    ├── contract/        # API contract tests
    ├── integration/     # Integration tests
    └── unit/            # Unit tests

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components (Search, Church Detail, Upload, etc.)
│   ├── services/        # API clients, local storage, blockchain viewers
│   ├── hooks/           # React hooks (if using React)
│   └── utils/           # Utility functions (location, image quality, etc.)
└── tests/
    ├── integration/     # Integration tests
    └── unit/            # Unit tests
```

**Structure Decision**: Web application architecture with separate frontend and backend. Frontend handles UI, camera access, geolocation, and local storage queuing. Backend handles API, database operations, AI integration, and blockchain interactions (Arweave uploads, Cardano transactions).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
