export type AdminResourceKey = "struktur" | "homepage" | "umkm" | "infografis" | "penghargaan" | "comments";

export interface AdminField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "file" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface AdminResourceConfig {
  title: string;
  singular: string;
  apiPath: string;
  fields: AdminField[];
  listFields: { key: string; label: string }[];
}

export const adminResourceConfigs: Record<AdminResourceKey, AdminResourceConfig> = {
  struktur: {
    title: "Struktur Organisasi",
    singular: "Anggota Struktur",
    apiPath: "/api/struktur-organisasi",
    fields: [
      { name: "name", label: "Nama", type: "text", required: true, placeholder: "Nama lengkap" },
      {
        name: "title",
        label: "Jabatan",
        type: "select",
        required: true,
        options: [
          { value: "BPD", label: "BPD" },
          { value: "Kepala Desa", label: "Kepala Desa" },
          { value: "Sekretaris Desa", label: "Sekretaris Desa" },
          { value: "Kasi Pemerintahan", label: "Kasi Pemerintahan" },
          { value: "Kasi Kesejahteraan", label: "Kasi Kesejahteraan" },
          { value: "Kasi Pelayanan", label: "Kasi Pelayanan" },
          { value: "Kaur Keuangan", label: "Kaur Keuangan" },
          { value: "Kaur Tata Usaha", label: "Kaur Tata Usaha" },
          { value: "Kaur Perencanaan", label: "Kaur Perencanaan" },
          { value: "Kepala Dusun 1", label: "Kepala Dusun 1" },
          { value: "Kepala Dusun 2", label: "Kepala Dusun 2" },
          { value: "Kepala Dusun 3", label: "Kepala Dusun 3" },
        ],
      },
      { name: "description", label: "Deskripsi Singkat", type: "textarea", placeholder: "Deskripsi singkat" },
      { name: "photo", label: "Foto", type: "file", placeholder: "Unggah foto" },
      {
        name: "isActive",
        label: "Status Aktif",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Aktif" },
          { value: "false", label: "Tidak Aktif" },
        ],
      },
    ],
    listFields: [
      { key: "name", label: "Nama" },
      { key: "title", label: "Jabatan" },
      { key: "is_active", label: "Aktif" },
    ],
  },
  homepage: {
    title: "Konten Beranda",
    singular: "Konten Beranda",
    apiPath: "/api/homepage-contents",
    fields: [
      { name: "key", label: "Key Section", type: "text", required: true, placeholder: "vision / mission / greeting / about" },
      { name: "label", label: "Label", type: "text", required: true, placeholder: "Visi / Misi Desa / Sambutan" },
      { name: "title", label: "Judul", type: "text", required: true, placeholder: "Judul tampilan" },
      { name: "subtitle", label: "Subjudul", type: "textarea", placeholder: "Subjudul atau ringkasan singkat" },
      { name: "content", label: "Konten", type: "textarea", placeholder: "Isi utama atau deskripsi" },
      { name: "extra", label: "Konten Tambahan", type: "textarea", placeholder: "Daftar misi, setiap baris adalah item baru" },
      { name: "order", label: "Urutan", type: "number", required: true, placeholder: "Urutan tampil" },
      { name: "isActive", label: "Status Aktif", type: "select", required: true, options: [
        { value: "true", label: "Aktif" },
        { value: "false", label: "Tidak Aktif" },
      ] },
    ],
    listFields: [
      { key: "key", label: "Key" },
      { key: "label", label: "Label" },
      { key: "title", label: "Judul" },
      { key: "order", label: "Urutan" },
    ],
  },
  umkm: {
    title: "UMKM",
    singular: "UMKM",
    apiPath: "/api/umkm",
    fields: [
      { name: "name", label: "Nama UMKM", type: "text", required: true, placeholder: "Nama UMKM" },
      { name: "owner", label: "Pemilik", type: "text", required: true, placeholder: "Nama pemilik" },
      {
        name: "category",
        label: "Kategori",
        type: "select",
        required: true,
        placeholder: "Pilih kategori usaha",
        options: [
          { value: "kuliner", label: "Kuliner" },
          { value: "kerajinan", label: "Kerajinan" },
          { value: "jasa", label: "Jasa" },
          { value: "pertanian", label: "Pertanian" },
          { value: "fashion", label: "Fashion" },
          { value: "teknologi", label: "Teknologi" },
          { value: "lainnya", label: "Lainnya" },
        ],
      },
      { name: "address", label: "Alamat", type: "text", required: true, placeholder: "Alamat lengkap" },
      { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Deskripsi usaha" },
      { name: "whatsapp", label: "Nomor WhatsApp", type: "text", placeholder: "+62..." },
      { name: "photo", label: "Foto", type: "file", placeholder: "Unggah foto" },
      { name: "googleMapsUrl", label: "Link Google Maps", type: "url", placeholder: "https://maps.app.goo.gl/..." },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        placeholder: "Pilih status",
        options: [
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ],
      },
    ],
    listFields: [
      { key: "name", label: "Nama UMKM" },
      { key: "owner", label: "Pemilik" },
      { key: "category", label: "Kategori" },
      { key: "status", label: "Status" },
    ],
  },
  infografis: {
    title: "Infografis",
    singular: "Infografis",
    apiPath: "/api/infografis",
    fields: [
      {
        name: "title",
        label: "Judul",
        type: "select",
        required: true,
        options: [
          { value: "Jumlah Penduduk", label: "Jumlah Penduduk" },
          { value: "Jumlah KK", label: "Jumlah KK" },
          { value: "Jumlah RW", label: "Jumlah RW" },
          { value: "Jumlah RT", label: "Jumlah RT" },
          { value: "Luas Wilayah", label: "Luas Wilayah" },
        ],
        placeholder: "Pilih judul infografis",
      },
      { name: "value", label: "Nilai", type: "text", required: true, placeholder: "6200" },
      {
        name: "unit",
        label: "Satuan",
        type: "select",
        required: false,
        placeholder: "Biarkan kosong jika tidak ada satuan",
        options: [
          { value: "Jiwa", label: "Jiwa" },
          { value: "KK", label: "KK" },
          { value: "km²", label: "km²" },
          { value: "Ha", label: "Ha" },
        ],
      },
      {
        name: "icon",
        label: "Icon",
        type: "select",
        required: true,
        options: [
          { value: "users", label: "Users" },
          { value: "home", label: "Home" },
          { value: "layout-grid", label: "Grid" },
          { value: "grid-3x3", label: "Grid 3x3" },
          { value: "map-pinned", label: "Map" },
          { value: "trending-up", label: "Trending" },
          { value: "heart-pulse", label: "Heart Pulse" },
          { value: "leaf", label: "Leaf" },
          { value: "award", label: "Award" },
        ],
        placeholder: "Pilih icon",
      },
      { name: "order", label: "Urutan", type: "number", required: true, placeholder: "Urutan tampil" },
      {
        name: "isActive",
        label: "Status Aktif",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Aktif" },
          { value: "false", label: "Tidak Aktif" },
        ],
      },
    ],
    listFields: [
      { key: "title", label: "Judul" },
      { key: "value", label: "Nilai" },
      { key: "unit", label: "Satuan" },
      { key: "order", label: "Urutan" },
      { key: "is_active", label: "Aktif" },
    ],
  },
  penghargaan: {
    title: "Penghargaan",
    singular: "Penghargaan",
    apiPath: "/api/penghargaan",
    fields: [
      { name: "title", label: "Nama Penghargaan", type: "text", required: true, placeholder: "Nama penghargaan" },
      { name: "year", label: "Tahun", type: "number", required: true, placeholder: "2026" },
      { name: "organizer", label: "Penyelenggara", type: "text", placeholder: "Penyelenggara" },
      { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Deskripsi penghargaan" },
      { name: "
        name: "isActive",
        label: "Status Aktif",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Aktif" },
          { value: "false", label: "Tidak Aktif" },
        ],
      },
    ],
    listFields: [
      { key: "title", label: "Nama Penghargaan" },
      { key: "year", label: "Tahun" },
      { key: "organizer", label: "Penyelenggara" },
      { key: "is_active", label: "Status" },
    ],
  },
  comments: {
    title: "Komentar Warga",
    singular: "Komentar",
    apiPath: "/api/comments",
    fields: [
      { name: "name", label: "Nama", type: "text", required: true, placeholder: "Nama lengkap" },
      { name: "email", label: "Email", type: "text", placeholder: "Email (opsional)" },
      { name: "message", label: "Komentar", type: "textarea", required: true, placeholder: "Tulis komentar Anda..." },
    ],
    listFields: [
      { key: "name", label: "Nama" },
      { key: "email", label: "Email" },
      { key: "message", label: "Komentar" },
      { key: "created_at", label: "Tanggal" },
    ],
  },
};

export function isAdminResource(resource: string): resource is AdminResourceKey {
  return resource in adminResourceConfigs;
}
