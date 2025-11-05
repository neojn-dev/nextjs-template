-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdByAdmin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT false;
