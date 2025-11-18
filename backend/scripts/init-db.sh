#!/bin/bash

# Database initialization script
# Creates database and runs migrations

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

