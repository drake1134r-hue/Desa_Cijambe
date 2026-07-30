-- SQL script generated from lib/db/schema.ts
-- Pastikan MySQL versi Anda mendukung JSON dan default value untuk kolom JSON.

CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(150) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `email_verified` TIMESTAMP NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30),
  `avatar_url` VARCHAR(512),
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `type` VARCHAR(40) NOT NULL,
  `description` TEXT,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `news` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(220) NOT NULL,
  `slug` VARCHAR(240) NOT NULL,
  `summary` VARCHAR(500) NOT NULL,
  `content` TEXT NOT NULL,
  `category_id` INT NULL,
  `author_id` INT NULL,
  `cover_image_url` VARCHAR(512),
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
  `seo_title` VARCHAR(140),
  `seo_description` VARCHAR(300),
  `tags` JSON NOT NULL DEFAULT ('[]'),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `organization_structures` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `photo_url` VARCHAR(512),
  `order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `homepage_contents` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(120) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `title` VARCHAR(220) NOT NULL,
  `subtitle` TEXT,
  `content` TEXT,
  `extra` TEXT,
  `order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `homepage_contents` (`key`, `label`, `title`, `subtitle`, `content`, `extra`, `order`, `is_active`) VALUES
('vision', 'Visi', 'AMMAN BERKAT', 'Desa Cijambe yang Agamis, Maju, Mandiri, dan Berbasis Masyarakat', 'Visi ini adalah arah dan cita-cita pembangunan Desa Cijambe untuk mewujudkan masyarakat yang sejahtera, beriman, dan mandiri.', NULL, 1, 1),
('mission', 'Misi Desa', 'Misi Desa', 'Program kerja dan pedoman pembangunan desa', 'Misi kami berupa serangkaian strategi peningkatan kualitas hidup masyarakat desa.', 'Meningkatkan kinerja dan mutu SDM perangkat desa.
Meningkatkan kegiatan keagamaan, keamanan, dan ketertiban.
Meningkatkan kualitas kesehatan masyarakat dan kebersihan desa.
Mengembangkan ekonomi masyarakat melalui BUMDES.', 2, 1),
('greeting', 'Sambutan', 'Kepala Desa Cijambe', NULL, 'Selamat datang di portal Desa Cijambe. Kami hadir untuk mempermudah akses informasi, layanan, dan komunikasi antara pemerintah desa dan warga.', NULL, 3, 1),
('about', 'Tentang Desa', 'Desa Cijambe yang Agamis, Maju, Mandiri, dan Berbasis Masyarakat', NULL, 'Desa Cijambe merupakan salah satu desa di Kecamatan Paseh, Kabupaten Sumedang. Dengan semangat AMMAN BERKAT, kami berkomitmen mewujudkan pelayanan desa yang transparan dan pembangunan yang berkelanjutan.', NULL, 4, 1);

CREATE TABLE `umkms` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(220) NOT NULL,
  `owner` VARCHAR(220) NOT NULL,
  `category` VARCHAR(120) NOT NULL,
  `address` VARCHAR(320) NOT NULL,
  `description` TEXT,
  `whatsapp` VARCHAR(80),
  `photo_url` VARCHAR(512),
  `google_maps_url` VARCHAR(512),
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `infographics` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `value` VARCHAR(100) NOT NULL,
  `unit` VARCHAR(80),
  `icon` VARCHAR(120),
  `order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `awards` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(220) NOT NULL,
  `year` INT NOT NULL,
  `organizer` VARCHAR(220) NOT NULL,
  `description` TEXT,
  `photo_url` VARCHAR(512),
  `order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comments` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(220) NOT NULL,
  `email` VARCHAR(220),
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
