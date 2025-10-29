#!/bin/bash

# Check migration status script
# This script verifies that all migrations are applied correctly

set -e

echo "🔍 Checking Prisma migration status..."
echo ""

# Check if Prisma is installed
if ! command -v npx prisma &> /dev/null; then
    echo "❌ Prisma CLI not found. Please install dependencies first."
    exit 1
fi

# Show migration status
echo "📋 Migration Status:"
npx prisma migrate status

echo ""
echo "✅ Migration check complete!"
echo ""
echo "If migrations are not in sync, you can:"
echo "  - Run: npm run db:migrate (for development)"
echo "  - Run: npx prisma migrate deploy (for production)"
echo "  - Run: npx prisma migrate reset (WARNING: deletes all data)"

