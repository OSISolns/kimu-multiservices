#!/bin/bash

# Test script to verify Prisma Turso configuration

echo "🔍 Testing Prisma Turso Configuration..."
echo ""

# Check environment variables
echo "1. Checking environment variables..."
if grep -q "TURSO_DATABASE_URL" .env && grep -q "TURSO_AUTH_TOKEN" .env; then
    echo "   ✅ Turso environment variables found"
else
    echo "   ❌ Turso environment variables missing"
    exit 1
fi

# Check Prisma schema
echo ""
echo "2. Checking Prisma schema..."
if grep -q 'previewFeatures = \["driverAdapters"\]' prisma/schema.prisma; then
    echo "   ✅ driverAdapters preview feature enabled"
else
    echo "   ⚠️  driverAdapters preview feature not found (may not be needed in newer versions)"
fi

# Check prisma client is generated
echo ""
echo "3. Checking Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "   ✅ Prisma Client generated"
else
    echo "   ❌ Prisma Client not found - run: npx prisma generate"
    exit 1
fi

# Check singleton prisma instance
echo ""
echo "4. Checking singleton Prisma instance..."
if [ -f "src/lib/prisma.ts" ]; then
    if grep -q "PrismaLibSQL" src/lib/prisma.ts; then
        echo "   ✅ Singleton prisma with libSQL adapter configured"
    else
        echo "   ❌ libSQL adapter not found in singleton"
        exit 1
    fi
else
    echo "   ❌ src/lib/prisma.ts not found"
    exit 1
fi

# Check API routes use singleton
echo ""
echo "5. Checking API routes use singleton..."
ROUTES_TO_CHECK=(
    "src/app/api/campaigns/route.ts"
    "src/app/api/activities/route.ts"
    "src/app/api/quotes/route.ts"
)

for route in "${ROUTES_TO_CHECK[@]}"; do
    if [ -f "$route" ]; then
        if grep -q "import { prisma } from '@/lib/prisma'" "$route"; then
            echo "   ✅ $route uses singleton"
        else
            echo "   ❌ $route doesn't use singleton"
        fi
    fi
done

echo ""
echo "✨ Configuration check complete!"
echo ""
echo "To test the API endpoints, run:"
echo "  npm run dev"
echo ""
echo "Then test the campaigns endpoint:"
echo "  curl http://localhost:3000/api/campaigns"
