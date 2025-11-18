# Stained Glass Window Tracking App

A cross-platform web application for tracking and documenting stained glass windows in churches, with blockchain storage on Arweave and audit trail on Cardano.

## Features

- **Church Search**: Search churches by county and town
- **Window Tracking**: Organize photos by window location using floor plans
- **Photo Upload**: Capture photos with location verification and quality assessment
- **AI Analysis**: Automatic image classification and quality filtering
- **Blockchain Storage**: Immutable storage on Arweave with Cardano audit trail
- **Anonymous Users**: Persistent app IDs for contribution tracking

## User Guide

### 1. Search for Churches

Start by searching for churches using county and town filters. Enter either a county name, town name, or both to find matching churches.

![Search Interface](Assets/images/screenshots/Search.png)

### 2. View Church Details

Click on a church from the search results to view its details, including location information and available floor plans.

![Church Record](Assets/images/screenshots/Church-Record.png)

### 3. Explore Floor Plans

Churches with floor plans display an interactive map showing window locations. Use the floor plan to understand the layout and identify specific windows.

![Floor Plan](Assets/images/screenshots/Floorplan.png)

### 4. Upload Photos

When visiting a church, capture photos directly in the app. The app will:
- Assess photo quality and provide feedback
- Verify your location matches the church coordinates
- Guide you through the upload process

![Photo Upload](Assets/images/screenshots/Upload-Photo.png)

### 5. View Window Details

Browse existing window submissions and view detailed information about each window, including photos, metadata, and blockchain records.

![Window Detail](Assets/images/screenshots/Window-Detail.png)

![Window Image](Assets/images/screenshots/Window image.png)

### 6. Manage Your Profile

Access your profile to view your contribution statistics, including total submissions and average quality scores. Your anonymous app ID is stored locally and never shared.

![Your Profile](Assets/images/screenshots/Your-Profile.png)

### 7. Report Mismatches

If you notice incorrect information or misassigned photos, use the mismatch reporting feature to flag issues for review.

![Report Mismatch](Assets/images/screenshots/Report-Mismatch.png)

## OpenAI Integration

The application uses OpenAI's GPT-4o Vision API to automatically analyze uploaded photos of stained glass windows. This AI-powered analysis runs asynchronously after photo upload and provides three main types of analysis.

### How It Works

When you upload a photo, the application:

1. **Sends the image** to OpenAI's GPT-4o Vision API for analysis
2. **Performs three parallel analyses**:
   - Image classification (is it a stained glass window?)
   - Quality assessment (how good is the photo?)
   - Window identification (which specific window does it show?)
3. **Stores the results** in the database for future reference
4. **Uses cached results** for duplicate images (identified by image hash)

### Expected Outputs

#### 1. Image Classification

The AI determines whether the uploaded image is actually a stained glass window.

**Output includes:**
- `isStainedGlassWindow`: Boolean indicating if the image shows a stained glass window
- `confidence`: Number between 0-1 indicating confidence level
- `reasoning`: Brief explanation of the classification decision

**What it filters out:**
- Regular windows (non-stained glass)
- Doors or other architectural features
- Paintings or artwork
- Photographs of windows (rather than actual windows)
- Other non-stained-glass objects

**Example output:**
```json
{
  "isStainedGlassWindow": true,
  "confidence": 0.95,
  "reasoning": "Image shows a clear stained glass window with colorful glass pieces, lead lines, and religious imagery typical of church windows."
}
```

#### 2. Quality Assessment

The AI evaluates the technical quality of the photo to help identify the best submissions.

**Output includes:**
- `score`: Overall quality score from 0-100
- `isHighQuality`: Boolean (true if score ≥ 70)
- `issues`: Array of specific quality problems (e.g., ["too dark", "blurry", "poor framing"])
- `brightness`: One of "too_dark", "too_bright", or "good"
- `sharpness`: One of "blurry", "slightly_blurry", or "sharp"
- `framing`: One of "poor", "good", or "excellent"
- `reasoning`: Brief explanation of the quality assessment

**Example output:**
```json
{
  "score": 85,
  "isHighQuality": true,
  "issues": [],
  "brightness": "good",
  "sharpness": "sharp",
  "framing": "excellent",
  "reasoning": "Well-lit, sharp focus, and excellent framing showing the full window."
}
```

