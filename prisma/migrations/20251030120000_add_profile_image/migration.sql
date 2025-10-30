-- Add optional profileImage to User
ALTER TABLE `User`
  ADD COLUMN `profileImage` VARCHAR(191) NULL AFTER `lastName`;


