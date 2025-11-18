# Research: Stained Glass Window Tracking App

**Date**: 2025-01-27  
**Purpose**: Resolve technical unknowns identified in implementation plan

## Frontend Framework Selection

### Decision: React with TypeScript

**Rationale**:
- Mature ecosystem with extensive library support for camera, geolocation, and PWA features
- Strong TypeScript support for type safety with complex data models (churches, windows, submissions)
- Large community and extensive documentation
- Excellent PWA support via Workbox and service workers
- Rich component ecosystem (React Router, React Query for API state)
- Mobile-responsive design libraries (Material-UI, Chakra UI, Tailwind CSS)

**Alternatives Considered**:
- **Vue.js**: Good option but smaller ecosystem for PWA/camera integration
- **Svelte**: Modern but less mature PWA tooling
- **Vanilla JS**: Too low-level, would require significant custom framework code
- **Next.js**: Overkill for this app (SSR not needed, adds complexity)

**Key Dependencies**:
- React 18+
- TypeScript 5+
- React Router (client-side routing)
- React Query/TanStack Query (API state management)
- Workbox (PWA/service worker)
- react-webcam or @react-camera-pro (camera access)

## Backend Framework Selection

### Decision: Node.js with Express and TypeScript

**Rationale**:
- JavaScript/TypeScript across stack reduces context switching
- Express is lightweight and well-suited for REST API
- Excellent ecosystem for blockchain integrations (Arweave, Cardano)
- Strong file upload handling (multer)
- Good PostgreSQL integration (pg, Prisma, or TypeORM)
- Easy to implement queue system (Bull/BullMQ for Redis-based queues, or in-memory for simpler cases)
- Can share TypeScript types between frontend and backend

**Alternatives Considered**:
- **Python FastAPI**: Excellent but adds language diversity, smaller blockchain SDK ecosystem
- **Go**: Fast but overkill, less mature blockchain libraries
- **Rust**: Excellent performance but steep learning curve, limited ecosystem

**Key Dependencies**:
- Node.js 20+ (LTS)
- Express 4.x
- TypeScript 5+
- Prisma or TypeORM (database ORM)
- multer (file uploads)
- BullMQ or in-memory queue (for offline queue)

## AI Image Analysis Service

### Decision: OpenAI Vision API (GPT-4 Vision) with fallback to local model

**Rationale**:
- GPT-4 Vision provides excellent image classification and description capabilities
- Can identify stained glass windows, assess quality, and describe window features
- API-based approach avoids local model deployment complexity
- Cost-effective for moderate usage (pay per request)
- Can implement caching to reduce API calls for similar images
- Fallback to local model (e.g., CLIP) if API unavailable or for cost optimization

**Alternatives Considered**:
- **Claude Vision API**: Similar capabilities but smaller ecosystem
- **Local CLIP model**: Free but requires GPU infrastructure, slower inference
- **Google Vision API**: Good but less flexible for custom classification
- **Custom trained model**: Would require dataset and training infrastructure

**Implementation Approach**:
- Primary: OpenAI GPT-4 Vision API for classification and quality assessment
- Fallback: Local CLIP model for basic classification if API unavailable
- Caching: Store analysis results to avoid re-analyzing identical images

**Key Dependencies**:
- openai npm package
- @xenova/transformers (for local CLIP fallback, optional)

## Arweave Integration

### Decision: arweave-js SDK

**Rationale**:
- Official JavaScript SDK for Arweave
- Supports file uploads, metadata storage, and transaction management
- Works in Node.js backend (server-side uploads recommended for wallet security)
- Can handle large image files with chunking
- Good documentation and active maintenance

**Alternatives Considered**:
- **arweave-bundles**: For batching, but adds complexity
- **Direct HTTP API**: Too low-level, requires manual transaction construction

**Implementation Approach**:
- Backend handles Arweave uploads (keeps wallet keys secure)
- Store Arweave transaction ID with each photo submission
- Implement retry logic with exponential backoff
- Queue uploads locally when Arweave network unavailable

**Key Dependencies**:
- arweave npm package

## Cardano Integration

### Decision: @cardano-foundation/cardano-connect-with-wallet or @emurgo/cardano-serialization-lib

**Rationale**:
- Cardano serialization library provides transaction building capabilities
- Can create audit trail transactions on Cardano blockchain
- Backend can use serialization lib to construct transactions
- For frontend wallet connection (if needed): cardano-connect-with-wallet

**Alternatives Considered**:
- **cardano-cli**: Requires Cardano node, too complex for web app
- **Blockfrost API**: Good for reading blockchain data, but transactions require wallet integration
- **Mesh SDK**: Good but adds another abstraction layer

**Implementation Approach**:
- Backend constructs audit trail transactions using serialization library
- Store minimal data in transaction metadata (photo submission ID, timestamp, action type)
- Use testnet for development, mainnet for production
- Queue transactions locally when Cardano network unavailable

**Key Dependencies**:
- @emurgo/cardano-serialization-lib (backend transaction building)
- @blockfrost/blockfrost-js (optional, for reading blockchain data)

## Testing Frameworks

### Decision: 
- **Frontend**: Vitest + React Testing Library + Playwright
- **Backend**: Jest + Supertest

**Rationale**:
- Vitest: Fast, Vite-native, excellent TypeScript support, compatible with Jest API
- React Testing Library: Industry standard for component testing
- Playwright: Best-in-class E2E testing, cross-browser support, mobile device emulation
- Jest: Mature, well-documented, excellent for backend unit/integration tests
- Supertest: Standard for Express API testing

**Alternatives Considered**:
- **Jest for frontend**: Slower than Vitest, but acceptable alternative
- **Cypress**: Good but Playwright has better mobile support and performance
- **Mocha**: Less feature-rich than Jest

