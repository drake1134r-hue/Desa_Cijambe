import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnv() {
  const envFile = '.env.local';
  if (!fs.existsSync(envFile)) {
    throw new Error(`${envFile} tidak ditemukan. Salin dari .env.local.example dan isi nilai Supabase.`);
  }

  const env = Object.fromEntries(
    fs
      .readFileSync(envFile, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx), line.slice(idx + 1)];
      })
      .filter(([key]) => key && !key.startsWith('#'))
  );

  return env;
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diatur di .env.local');
  }

  if (/^(sb_publishable_|sb_anon_)/.test(supabaseKey)) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY terlihat seperti publishable/anon key. Gunakan service role key.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const records = [
    {
      name: 'BPD',
      position: 'Badan Permusyawaratan Desa',
      description: 'Badan permusyawaratan desa yang menjadi wakil masyarakat.',
      photo_url: '',
      order: 1,
      is_active: true,
    },
    {
      name: 'Takhyar S Iskandar',
      position: 'Kepala Desa',
      description: 'Kepala Desa Cijambe.',
      photo_url: '',
      order: 2,
      is_active: true,
    },
    {
      name: 'Iwan Setiawan, SE',
      position: 'Sekretaris Desa',
      description: 'Sekretaris Desa.',
      photo_url: '',
      order: 3,
      is_active: true,
    },
    {
      name: 'Edi Sahudi',
      position: 'Kasie Pemerintahan',
      description: 'Anggota Tim Kasie BPD.',
      photo_url: '',
      order: 4,
      is_active: true,
    },
    {
      name: 'Selvi Adiyanti Koesnadi',
      position: 'Kasie Kesejahteraan',
      description: 'Anggota Tim Kasie BPD.',
      photo_url: '',
      order: 5,
      is_active: true,
    },
    {
      name: 'Yayan Mulyana, S.Kom',
      position: 'Kasie Pelayanan',
      description: 'Anggota Tim Kasie BPD.',
      photo_url: '',
      order: 6,
      is_active: true,
    },
    {
      name: 'Sri Sumiarisih',
      position: 'Kaur TU & Umum',
      description: 'Anggota Tim Kaur Sekretariat.',
      photo_url: '',
      order: 7,
      is_active: true,
    },
    {
      name: 'Eti Sulastri',
      position: 'Kaur Keuangan',
      description: 'Anggota Tim Kaur Sekretariat.',
      photo_url: '',
      order: 8,
      is_active: true,
    },
    {
      name: 'Ade Kokom Kodariah, Amd',
      position: 'Kaur Perencanaan',
      description: 'Anggota Tim Kaur Sekretariat.',
      photo_url: '',
      order: 9,
      is_active: true,
    },
    {
      name: 'Adis Apriyadi',
      position: 'Kadus Cijambe',
      description: 'Kepala Dusun Cijambe.',
      photo_url: '',
      order: 10,
      is_active: true,
    },
    {
      name: 'Supanta, S.Pd',
      position: 'Kadus Parugpug Kaler',
      description: 'Kepala Dusun Parugpug Kaler.',
      photo_url: '',
      order: 11,
      is_active: true,
    },
    {
      name: 'Dian Hermana',
      position: 'Kadus Parugpug Kidul',
      description: 'Kepala Dusun Parugpug Kidul.',
      photo_url: '',
      order: 12,
      is_active: true,
    },
  ];

  console.log('Menulis data struktur organisasi ke Supabase...');
  const { data, error } = await supabase.from('organization_structures').insert(records);

  if (error) {
    console.error('Gagal menyimpan data ke Supabase:', error);
    process.exit(1);
  }

  console.log('Data berhasil disimpan:', data?.length, 'record.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
