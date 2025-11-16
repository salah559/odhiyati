
-- حذف الجداول القديمة وإعادة إنشائها بشكل صحيح

-- حذف الجداول إذا كانت موجودة
DROP TABLE IF EXISTS `discounts`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `sheep`;
DROP TABLE IF EXISTS `images`;
DROP TABLE IF EXISTS `admins`;

-- جدول الصور
CREATE TABLE `images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `image_data` MEDIUMTEXT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأغنام
CREATE TABLE `sheep` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `discount_percentage` DECIMAL(5, 2) DEFAULT NULL,
  `image_ids` JSON NOT NULL,
  `age` VARCHAR(100) NOT NULL,
  `weight` VARCHAR(100) NOT NULL,
  `breed` VARCHAR(100) NOT NULL,
  `health_status` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الطلبات
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(128) DEFAULT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_phone` VARCHAR(20) NOT NULL,
  `wilaya_code` VARCHAR(10) NOT NULL,
  `wilaya_name` VARCHAR(100) NOT NULL,
  `commune_id` INT NOT NULL,
  `commune_name` VARCHAR(100) NOT NULL,
  `items` JSON NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المديرين
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` VARCHAR(20) NOT NULL DEFAULT 'secondary',
  `added_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الخصومات
CREATE TABLE `discounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sheep_id` INT NOT NULL,
  `percentage` DECIMAL(5, 2) NOT NULL,
  `valid_from` TIMESTAMP NOT NULL,
  `valid_to` TIMESTAMP NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sheep_id`) REFERENCES `sheep`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إضافة المدير الرئيسي
INSERT INTO `admins` (`email`, `role`) 
VALUES ('bouazzasalah120120@gmail.com', 'primary');
