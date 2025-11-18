#!/bin/bash

# Database reset script
# WARNING: This will delete all data!

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

