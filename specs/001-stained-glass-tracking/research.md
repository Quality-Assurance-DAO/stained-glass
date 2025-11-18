# Research: Stained Glass Window Tracking App

**Date**: 2025-01-27  
**Purpose**: Resolve technical unknowns identified in plan.md Technical Context section

## Technology Stack Decisions

### Frontend Language and Framework

**Decision**: TypeScript 5.x with React 18.x

**Rationale**:
- TypeScript provides type safety for complex data models (Church, Window, PhotoSubmission, User)
- React is the most popular and well-supported frontend framework for web applications
- Excellent ecosystem for camera access, geolocation APIs, and local storage
- Strong community support and extensive documentation
- Works well for cross-platform web apps without installation

**Alternatives considered**:
- Vue.js: Less popular, smaller ecosystem
- Angular: More complex, heavier framework
- Vanilla JavaScript: Lacks type safety and modern development experience
- Svelte: Smaller ecosystem, less mature

### Backend Language and Framework

**Decision**: Node.js 20.x LTS with TypeScript 5.x and Express.js 4.x

**Rationale**:
- Node.js allows code sharing between frontend and backend (shared types, utilities)
- TypeScript provides type safety across the stack
- Express.js is lightweight, flexible, and well-documented
- Excellent ecosystem for REST APIs
- Good support for async operations (Arweave uploads, Cardano transactions)
- Large community and extensive middleware ecosystem

**Alternatives considered**:
- Python (FastAPI/Django): Would require separate type definitions, less code sharing
- Go: More verbose, smaller ecosystem for web APIs
- Rust: Steeper learning curve, overkill for this application

### Frontend Dependencies

**Decision**: 
- React 18.x with React Router 6.x for routing
- Vite 5.x as build tool (faster than Create React App)
- Tailwind CSS 3.x for styling (utility-first, responsive design)
- React Query (TanStack Query) for API state management
- Axios for HTTP requests
- arweave-js for Arweave integration
- @cardano-foundation/cardano-connect-with-wallet or @meshsdk/core for Cardano integration

**Rationale**:
- React Router: Standard routing solution for React SPA
- Vite: Fast development server, optimized production builds
- Tailwind CSS: Rapid UI development, mobile-first responsive design
- React Query: Handles caching, background updates, offline support
- Axios: Better error handling than fetch API
- arweave-js: Official Arweave JavaScript SDK
- Cardano SDK: Standard libraries for Cardano blockchain integration

### Backend Dependencies

**Decision**:
- Express.js 4.x for web framework
- TypeORM or Prisma for database ORM
- arweave-js (Node.js compatible) for Arweave uploads
- @cardano-foundation/cardano-connect-with-wallet or cardano-serialization-lib for Cardano transactions
- Multer for file upload handling
- JWT for authentication (if needed for API)
- Winston or Pino for logging

**Rationale**:
- Express.js: Minimal, flexible web framework
- TypeORM/Prisma: Type-safe database access, migrations
- arweave-js: Same SDK as frontend, consistent API
- Cardano libraries: Standard blockchain integration tools
- Multer: Standard Express middleware for file uploads
- JWT: Stateless authentication for API
- Winston/Pino: Structured logging for observability

### Database

**Decision**: PostgreSQL 15+ with TypeORM or Prisma ORM

**Rationale**:
- PostgreSQL is reliable, performant, and well-suited for relational data (churches, windows, submissions)
- Strong support for JSON columns (for flexible metadata storage)
- Excellent geospatial support (PostGIS extension for location queries)
- ACID compliance ensures data integrity
- TypeORM/Prisma provide type-safe database access and migrations
- Widely used, excellent documentation

**Alternatives considered**:
- MongoDB: Less suitable for relational data (churches → windows → submissions)
- SQLite: Not suitable for production web applications (concurrency limitations)
- MySQL: PostgreSQL has better JSON and geospatial support

**Schema considerations**:
- Churches table: id, name, county, town, coordinates (lat/lng), floor_plan_url
- Windows table: id, church_id, location_identifier, floor_plan_coordinates
- Photo_Submissions table: id, window_id, user_id, arweave_tx_id, cardano_tx_hash, timestamp, location_verified, image_url, metadata (JSON)
- Users table: id, app_id (anonymous), contact_details (optional JSON), contribution_stats (JSON)

### AI/ML Image Analysis

**Decision**: OpenAI GPT-4 Vision API or Google Cloud Vision API for image classification and quality assessment

**Rationale**:
- Cloud APIs provide high-quality image analysis without infrastructure management
- GPT-4 Vision can classify images, assess quality, and identify stained glass windows
- Google Cloud Vision API offers specialized image analysis features
- Both support batch processing and have good JavaScript SDKs
- Cost-effective for moderate usage volumes
- Can fall back to manual assignment if API fails (per FR-028)

**Alternatives considered**:
- Local ML models (TensorFlow.js): Requires significant model training, larger bundle size
- Custom trained models: Requires labeled dataset and ML expertise
- Other cloud APIs (AWS Rekognition, Azure Computer Vision): Similar capabilities, choose based on existing cloud infrastructure

**Implementation approach**:
- Backend service calls AI API after image upload
- Returns classification results (window identification, quality score)
- Frontend displays results and allows manual override
- Failed analyses flagged for manual assignment

