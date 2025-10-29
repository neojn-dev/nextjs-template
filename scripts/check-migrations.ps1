# Check migration status script (PowerShell)
# This script verifies that all migrations are applied correctly

Write-Host "🔍 Checking Prisma migration status..." -ForegroundColor Cyan
Write-Host ""

# Check if Prisma is available
try {
    $prismaVersion = npx prisma --version 2>&1
    Write-Host "✅ Prisma found: $prismaVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Prisma CLI not found. Please install dependencies first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Migration Status:" -ForegroundColor Cyan
npx prisma migrate status

Write-Host ""
Write-Host "✅ Migration check complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If migrations are not in sync, you can:" -ForegroundColor Yellow
Write-Host "  - Run: npm run db:migrate (for development)"
Write-Host "  - Run: npx prisma migrate deploy (for production)"
Write-Host "  - Run: npx prisma migrate reset (WARNING: deletes all data)" -ForegroundColor Red

