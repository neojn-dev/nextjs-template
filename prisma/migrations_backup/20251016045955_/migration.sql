-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `excerpt` VARCHAR(500) NULL,
    `content` LONGTEXT NULL,
    `coverImage` VARCHAR(500) NULL,
    `headerImage` VARCHAR(500) NULL,
    `layout` VARCHAR(50) NOT NULL DEFAULT 'default',
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `publishedAt` DATETIME(3) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(60) NULL,
    `metaDescription` VARCHAR(160) NULL,
    `metaKeywords` TEXT NULL,
    `canonicalUrl` VARCHAR(500) NULL,
    `ogTitle` VARCHAR(100) NULL,
    `ogDescription` VARCHAR(200) NULL,
    `ogImage` VARCHAR(500) NULL,
    `twitterCard` VARCHAR(20) NULL,
    `category` VARCHAR(100) NULL,
    `tags` VARCHAR(191) NULL,
    `readingTime` INTEGER NULL,
    `authorId` VARCHAR(191) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `lastViewedAt` DATETIME(3) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `BlogPost_createdAt_idx`(`createdAt`),
    INDEX `BlogPost_category_idx`(`category`),
    INDEX `BlogPost_featured_idx`(`featured`),
    INDEX `BlogPost_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogAttachment` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `blogId` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `caption` TEXT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `duration` INTEGER NULL,

    INDEX `BlogAttachment_blogId_idx`(`blogId`),
    INDEX `BlogAttachment_mimeType_idx`(`mimeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NULL,
    `excerpt` VARCHAR(500) NULL,
    `body` LONGTEXT NULL,
    `headerImage` VARCHAR(500) NULL,
    `layout` VARCHAR(50) NOT NULL DEFAULT 'default',
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `publishedAt` DATETIME(3) NULL,
    `startAt` DATETIME(3) NULL,
    `endAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(60) NULL,
    `metaDescription` VARCHAR(160) NULL,
    `metaKeywords` TEXT NULL,
    `ogTitle` VARCHAR(100) NULL,
    `ogDescription` VARCHAR(200) NULL,
    `ogImage` VARCHAR(500) NULL,
    `category` VARCHAR(100) NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'normal',
    `tags` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `lastViewedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `Announcement_slug_key`(`slug`),
    INDEX `Announcement_isActive_idx`(`isActive`),
    INDEX `Announcement_startAt_idx`(`startAt`),
    INDEX `Announcement_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `Announcement_priority_idx`(`priority`),
    INDEX `Announcement_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnnouncementAttachment` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `announcementId` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `caption` TEXT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `duration` INTEGER NULL,

    INDEX `AnnouncementAttachment_announcementId_idx`(`announcementId`),
    INDEX `AnnouncementAttachment_mimeType_idx`(`mimeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tender` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NULL,
    `excerpt` VARCHAR(500) NULL,
    `description` LONGTEXT NULL,
    `headerImage` VARCHAR(500) NULL,
    `layout` VARCHAR(50) NOT NULL DEFAULT 'default',
    `referenceNo` VARCHAR(100) NULL,
    `tenderType` VARCHAR(100) NULL,
    `estimatedValue` VARCHAR(100) NULL,
    `currency` VARCHAR(10) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `publishedAt` DATETIME(3) NULL,
    `closingAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(60) NULL,
    `metaDescription` VARCHAR(160) NULL,
    `metaKeywords` TEXT NULL,
    `ogTitle` VARCHAR(100) NULL,
    `ogDescription` VARCHAR(200) NULL,
    `ogImage` VARCHAR(500) NULL,
    `category` VARCHAR(100) NULL,
    `sector` VARCHAR(100) NULL,
    `tags` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `lastViewedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `Tender_slug_key`(`slug`),
    INDEX `Tender_isActive_idx`(`isActive`),
    INDEX `Tender_publishedAt_idx`(`publishedAt`),
    INDEX `Tender_closingAt_idx`(`closingAt`),
    INDEX `Tender_status_idx`(`status`),
    INDEX `Tender_tenderType_idx`(`tenderType`),
    INDEX `Tender_category_idx`(`category`),
    INDEX `Tender_sector_idx`(`sector`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TenderAttachment` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tenderId` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `caption` TEXT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `duration` INTEGER NULL,

    INDEX `TenderAttachment_tenderId_idx`(`tenderId`),
    INDEX `TenderAttachment_mimeType_idx`(`mimeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogAttachment` ADD CONSTRAINT `BlogAttachment_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnnouncementAttachment` ADD CONSTRAINT `AnnouncementAttachment_announcementId_fkey` FOREIGN KEY (`announcementId`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tender` ADD CONSTRAINT `Tender_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TenderAttachment` ADD CONSTRAINT `TenderAttachment_tenderId_fkey` FOREIGN KEY (`tenderId`) REFERENCES `Tender`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
