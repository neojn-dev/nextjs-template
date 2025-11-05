-- CreateTable
CREATE TABLE `CmsPage` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `content` LONGTEXT NULL,
    `templateId` VARCHAR(191) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `isDraft` BOOLEAN NOT NULL DEFAULT true,
    `metaTitle` VARCHAR(60) NULL,
    `metaDescription` VARCHAR(160) NULL,
    `metaKeywords` VARCHAR(255) NULL,
    `ogTitle` VARCHAR(60) NULL,
    `ogDescription` VARCHAR(160) NULL,
    `ogImage` VARCHAR(500) NULL,
    `layout` VARCHAR(50) NULL,
    `parentId` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isHomepage` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CmsPage_slug_key`(`slug`),
    INDEX `CmsPage_slug_idx`(`slug`),
    INDEX `CmsPage_isPublished_idx`(`isPublished`),
    INDEX `CmsPage_templateId_idx`(`templateId`),
    INDEX `CmsPage_parentId_idx`(`parentId`),
    INDEX `CmsPage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(50) NOT NULL,
    `structure` LONGTEXT NOT NULL,
    `previewImage` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `layout` VARCHAR(50) NOT NULL,
    `defaultBlocks` LONGTEXT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,

    INDEX `CmsTemplate_category_idx`(`category`),
    INDEX `CmsTemplate_isActive_idx`(`isActive`),
    INDEX `CmsTemplate_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsBlock` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `component` VARCHAR(100) NOT NULL,
    `props` LONGTEXT NULL,
    `defaultContent` LONGTEXT NULL,
    `isReusable` BOOLEAN NOT NULL DEFAULT true,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `previewImage` VARCHAR(500) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,

    INDEX `CmsBlock_type_idx`(`type`),
    INDEX `CmsBlock_category_idx`(`category`),
    INDEX `CmsBlock_isReusable_idx`(`isReusable`),
    INDEX `CmsBlock_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsPageBlock` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `blockId` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NULL,
    `settings` LONGTEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `section` VARCHAR(50) NULL,

    INDEX `CmsPageBlock_pageId_idx`(`pageId`),
    INDEX `CmsPageBlock_blockId_idx`(`blockId`),
    INDEX `CmsPageBlock_sortOrder_idx`(`sortOrder`),
    UNIQUE INDEX `CmsPageBlock_pageId_blockId_section_key`(`pageId`, `blockId`, `section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsMedia` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `path` VARCHAR(500) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `title` VARCHAR(200) NULL,
    `altText` VARCHAR(255) NULL,
    `caption` TEXT NULL,
    `description` TEXT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `folder` VARCHAR(100) NULL,
    `tags` TEXT NULL,
    `uploadedBy` VARCHAR(191) NOT NULL,

    INDEX `CmsMedia_mimeType_idx`(`mimeType`),
    INDEX `CmsMedia_folder_idx`(`folder`),
    INDEX `CmsMedia_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsSeoSettings` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `siteName` VARCHAR(100) NULL,
    `siteDescription` VARCHAR(160) NULL,
    `defaultOgImage` VARCHAR(500) NULL,
    `googleAnalyticsId` VARCHAR(50) NULL,
    `googleTagManagerId` VARCHAR(50) NULL,
    `facebookPixelId` VARCHAR(50) NULL,
    `twitterHandle` VARCHAR(50) NULL,
    `facebookUrl` VARCHAR(200) NULL,
    `linkedinUrl` VARCHAR(200) NULL,
    `instagramUrl` VARCHAR(200) NULL,
    `robotsTxt` TEXT NULL,
    `customHead` TEXT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,

    INDEX `CmsSeoSettings_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CmsPage` ADD CONSTRAINT `CmsPage_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CmsTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsPage` ADD CONSTRAINT `CmsPage_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CmsPage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsPage` ADD CONSTRAINT `CmsPage_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsPage` ADD CONSTRAINT `CmsPage_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsTemplate` ADD CONSTRAINT `CmsTemplate_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsTemplate` ADD CONSTRAINT `CmsTemplate_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsBlock` ADD CONSTRAINT `CmsBlock_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsBlock` ADD CONSTRAINT `CmsBlock_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsPageBlock` ADD CONSTRAINT `CmsPageBlock_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `CmsPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsPageBlock` ADD CONSTRAINT `CmsPageBlock_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `CmsBlock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsMedia` ADD CONSTRAINT `CmsMedia_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsSeoSettings` ADD CONSTRAINT `CmsSeoSettings_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