#### 3. Window Identification

When a church has multiple windows registered, the AI attempts to identify which specific window the photo shows.

**Output includes:**
- `suggestedWindowId`: The ID of the most likely window (or null if uncertain)
- `confidence`: Number between 0-1 indicating confidence level
- `reasoning`: Brief explanation of the identification
- `locationDescription`: Description of the window's position/location if helpful

**Example output:**
```json
{
  "suggestedWindowId": "win_123abc",
  "confidence": 0.88,
  "reasoning": "This appears to be the north-facing window based on the distinctive rose design pattern.",
  "locationDescription": "North wall, east side"
}
```

### Automatic Filtering

Photos are automatically flagged for filtering if they meet any of these criteria:

- **Not a stained glass window** (with confidence > 0.7)
- **Very low quality** (score < 30)
- **Multiple critical issues** (3 or more quality issues)

Filtered photos are not deleted but are flagged for admin review. Users can still see their submissions, but they may be hidden from public view until reviewed.

### Configuration

The AI service requires an OpenAI API key to be configured:

```env
OPENAI_API_KEY=your_openai_api_key
```

If no API key is provided, the service gracefully falls back to default values:
- All images are assumed to be valid stained glass windows
- Quality scores default to 70 (acceptable)
- No automatic filtering occurs

### Performance & Caching

- **Analysis runs asynchronously** after upload, so it doesn't block the upload process
- **Results are cached** by image hash to avoid re-analyzing identical images
- **Typical analysis time**: 5-30 seconds per image
- **Cost**: Uses GPT-4o Vision API pricing (pay per request)

### Privacy & Data Handling

- Images are sent to OpenAI's API for analysis
- OpenAI's data usage policies apply (check OpenAI's current policies)
- Analysis results are stored in your database
- Original images are stored on Arweave (blockchain storage)

## Prerequisites

- **Node.js**: 20.x LTS or higher
- **PostgreSQL**: 15+ (or use managed database like Supabase/Neon)
- **Git**: For cloning the repository

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd stained-glass
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb stained_glass_db
```

Or use a connection string for a managed database.

### 4. Environment Configuration

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/stained_glass_db
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
ARWEAVE_GATEWAY=https://arweave.net
CARDANO_NETWORK=testnet
CARDANO_NODE_URL=https://testnet.cardano.org
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/v1
VITE_ARWEAVE_GATEWAY=https://arweave.net
VITE_CARDANO_EXPLORER=https://testnet.cardanoscan.io
```

### 5. Database Migration

```bash
cd backend
npm run migrate
```

### 6. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/v1

## Project Structure

```
stained-glass/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── api/      # REST API routes
│   │   ├── services/ # Business logic
│   │   ├── config/   # Configuration
│   │   └── utils/    # Utilities
│   └── prisma/       # Database schema and migrations
├── frontend/         # React/TypeScript web app
│   └── src/
│       ├── components/ # React components
│       ├── pages/      # Page components
│       ├── services/   # API clients
│       └── utils/      # Utilities
└── specs/            # Feature specifications
```

## Development

### Backend Commands

```bash
cd backend

npm run dev          # Start development server with hot-reload
npm run build        # Build for production
npm run migrate      # Run database migrations
npm run migrate:reset # Reset database (WARNING: deletes all data)
npm run generate     # Generate Prisma client
npm run studio       # Open Prisma Studio
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run tests
```

### Frontend Commands

```bash
cd frontend

npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
```

## Testing

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests with Playwright
```

## API Documentation

API endpoints are documented in OpenAPI format:
- Specification: `specs/001-stained-glass-tracking/contracts/api.yaml`

## Database Schema

Database schema is defined using Prisma:
- Schema: `backend/prisma/schema.prisma`
- Documentation: `specs/001-stained-glass-tracking/data-model.md`

## Technology Stack

- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3
- **Backend**: Node.js 20, Express 4, TypeScript 5, Prisma
- **Database**: PostgreSQL 15+
- **AI**: OpenAI GPT-4 Vision API
- **Blockchain**: Arweave (storage), Cardano (audit trail)

## License

ISC

