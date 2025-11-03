# Troubleshooting

This document provides solutions to common issues.

## 🔍 Common Issues

### Database Connection Error

**Issue**: Cannot connect to database

**Solutions**:
1. Verify MySQL is running
2. Check `DATABASE_URL` in `.env`
3. Ensure database exists
4. Verify user permissions

### Prisma Client Not Found

**Issue**: Prisma Client not generated

**Solution**:
```bash
npm run db:generate
```

### Migration Failed

**Issue**: Migration fails

**Solutions**:
1. Check database connection
2. Review migration SQL
3. Check schema for errors
4. Reset database if needed: `npm run db:reset`

### Email Not Sending

**Issue**: Emails not being sent

**Solutions**:
1. Check SMTP credentials in `.env`
2. Verify email service allows SMTP
3. Check firewall/network settings
4. Test with a simple SMTP client

### Port Already in Use

**Issue**: Port 3000 already in use

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 npm run dev
```

### Build Errors

**Issue**: Build fails

**Solutions**:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`
4. Review error messages

### TypeScript Errors

**Issue**: TypeScript compilation errors

**Solution**:
```bash
npm run type-check
```

## 🔗 Related Documentation

- [Getting Started](./01-getting-started.md) - Setup issues
- [Database](./07-database.md) - Database issues
- [Deployment](./22-deployment.md) - Deployment issues

---

**Documentation Complete**

