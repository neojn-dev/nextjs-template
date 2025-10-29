# Prisma Migrations

This directory contains all database migrations for the application.

## Migration Structure

- **20250823192019_init** - Initial database schema (Auth, Users, Roles, Core tables)
- **20250825041339_add_roles_and_update_users** - Added Role model and updated User model
- **20250825091451_add_admin_user_fields** - Added admin user fields (mustChangePassword, createdByAdmin)
- **20250825124235_add_cms_models** - CMS models (DEPRECATED - will be removed by later migration)
- **20250825132912_add_navigation_and_site_settings** - CMS navigation and settings (DEPRECATED - will be removed by later migration)
- **20251016045955_** - Blog/Announcement/Tender models (DEPRECATED - will be removed by later migration)
- **20251029130000_remove_cms_models** - Removes all CMS and content models

## Migration Execution

Migrations are automatically executed in chronological order when you run:
- `npm run db:migrate` (or `prisma migrate dev`) - Development mode
- `npx prisma migrate deploy` - Production mode

## Consolidation

For a fresh database setup, all necessary SQL is consolidated in:
- `consolidated_init.sql` - Contains all table creation statements (without CMS models)

## Important Notes

1. **Never modify existing migration files** - Always create new migrations
2. **Always test migrations** on a copy of your database first
3. **Backup your database** before running migrations in production
4. The `20251029130000_remove_cms_models` migration removes all CMS-related tables

## Manual Migration (If Needed)

If Prisma migrations fail, you can manually execute:
```bash
mysql -u root -p next_template_db < prisma/migrations/consolidated_init.sql
```

Then mark migrations as applied:
```bash
npx prisma migrate resolve --applied 20250823192019_init
# ... repeat for each migration
```

