-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` VARCHAR(191) NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `emailVerified` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Upload` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Teacher` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `yearsOfExperience` INTEGER NULL,
    `salary` DECIMAL(10, 2) NULL,
    `hireDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Teacher_email_key`(`email`),
    UNIQUE INDEX `Teacher_employeeId_key`(`employeeId`),
    INDEX `Teacher_isActive_idx`(`isActive`),
    INDEX `Teacher_createdAt_idx`(`createdAt`),
    INDEX `Teacher_department_idx`(`department`),
    INDEX `Teacher_department_isActive_idx`(`department`, `isActive`),
    INDEX `Teacher_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `Teacher_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Doctor` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `yearsOfExperience` INTEGER NULL,
    `salary` DECIMAL(10, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Doctor_email_key`(`email`),
    UNIQUE INDEX `Doctor_employeeId_key`(`employeeId`),
    UNIQUE INDEX `Doctor_licenseNumber_key`(`licenseNumber`),
    INDEX `Doctor_isActive_idx`(`isActive`),
    INDEX `Doctor_createdAt_idx`(`createdAt`),
    INDEX `Doctor_department_idx`(`department`),
    INDEX `Doctor_specialization_idx`(`specialization`),
    INDEX `Doctor_department_isActive_idx`(`department`, `isActive`),
    INDEX `Doctor_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `Doctor_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Engineer` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `engineeringType` VARCHAR(191) NOT NULL,
    `yearsOfExperience` INTEGER NULL,
    `salary` DECIMAL(10, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Engineer_email_key`(`email`),
    UNIQUE INDEX `Engineer_employeeId_key`(`employeeId`),
    INDEX `Engineer_isActive_idx`(`isActive`),
    INDEX `Engineer_createdAt_idx`(`createdAt`),
    INDEX `Engineer_department_idx`(`department`),
    INDEX `Engineer_specialization_idx`(`specialization`),
    INDEX `Engineer_engineeringType_idx`(`engineeringType`),
    INDEX `Engineer_department_isActive_idx`(`department`, `isActive`),
    INDEX `Engineer_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `Engineer_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lawyer` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `practiceArea` VARCHAR(191) NOT NULL,
    `barNumber` VARCHAR(191) NOT NULL,
    `yearsOfExperience` INTEGER NULL,
    `salary` DECIMAL(10, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Lawyer_email_key`(`email`),
    UNIQUE INDEX `Lawyer_employeeId_key`(`employeeId`),
    UNIQUE INDEX `Lawyer_barNumber_key`(`barNumber`),
    INDEX `Lawyer_isActive_idx`(`isActive`),
    INDEX `Lawyer_createdAt_idx`(`createdAt`),
    INDEX `Lawyer_department_idx`(`department`),
    INDEX `Lawyer_practiceArea_idx`(`practiceArea`),
    INDEX `Lawyer_department_isActive_idx`(`department`, `isActive`),
    INDEX `Lawyer_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `Lawyer_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterData` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `textField` VARCHAR(255) NULL,
    `emailField` VARCHAR(255) NULL,
    `phoneField` VARCHAR(20) NULL,
    `urlField` VARCHAR(500) NULL,
    `searchField` VARCHAR(255) NULL,
    `textareaField` TEXT NULL,
    `richTextField` LONGTEXT NULL,
    `numberField` DECIMAL(10, 2) NULL,
    `integerField` INTEGER NULL,
    `rangeField` INTEGER NULL,
    `sliderValue` FLOAT NULL,
    `dateField` DATETIME(3) NULL,
    `timeField` VARCHAR(10) NULL,
    `dateTimeField` DATETIME(3) NULL,
    `monthField` VARCHAR(7) NULL,
    `weekField` VARCHAR(10) NULL,
    `singleSelect` VARCHAR(100) NULL,
    `multiSelect` VARCHAR(191) NULL,
    `radioSelection` VARCHAR(100) NULL,
    `checkboxGroup` VARCHAR(191) NULL,
    `switchField` BOOLEAN NOT NULL DEFAULT false,
    `checkboxField` BOOLEAN NOT NULL DEFAULT false,
    `colorField` VARCHAR(7) NULL,
    `ratingField` FLOAT NULL,
    `tagsField` VARCHAR(191) NULL,
    `fieldType` VARCHAR(50) NOT NULL,

    INDEX `MasterData_category_isActive_idx`(`category`, `isActive`),
    INDEX `MasterData_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerificationToken` ADD CONSTRAINT `VerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Upload` ADD CONSTRAINT `Upload_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
