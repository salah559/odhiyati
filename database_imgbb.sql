-- قاعدة بيانات لنظام إدارة الأغنام مع ImgBB
-- هذا الملف يحتوي على جميع الجداول اللازمة للنظام

-- جدول الصور - يخزن روابط الصور من ImgBB
CREATE TABLE IF NOT EXISTS `images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `image_url` TEXT NOT NULL COMMENT 'رابط الصورة الكامل من ImgBB',
  `thumbnail_url` TEXT DEFAULT NULL COMMENT 'رابط الصورة المصغرة',
  `delete_url` TEXT DEFAULT NULL COMMENT 'رابط حذف الصورة من ImgBB',
  `original_file_name` VARCHAR(255) DEFAULT NULL COMMENT 'اسم الملف الأصلي',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'نوع الملف',
  `file_size` INT DEFAULT NULL COMMENT 'حجم الملف بالبايت',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ الإنشاء',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول تخزين روابط الصور من ImgBB';

-- جدول الأغنام
CREATE TABLE IF NOT EXISTS `sheep` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'اسم الخروف',
  `category` VARCHAR(50) NOT NULL COMMENT 'الفئة: محلي، روماني، إسباني',
  `price` DECIMAL(10, 2) NOT NULL COMMENT 'السعر',
  `discount_percentage` DECIMAL(5, 2) DEFAULT NULL COMMENT 'نسبة الخصم',
  `image_ids` JSON NOT NULL COMMENT 'معرفات الصور كـ JSON array',
  `age` VARCHAR(100) NOT NULL COMMENT 'العمر',
  `weight` VARCHAR(100) NOT NULL COMMENT 'الوزن',
  `breed` VARCHAR(100) NOT NULL COMMENT 'السلالة',
  `health_status` TEXT NOT NULL COMMENT 'الحالة الصحية',
  `description` TEXT NOT NULL COMMENT 'الوصف',
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'مميز',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ الإنشاء',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاريخ آخر تحديث',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول الأغنام';

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(128) DEFAULT NULL COMMENT 'معرف المستخدم',
  `user_name` VARCHAR(255) NOT NULL COMMENT 'اسم المستخدم',
  `user_phone` VARCHAR(20) NOT NULL COMMENT 'رقم هاتف المستخدم',
  `wilaya_code` VARCHAR(10) NOT NULL COMMENT 'كود الولاية',
  `wilaya_name` VARCHAR(100) NOT NULL COMMENT 'اسم الولاية',
  `commune_id` INT NOT NULL COMMENT 'معرف البلدية',
  `commune_name` VARCHAR(100) NOT NULL COMMENT 'اسم البلدية',
  `items` JSON NOT NULL COMMENT 'عناصر الطلب كـ JSON array',
  `total_amount` DECIMAL(10, 2) NOT NULL COMMENT 'المبلغ الإجمالي',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'حالة الطلب: pending, processing, completed, cancelled',
  `notes` TEXT DEFAULT NULL COMMENT 'ملاحظات',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ الإنشاء',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاريخ آخر تحديث',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول الطلبات';

-- جدول المشرفين
CREATE TABLE IF NOT EXISTS `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'البريد الإلكتروني',
  `role` VARCHAR(20) NOT NULL DEFAULT 'secondary' COMMENT 'الدور: primary, secondary',
  `added_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ الإضافة',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول المشرفين';

-- جدول الخصومات
CREATE TABLE IF NOT EXISTS `discounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sheep_id` INT NOT NULL COMMENT 'معرف الخروف',
  `percentage` DECIMAL(5, 2) NOT NULL COMMENT 'نسبة الخصم',
  `valid_from` TIMESTAMP NOT NULL COMMENT 'تاريخ بداية الخصم',
  `valid_to` TIMESTAMP NOT NULL COMMENT 'تاريخ نهاية الخصم',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'فعال',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ الإنشاء',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول الخصومات';

-- إنشاء مؤشرات لتحسين الأداء
CREATE INDEX idx_sheep_category ON sheep(category);
CREATE INDEX idx_sheep_is_featured ON sheep(is_featured);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_discounts_sheep_id ON discounts(sheep_id);
CREATE INDEX idx_discounts_active ON discounts(is_active);
