# Stained Glass Window Tracking App

A cross-platform web application for tracking and documenting stained glass windows in churches, with blockchain storage on Arweave and audit trail on Cardano.

## Features

- **Church Search**: Search churches by county and town
- **Window Tracking**: Organize photos by window location using floor plans
- **Photo Upload**: Capture photos with location verification and quality assessment
- **AI Analysis**: Automatic image classification and quality filtering
- **Blockchain Storage**: Immutable storage on Arweave with Cardano audit trail
- **Anonymous Users**: Persistent app IDs for contribution tracking

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