### Testing Frameworks

**Decision**:
- Frontend: Vitest (faster Jest alternative) + React Testing Library + Playwright for E2E
- Backend: Jest + Supertest for API testing

**Rationale**:
- Vitest: Fast, Vite-native, compatible with Jest API
- React Testing Library: Best practices for testing React components
- Playwright: Cross-browser E2E testing, excellent for web apps
- Jest: Standard Node.js testing framework, good ecosystem
- Supertest: Express.js testing utility

**Alternatives considered**:
- Jest for frontend: Slower than Vitest, but more mature
- Cypress: Good alternative to Playwright, but Playwright has better cross-browser support
- Mocha: Less feature-rich than Jest

### Arweave Integration

**Decision**: arweave-js SDK (v1.x)

**Rationale**:
- Official JavaScript SDK for Arweave
- Supports both browser and Node.js environments
- Handles wallet management, transaction signing, and uploads
- Good documentation and community support
- Supports retry logic for failed uploads

**Implementation considerations**:
- Frontend: Use arweave-js for direct uploads (if wallet available) or proxy through backend
- Backend: Use arweave-js for server-side uploads with funded wallet
- Queue failed uploads in IndexedDB (frontend) or database (backend)
- Retry mechanism with exponential backoff

### Cardano Integration

**Decision**: @meshsdk/core or @cardano-foundation/cardano-connect-with-wallet

**Rationale**:
- Mesh SDK: Comprehensive Cardano development toolkit, good TypeScript support
- Cardano Connect: Official wallet connector, simpler for basic transactions
- Both support transaction building and signing
- Good documentation and active development

**Implementation considerations**:
- Backend: Build and submit transactions to Cardano network
- Store transaction hashes in database for audit trail
- Frontend: Display transaction hashes and links to Cardano explorers
- Handle network failures with retry queue

### Scale/Scope Estimates

**Decision**: Initial scale targets:
- Users: 1,000-10,000 active users
- Churches: 5,000-50,000 churches in database
- Windows: 50,000-500,000 windows (average 10 per church)
- Photo submissions: 100,000-1,000,000 photos over time

**Rationale**:
- Conservative estimates based on typical crowdsourced documentation projects
- Database can handle this scale with proper indexing
- Arweave and Cardano networks can handle this transaction volume
- Can scale horizontally if needed (add more backend instances)

**Performance considerations**:
- Database indexes on church search fields (county, town)
- Caching for frequently accessed church data
- CDN for static assets and images
- Pagination for large result sets

## Integration Patterns

### Location Verification Pattern

**Decision**: Haversine formula for distance calculation, 50-meter tolerance

**Rationale**:
- Standard formula for calculating distances between GPS coordinates
- Efficient calculation, suitable for real-time verification
- 50-meter tolerance accounts for GPS accuracy variations

**Implementation**:
- Calculate distance between user location and church coordinates
- Accept if distance ≤ 50 meters
- Reject or allow manual override if distance > 50 meters

### Offline Queue Pattern

**Decision**: IndexedDB (frontend) + Database queue (backend)

**Rationale**:
- IndexedDB: Persistent storage in browser, survives page reloads
- Database queue: Reliable server-side queue for retry logic
- Both support retry with exponential backoff

**Implementation**:
- Frontend: Store failed uploads in IndexedDB with metadata
- Backend: Store pending uploads in database queue table
- Background job processes queue and retries failed uploads
- Notify user when upload succeeds after retry

### Image Quality Assessment Pattern

**Decision**: Client-side pre-analysis + Server-side AI analysis

**Rationale**:
- Client-side: Immediate feedback (brightness, contrast, blur detection)
- Server-side: Comprehensive AI analysis (classification, window identification)
- Two-stage approach provides best user experience

**Implementation**:
- Frontend: Use Canvas API to analyze image brightness, contrast, sharpness
- Provide immediate feedback before upload
- Backend: Send to AI API for comprehensive analysis after upload
- Combine results for final quality score

## Security Considerations

**Decision**: 
- HTTPS only (required for camera/geolocation APIs)
- Input validation and sanitization
- Rate limiting on API endpoints
- Anonymous user IDs stored client-side (IndexedDB)
- No PII required (optional contact details)

**Rationale**:
- HTTPS: Required for secure camera and geolocation access
- Input validation: Prevent injection attacks and invalid data
- Rate limiting: Prevent abuse and DoS attacks
- Anonymous IDs: Privacy-first approach, no server-side user tracking
- Optional PII: Users control their privacy

## Deployment Considerations

**Decision**: 
- Frontend: Static hosting (Vercel, Netlify, or Cloudflare Pages)
- Backend: Node.js hosting (Railway, Render, or AWS/GCP)
- Database: Managed PostgreSQL (Supabase, Neon, or AWS RDS)
- CDN: For static assets and images

**Rationale**:
- Static hosting: Fast, cost-effective for frontend
- Node.js hosting: Easy deployment, good performance
- Managed database: Reduces operational overhead
- CDN: Improves global performance

## Remaining Open Questions

None - all "NEEDS CLARIFICATION" items from Technical Context have been resolved.

