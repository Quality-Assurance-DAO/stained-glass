#!/bin/bash

# Check prerequisites for Stained Glass Window Tracking App

echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version is too old. Please install Node.js 20.x or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client (psql) is not installed. You may need to use a managed database."
else
    PSQL_VERSION=$(psql --version | awk '{print $3}' | cut -d'.' -f1)
    if [ "$PSQL_VERSION" -lt 15 ]; then
        echo "⚠️  PostgreSQL version is older than 15. Consider upgrading or using a managed database."
    else
        echo "✅ PostgreSQL $(psql --version) is installed"
    fi
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo "⚠️  Git is not installed."
else
    echo "✅ Git $(git --version | awk '{print $3}') is installed"
fi

echo ""
echo "Prerequisites check complete!"

