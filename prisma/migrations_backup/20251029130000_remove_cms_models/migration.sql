-- Remove CMS and Content Management Tables
-- This migration removes all CMS-related tables and content tables

-- Drop tables in correct order (respecting foreign key constraints)
-- Must drop tables with foreign keys BEFORE the tables they reference

-- Step 1: Drop tables that have foreign keys to other CMS tables first
DROP TABLE IF EXISTS `CmsPageBlock`;           -- References CmsPage and CmsBlock
DROP TABLE IF EXISTS `CmsNavigation`;          -- References CmsPage (must drop before CmsPage)
DROP TABLE IF EXISTS `CmsSiteSettings`;        -- References CmsPage (must drop before CmsPage)

-- Step 2: Drop tables that are referenced by others
DROP TABLE IF EXISTS `CmsPage`;                -- Referenced by CmsNavigation, CmsSiteSettings, CmsPageBlock
DROP TABLE IF EXISTS `CmsTemplate`;            -- Referenced by CmsPage
DROP TABLE IF EXISTS `CmsBlock`;               -- Referenced by CmsPageBlock

-- Step 3: Drop standalone CMS tables
DROP TABLE IF EXISTS `CmsMedia`;
DROP TABLE IF EXISTS `CmsSeoSettings`;

-- Step 4: Drop Content-related tables (attachments first, then parent tables)
DROP TABLE IF EXISTS `BlogAttachment`;        -- References BlogPost
DROP TABLE IF EXISTS `BlogPost`;               -- Referenced by BlogAttachment

DROP TABLE IF EXISTS `AnnouncementAttachment`; -- References Announcement
DROP TABLE IF EXISTS `Announcement`;           -- Referenced by AnnouncementAttachment

DROP TABLE IF EXISTS `TenderAttachment`;       -- References Tender
DROP TABLE IF EXISTS `Tender`;                 -- Referenced by TenderAttachment

