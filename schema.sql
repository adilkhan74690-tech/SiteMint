-- ==============================================================================
-- SiteMint Production Database Schema (MySQL 8.0+)
-- Designed by: Senior Backend & Database Architect
-- Purpose: Highly scalable, fully normalized multi-tenant SaaS database structure
-- Features: 
--   1. Strict multi-tenant isolation via business_id (foreign key + index partition)
--   2. Optimized indexing strategy for rapid query execution and index-only scans
--   3. Defensive integrity constraints with foreign keys and cascade operations
--   4. Audit logging and real-time tracking structures
-- ==============================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS sitemint_prod DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sitemint_prod;

-- Disable foreign key checks temporarily to ensure clean table creation
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table: businesses (Master Tenant Registry)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `businesses`;
CREATE TABLE `businesses` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `subdomain` VARCHAR(50) NOT NULL UNIQUE,
  `custom_domain` VARCHAR(255) UNIQUE DEFAULT NULL,
  `logo_url` VARCHAR(512) DEFAULT NULL,
  `banner_url` VARCHAR(512) DEFAULT NULL,
  `contact_email` VARCHAR(100) NOT NULL,
  `contact_phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('trial', 'active', 'suspended', 'cancelled') NOT NULL DEFAULT 'trial',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_businesses_subdomain` (`subdomain`),
  INDEX `idx_businesses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: users (Tenant Owners, Managers, and Staff Members)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED DEFAULT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('owner', 'manager', 'staff', 'SUPER_ADMIN') NOT NULL DEFAULT 'staff',
  `status` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
  `refresh_token` VARCHAR(512) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_users_business_email` (`business_id`, `email`),
  INDEX `idx_users_lookup` (`business_id`, `role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: customers (Diners, Gym Members, Salon Clients)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL, -- Nullable if they book as guest first
  `status` ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_customers_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_customers_business_email` (`business_id`, `email`),
  INDEX `idx_customers_business_lookup` (`business_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: templates (Global Layout Registrations curated by SiteMint)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `templates`;
CREATE TABLE `templates` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'gym', 'restaurant', 'salon'
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `thumbnail_url` VARCHAR(512) DEFAULT NULL,
  `config_schema` JSON DEFAULT NULL, -- Validates custom typography/structure schemas
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_templates_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: theme_settings (Branding Configuration for each tenant)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `theme_settings`;
CREATE TABLE `theme_settings` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL UNIQUE, -- One branding file per tenant
  `template_id` BIGINT UNSIGNED NOT NULL,
  `primary_color` VARCHAR(7) NOT NULL DEFAULT '#10B981', -- Hex color override
  `secondary_color` VARCHAR(7) NOT NULL DEFAULT '#111827',
  `font_family` VARCHAR(50) NOT NULL DEFAULT 'Inter',
  `custom_css` TEXT DEFAULT NULL,
  `custom_settings_json` JSON DEFAULT NULL, -- Matches schema of chosen template
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_theme_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_theme_template` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: products (Physical or Digital Retail Goods sold by businesses)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `compare_at_price` DECIMAL(10,2) DEFAULT NULL,
  `sku` VARCHAR(50) DEFAULT NULL,
  `inventory_qty` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_products_business_slug` (`business_id`, `slug`),
  INDEX `idx_products_business_active` (`business_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table: services (Classes, Booking blocks, intake services)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 30,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `capacity` INT NOT NULL DEFAULT 1, -- Max reservations per slot
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_services_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  INDEX `idx_services_business_active` (`business_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table: bookings (Appointments coordinated for services / timetables)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `staff_id` BIGINT UNSIGNED DEFAULT NULL, -- Handled by specific professional
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `fk_bookings_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_bookings_schedule` (`business_id`, `start_time`, `status`),
  INDEX `idx_bookings_customer` (`business_id`, `customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Table: orders (E-commerce / Takeout / Booking checkouts)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  INDEX `idx_orders_business_status` (`business_id`, `status`),
  INDEX `idx_orders_customer` (`business_id`, `customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Table: order_items (Detailed invoice rows for orders)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Table: payments (Razorpay or Stripe ledger transactions)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `order_id` BIGINT UNSIGNED DEFAULT NULL, -- Null if payment belongs directly to a booking fee
  `booking_id` BIGINT UNSIGNED DEFAULT NULL,
  `gateway` ENUM('razorpay', 'stripe') NOT NULL DEFAULT 'razorpay',
  `gateway_order_id` VARCHAR(100) DEFAULT NULL, -- Razorpay order id
  `gateway_payment_id` VARCHAR(100) DEFAULT NULL, -- Razorpay payment id
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `status` ENUM('pending', 'authorized', 'captured', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  INDEX `idx_payments_gateway_ids` (`gateway_order_id`, `gateway_payment_id`),
  INDEX `idx_payments_status_lookup` (`business_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. Table: reviews (Feedback testimonials matching user-reviews list)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED DEFAULT NULL, -- If reviewing product
  `service_id` BIGINT UNSIGNED DEFAULT NULL, -- If reviewing booking service
  `rating` TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT DEFAULT NULL,
  `is_approved` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  INDEX `idx_reviews_approval` (`business_id`, `is_approved`),
  INDEX `idx_reviews_rating` (`business_id`, `rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. Table: media (Asset library uploaded via Cloudinary & Multer)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `public_id` VARCHAR(100) NOT NULL, -- Cloudinary secure storage signature
  `url` VARCHAR(512) NOT NULL,
  `file_name` VARCHAR(255) DEFAULT NULL,
  `file_size` INT DEFAULT NULL,
  `mime_type` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_media_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  INDEX `idx_media_business` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. Table: activity_logs (Platform Audit Trail & Security Metrics)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL, -- Who initiated the log (NULL if system auto-action)
  `action` VARCHAR(100) NOT NULL, -- e.g. 'booking_confirmed', 'inventory_updated'
  `details` TEXT DEFAULT NULL, -- JSON formatted details metadata
  `ip_address` VARCHAR(45) DEFAULT NULL, -- IPv4 or IPv6 support
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_logs_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_logs_lookup` (`business_id`, `created_at`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. Table: notifications (Websocket triggers and app feed events)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_id` BIGINT UNSIGNED NOT NULL,
  `recipient_type` ENUM('user', 'customer') NOT NULL,
  `recipient_id` BIGINT UNSIGNED NOT NULL, -- Corresponds to users.id or customers.id
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notifications_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_lookup` (`business_id`, `recipient_type`, `recipient_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enable foreign key checks again
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- Schema configuration completed successfully.
-- ==============================================================================
