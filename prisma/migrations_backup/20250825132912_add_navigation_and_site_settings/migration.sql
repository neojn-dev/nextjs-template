-- CreateTable
CREATE TABLE `CmsNavigation` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `href` VARCHAR(500) NOT NULL,
    `target` VARCHAR(20) NULL,
    `parentId` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `type` VARCHAR(50) NOT NULL,
    `pageId` VARCHAR(191) NULL,
    `icon` VARCHAR(100) NULL,
    `cssClass` VARCHAR(200) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,

    INDEX `CmsNavigation_parentId_idx`(`parentId`),
    INDEX `CmsNavigation_sortOrder_idx`(`sortOrder`),
    INDEX `CmsNavigation_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsSiteSettings` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `homepageId` VARCHAR(191) NULL,
    `siteLogo` VARCHAR(500) NULL,
    `siteLogoAlt` VARCHAR(200) NULL,
    `headerStyle` VARCHAR(50) NULL,
    `showSearch` BOOLEAN NOT NULL DEFAULT false,
    `footerText` TEXT NULL,
    `copyrightText` VARCHAR(200) NULL,
    `showSocialLinks` BOOLEAN NOT NULL DEFAULT true,
    `contactEmail` VARCHAR(200) NULL,
    `contactPhone` VARCHAR(50) NULL,
    `contactAddress` TEXT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,

    INDEX `CmsSiteSettings_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CmsNavigation` ADD CONSTRAINT `CmsNavigation_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CmsNavigation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsNavigation` ADD CONSTRAINT `CmsNavigation_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `CmsPage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsNavigation` ADD CONSTRAINT `CmsNavigation_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsNavigation` ADD CONSTRAINT `CmsNavigation_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsSiteSettings` ADD CONSTRAINT `CmsSiteSettings_homepageId_fkey` FOREIGN KEY (`homepageId`) REFERENCES `CmsPage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsSiteSettings` ADD CONSTRAINT `CmsSiteSettings_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
