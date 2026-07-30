-- Supabase / PostgreSQL table definitions for webprofiledesacijambe
-- Run this in Supabase SQL Editor or via psql using the project database.

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  avatar_url VARCHAR(512),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  type VARCHAR(40) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category_id INT NULL REFERENCES categories(id) ON DELETE SET NULL,
  author_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
  cover_image_url VARCHAR(512),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  seo_title VARCHAR(140),
  seo_description VARCHAR(300),
  tags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE organization_structures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  photo_url VARCHAR(512),
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE homepage_contents (
  id SERIAL PRIMARY KEY,
  key VARCHAR(120) NOT NULL,
  label VARCHAR(120) NOT NULL,
  title VARCHAR(220) NOT NULL,
  subtitle TEXT,
  content TEXT,
  extra TEXT,
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO homepage_contents (key, label, title, subtitle, content, extra, "order", is_active) VALUES
('vision', 'Visi', 'AMMAN BERKAT', 'Desa Cijambe yang Agamis, Maju, Mandiri, dan Berbasis Masyarakat', 'Visi ini adalah arah dan cita-cita pembangunan Desa Cijambe untuk mewujudkan masyarakat yang sejahtera, beriman, dan mandiri.', NULL, 1, true),
('mission', 'Misi Desa', 'Misi Desa', 'Program kerja dan pedoman pembangunan desa', 'Misi kami berupa serangkaian strategi peningkatan kualitas hidup masyarakat desa.', 'Meningkatkan kinerja dan mutu SDM perangkat desa.
Meningkatkan kegiatan keagamaan, keamanan, dan ketertiban.
Meningkatkan kualitas kesehatan masyarakat dan kebersihan desa.
Mengembangkan ekonomi masyarakat melalui BUMDES.', 2, true),
('greeting', 'Sambutan', 'Kepala Desa Cijambe', NULL, 'Selamat datang di portal Desa Cijambe. Kami hadir untuk mempermudah akses informasi, layanan, dan komunikasi antara pemerintah desa dan warga.', NULL, 3, true),
('about', 'Tentang Desa', 'Desa Cijambe yang Agamis, Maju, Mandiri, dan Berbasis Masyarakat', NULL, 'Desa Cijambe merupakan salah satu desa di Kecamatan Paseh, Kabupaten Sumedang. Dengan semangat AMMAN BERKAT, kami berkomitmen mewujudkan pelayanan desa yang transparan dan pembangunan yang berkelanjutan.', NULL, 4, true);

CREATE TABLE umkms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  owner VARCHAR(220) NOT NULL,
  category VARCHAR(120) NOT NULL,
  address VARCHAR(320) NOT NULL,
  description TEXT,
  whatsapp VARCHAR(80),
  photo_url VARCHAR(512),
  google_maps_url VARCHAR(512),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE infographics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  value VARCHAR(100) NOT NULL,
  unit VARCHAR(80),
  icon VARCHAR(120),
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE awards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  year INT NOT NULL,
  organizer VARCHAR(220) NOT NULL,
  description TEXT,
  photo_url VARCHAR(512),
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  email VARCHAR(220),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Optional: insert a default admin role if needed
INSERT INTO roles (name, description) VALUES ('Administrator', 'Default admin role') ON CONFLICT DO NOTHING;
