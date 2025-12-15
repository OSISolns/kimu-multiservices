# JSON Parse Error Fix - Resolution Summary

## Problem
The application was throwing the error:
```
Unexpected token '<', "<!DOCTYPE "... is not a valid JSON
```

This occurred because API routes were returning HTML error pages instead of JSON responses.

## Root Cause
The actual error was:
```
PrismaClientValidationError: You've provided both a driver adapter and an Accelerate database URL. 
Driver adapters currently cannot connect to Accelerate.
```

### Why This Happened
1. **Turso LibSQL Adapter**: The application uses `PrismaLibSQL` adapter to connect to Turso (remote SQLite)
2. **Conflicting DATABASE_URL**: The `.env.development.local` file contained:
   ```
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."
   ```
3. **Prisma Confusion**: When Prisma Client was initialized with the LibSQL adapter, it also detected the `DATABASE_URL` environment variable with a Prisma Accelerate URL pattern
4. **Validation Error**: Prisma threw a validation error because you cannot use both a driver adapter AND an Accelerate URL simultaneously
5. **HTML Error Page**: Next.js caught this server error and returned an HTML error page
6. **JSON Parse Error**: Frontend code trying to parse the HTML as JSON threw the "Unexpected token '<'" error

## Solution Applied

### 1. Fixed Prisma Schema (Previous Fix)
Updated `/prisma/schema.prisma` to use `DATABASE_URL` instead of `TURSO_DATABASE_URL`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  # For Prisma CLI operations
}
```

### 2. Commented Out Conflicting DATABASE_URL
Updated `.env.development.local` to comment out the Accelerate URL:
```bash
# DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."
```

Also updated `.env.local` with clear documentation:
```bash
# When using Turso, DATABASE_URL should NOT be set here
# It's only needed in .env for Prisma CLI operations
# The runtime will use TURSO_DATABASE_URL via the adapter
```

### 3. Prisma Client Configuration
The `/src/lib/prisma.ts` file correctly handles both scenarios:

**With Turso credentials** (Production/Development with Turso):
```typescript
if (tursoUrl && tursoToken) {
  const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
  return new PrismaClient({ adapter });
}
```

**Without Turso credentials** (Local development):
```typescript
return new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || 'file:./prisma/dev.db' } }
});
```

## Environment Variable Strategy

### `.env` (Committed to Git)
```bash
DATABASE_URL="file:./dev.db"  # For Prisma CLI (migrations, schema operations)
```

### `.env.development.local` (Not committed)
```bash
# DATABASE_URL should NOT be set here when using Turso
# Only TURSO_DATABASE_URL and TURSO_AUTH_TOKEN should be set
```

### `.env.local` (Not committed)
```bash
# Same as .env.development.local - don't set DATABASE_URL when using Turso
```

### Production Environment Variables
```bash
DATABASE_URL="file:./dev.db"          # For Prisma CLI
TURSO_DATABASE_URL="libsql://..."     # For runtime connection
TURSO_AUTH_TOKEN="your-token"         # For runtime authentication
```

## Verification

### ✅ Server Starts Successfully
```
🚀 Initialising Prisma with Turso libSQL adapter
✓ Ready in 8.3s
```

### ✅ Database Queries Execute
```
prisma:query SELECT `main`.`User`.`id`, ...
```

### ✅ API Returns Valid JSON
```bash
$ curl http://localhost:3000/api/campaigns
{
  "success": true,
  "data": {
    "campaigns": [...]
  }
}
```

## Key Takeaways

1. **Driver Adapters vs Accelerate**: You cannot use both simultaneously
2. **Environment Variable Precedence**: `.env.development.local` overrides `.env.local` which overrides `.env`
3. **Dual Purpose DATABASE_URL**: 
   - Used by Prisma CLI for schema operations (must be `file:` protocol)
   - Should NOT be set in runtime environment when using driver adapters
4. **Error Manifestation**: Server-side Prisma errors appear as HTML error pages, causing JSON parse errors on the frontend

## Files Modified
- ✅ `/prisma/schema.prisma` - Changed datasource URL to use `DATABASE_URL`
- ✅ `/src/lib/prisma.ts` - Added comments clarifying adapter behavior
- ✅ `/.env.local` - Commented out DATABASE_URL with documentation
- ✅ `/.env.development.local` - Commented out Accelerate DATABASE_URL

## Status
🎉 **RESOLVED** - Application is now running successfully with Turso database connection!
