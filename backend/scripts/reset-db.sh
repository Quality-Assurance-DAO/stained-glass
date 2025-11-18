#!/bin/bash

# Database reset script
# WARNING: This will delete all data!

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Load environment variables from .env file
if [ -f "$BACKEND_DIR/.env" ]; then
    export $(cat "$BACKEND_DIR/.env" | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env file not found at $BACKEND_DIR/.env"
fi

echo "⚠️  WARNING: This will delete all database data!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Database reset cancelled."
    exit 0
fi

echo "Resetting database..."

# Reset database
npx prisma migrate reset --force

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "✅ Database reset complete!"

