export const roles = { collectionName: "roles" };
export const users = { collectionName: "users" };
export const categories = { collectionName: "categories" };
export const news = { collectionName: "news" };
export const organizationStructures = { collectionName: "organization_structures" };
export const homepageContents = { collectionName: "homepage_contents" };
export const umkms = { collectionName: "umkms" };
export const infographics = { collectionName: "infographics" };
export const awards = { collectionName: "awards" };
export const comments = { collectionName: "comments" };

export type Role = {
  id: number;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
};

export type User = {
  id: number;
  role_id: number;
  name: string;
  username: string;
  email: string;
  email_verified?: Date | null;
  password_hash: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  is_system: boolean;
  last_login_at?: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type NewsItem = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category_id?: number | null;
  author_id?: number | null;
  cover_image_url?: string | null;
  is_featured: boolean;
  published_at?: Date | null;
  status: string;
  seo_title?: string | null;
  seo_description?: string | null;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
};

export type OrganizationStructure = {
  id: number;
  name: string;
  title?: string | null;
  position?: string | null;
  description?: string | null;
  photo_url?: string | null;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type HomepageContent = {
  id: number;
  key: string;
  label: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  extra?: string | null;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Umkm = {
  id: number;
  name: string;
  owner: string;
  category: string;
  address: string;
  description?: string | null;
  whatsapp?: string | null;
  photo_url?: string | null;
  google_maps_url?: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
};

export type Infographic = {
  id: number;
  title: string;
  value: string;
  unit?: string | null;
  icon?: string | null;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Award = {
  id: number;
  title: string;
  year: number;
  organizer: string;
  description?: string | null;
  photo_url?: string | null;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Comment = {
  id: number;
  name: string;
  email?: string | null;
  message: string;
  created_at: Date;
  updated_at: Date;
};
