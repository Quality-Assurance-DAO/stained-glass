#!/bin/bash

# Database initialization script
# Creates database and runs migrations

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Load environment variables from .env file
if [ -f "$BACKEND_DIR/.env" ]; then
    export $(cat "$BACKEND_DIR/.env" | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env file not found at $BACKEND_DIR/.env"
fi

echo "Initializing database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "   Please set it in backend/.env file"
    exit 1
fi

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "✅ Database initialization complete!"

