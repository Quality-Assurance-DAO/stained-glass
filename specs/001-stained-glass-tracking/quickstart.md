# Quickstart Guide: Stained Glass Window Tracking App

**Date**: 2025-01-27  
**Purpose**: Get started with development quickly

## Prerequisites

- Node.js 20.x LTS or higher
- PostgreSQL 15+ (or use managed database like Supabase/Neon)
- Git
- Code editor (VS Code recommended)

## Project Structure

```
stained-glass/
├── backend/          # Node.js/Express API server
├── frontend/         # React/TypeScript web app
├── specs/            # Feature specifications and design docs
└── .specify/         # Specification tooling
```

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository (if not already cloned)
git clone <repository-url>
cd stained-glass

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb stained_glass_db

# Or use connection string for managed database
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/stained_glass_db"
```

### 3. Environment Configuration

**Backend** (create `backend/.env`):
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stained_glass_db

# Server
PORT=3000
NODE_ENV=development

# Arweave
ARWEAVE_WALLET_PATH=./wallet.json
ARWEAVE_GATEWAY=https://arweave.net

# Cardano
CARDANO_NETWORK=testnet
CARDANO_NODE_URL=https://testnet.cardano.org

# AI/ML
OPENAI_API_KEY=your_openai_api_key
# OR
GOOGLE_CLOUD_VISION_API_KEY=your_google_api_key

# JWT (if using authentication)
JWT_SECRET=your_jwt_secret_key

# CORS
FRONTEND_URL=http://localhost:5173
```

**Frontend** (create `frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/v1
VITE_ARWEAVE_GATEWAY=https://arweave.net
VITE_CARDANO_EXPLORER=https://testnet.cardanoscan.io
```

### 4. Database Migrations

```bash
cd backend

# Run migrations (using TypeORM or Prisma)
npm run migration:run

# Or with Prisma
npx prisma migrate dev
```

### 5. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## Development Workflow

### Running Tests

**Backend**:
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Frontend**:
```bash
cd frontend
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests with Playwright
```

### Code Quality

```bash
# Backend
cd backend
npm run lint          # ESLint
npm run format        # Prettier

# Frontend
cd frontend
npm run lint          # ESLint
npm run format        # Prettier
```

## Key Development Tasks

### Adding a New API Endpoint

1. Define endpoint in `contracts/api.yaml` (OpenAPI spec)
2. Create route handler in `backend/src/api/routes/`
3. Create service in `backend/src/services/`
4. Add tests in `backend/tests/`
5. Update frontend API client in `frontend/src/services/api/`

### Adding a New Frontend Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx` (React Router)
3. Create API service method if needed
4. Add tests in `frontend/tests/`

### Database Changes

1. Create migration file:
   ```bash
   cd backend
   npm run migration:create -- -n MigrationName
   ```
2. Update entity models in `backend/src/models/`
3. Run migration:
   ```bash
   npm run migration:run
   ```

## Testing the Application

### Manual Testing Checklist

1. **Church Search** (User Story 1):
   - Search by county and town
   - View church details with floor plan
   - Browse existing window submissions

2. **Photo Upload** (User Story 2):
   - Take photo in app
   - Receive quality feedback
   - Verify location (GPS or manual override)
   - Upload photo successfully

3. **Window Assignment** (User Story 3):
   - Assign photo to window using floor plan
   - View photos organized by window

4. **User Profile** (User Story 5):
   - View anonymous app ID
   - See contribution statistics
   - Edit/delete own submissions

5. **Blockchain Records** (User Story 6):
   - View Arweave record for submission
   - View Cardano audit trail

### API Testing

Use the OpenAPI spec to test endpoints:

```bash
# Generate API client from OpenAPI spec
npx @openapitools/openapi-generator-cli generate \
  -i specs/001-stained-glass-tracking/contracts/api.yaml \
  -g typescript-axios \
  -o frontend/src/generated/api
```

Or use tools like Postman/Insomnia with the OpenAPI spec.

## Common Issues

### Database Connection Errors

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` environment variable
- Ensure database exists: `psql -l | grep stained_glass`

### Arweave Upload Failures

- Verify wallet file exists and has funds
- Check network connectivity to Arweave gateway
- Review queue retry logic in `backend/src/services/arweave.ts`

### Cardano Transaction Failures

- Verify Cardano network configuration (testnet vs mainnet)
- Check node connectivity
- Ensure sufficient ADA for transaction fees

### CORS Errors

- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS middleware configuration in `backend/src/api/app.ts`

## Next Steps

1. Review [data-model.md](./data-model.md) for database schema
2. Review [contracts/api.yaml](./contracts/api.yaml) for API endpoints
3. Review [research.md](./research.md) for technology decisions
4. Review [plan.md](./plan.md) for implementation plan
5. Review [spec.md](./spec.md) for feature requirements

## Resources

- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Arweave Documentation](https://docs.arweave.org)
- [Cardano Documentation](https://docs.cardano.org)
- [OpenAPI Specification](https://swagger.io/specification/)

## Getting Help

- Check existing issues in repository
- Review design documents in `specs/001-stained-glass-tracking/`
- Consult team documentation
- Ask questions in team chat/channel