**Key Dependencies**:
- vitest, @testing-library/react, @playwright/test (frontend)
- jest, supertest, @types/jest (backend)

## Performance Goals

### Decision: Specific targets based on success criteria

**Search Performance**:
- Church search results: <10 seconds (per SC-001)
- Database indexing on county, town, name for fast queries
- Implement pagination for large result sets

**Upload Performance**:
- Photo capture to confirmation: <2 minutes (per SC-002)
- Breakdown: Photo capture (5s) + Quality check (10s) + Location verification (5s) + Upload to backend (10s) + Arweave upload (60-90s) + Cardano transaction (10-30s)
- Arweave and Cardano can be async/queued to meet 2-minute target

**AI Analysis Performance**:
- Image analysis: <30 seconds per image
- Can be async after initial upload
- Cache results to avoid re-analysis

**Blockchain Performance**:
- Arweave confirmation: 1-5 minutes (network dependent)
- Cardano transaction: 10-60 seconds (network dependent)
- Both can be queued and processed asynchronously

**View Performance**:
- Arweave/Cardano record viewing: <3 seconds (per SC-008)
- Cache blockchain data or use indexing service (Blockfrost for Cardano)

## Constraints

### Decision: Specific constraints identified

**Offline Queue**:
- Implement in-memory queue in backend (or Redis if scaling)
- Persist queue to database for durability across restarts
- Exponential backoff retry: 1min, 5min, 15min, 1hr, 6hr
- Maximum retry attempts: 10, then flag for manual review

**Rate Limiting**:
- 10 uploads per hour per app ID (per FR-041)
- Use express-rate-limit middleware
- Progressive delays: 1min, 5min, 15min after limit exceeded

**Location Tolerance**:
- 50 meters radius (per spec clarification)
- Use Haversine formula for distance calculation
- Manual override with user confirmation when GPS unavailable

**PWA Requirements**:
- Service worker for offline capability
- Web App Manifest for installability
- Cache API responses and static assets
- IndexedDB for local data storage

**Browser Compatibility**:
- Camera API: Modern browsers (Chrome, Firefox, Safari, Edge)
- Geolocation API: Standard across modern browsers
- Service Workers: Supported in all modern browsers

## Scale/Scope

### Decision: Initial scale assumptions

**User Base**:
- Initial: 100-1,000 active users
- Growth: 10,000 users within first year
- Design for horizontal scaling

**Data Volume**:
- Churches: 1,000-10,000 churches (UK/Ireland focus initially)
- Windows per church: 5-50 windows average
- Photos per window: 1-10 photos (crowdsourced)
- Total photos: 50,000-500,000 photos

**Storage Requirements**:
- Image size: 2-5 MB per photo (compressed)
- Total image storage: 100 GB - 2.5 TB (on Arweave)
- Database: <10 GB (metadata only)

**Concurrent Usage**:
- Peak: 100 concurrent users
- Upload rate: 10 uploads/hour per user limit = max 1,000 uploads/hour peak
- Design backend for 50-100 req/s

**Infrastructure**:
- Start: Single server (backend + database)
- Scale: Separate database server, CDN for frontend, load balancer for backend
- Arweave: Pay-per-upload (no infrastructure)
- Cardano: Pay-per-transaction (no infrastructure)

## Database Schema Considerations

### Decision: PostgreSQL with Prisma ORM

**Rationale**:
- PostgreSQL: Robust, supports JSON fields for flexible metadata
- Prisma: Type-safe ORM, excellent migration system, great TypeScript support
- Can handle complex relationships (churches → windows → submissions)
- Full-text search for church names
- Spatial extensions (PostGIS) available if needed for advanced location queries

**Key Tables**:
- churches (id, name, county, town, coordinates, floor_plan_url)
- windows (id, church_id, location_description, coordinates_on_plan)
- photo_submissions (id, window_id, user_id, arweave_tx_id, cardano_tx_id, timestamp, location, image_hash, deleted_at)
- users (app_id, created_at, contribution_count, quality_score)
- audit_trail (id, submission_id, action, cardano_tx_id, timestamp)

## Additional Technical Decisions

### Image Processing
- **Library**: sharp (Node.js) for server-side image processing
- Resize images before Arweave upload to reduce storage costs
- Generate thumbnails for UI display
- Store image hash (SHA-256) for duplicate detection

### Anonymous User ID Generation
- **Method**: UUID v4 generated client-side, stored in localStorage
- Backend validates uniqueness and stores in database
- If duplicate detected, generate new UUID client-side

### Location Services
- **Browser API**: navigator.geolocation.getCurrentPosition()
- **Fallback**: Manual coordinate entry with user confirmation
- **Distance Calculation**: Haversine formula for lat/long distance

### Photo Quality Assessment
- **Client-side**: Basic checks (brightness, contrast, blur detection)
- **Server-side**: AI analysis for comprehensive quality assessment
- **Libraries**: canvas API for client-side, sharp for server-side preprocessing

## Summary

All technical unknowns have been resolved:
- ✅ Frontend: React + TypeScript
- ✅ Backend: Node.js + Express + TypeScript  
- ✅ AI: OpenAI GPT-4 Vision API with CLIP fallback
- ✅ Arweave: arweave-js SDK
- ✅ Cardano: @emurgo/cardano-serialization-lib
- ✅ Testing: Vitest + React Testing Library + Playwright (frontend), Jest + Supertest (backend)
- ✅ Performance: Targets defined based on success criteria
- ✅ Constraints: Offline queue, rate limiting, location tolerance, PWA requirements specified
- ✅ Scale: Initial assumptions documented (100-1,000 users, 50k-500k photos)
