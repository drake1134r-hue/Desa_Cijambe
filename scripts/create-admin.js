const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function main() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const env = {};

  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }

  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const username = 'admin';
  const password = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || 'admin123';

  if (!supabaseUrl) {
    console.error('SUPABASE_URL not found in .env.local or environment');
    process.exit(1);
  }

  if (!supabaseKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local or environment');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error reading users:', selectError);
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);

  if (existingUser) {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash,
        role_id: 1,
        name: 'Administrator',
        email: 'admin@desacijambe.local',
        is_active: true,
        is_system: true,
        updated_at: new Date().toISOString(),
      })
      .eq('username', username);

    if (updateError) {
      console.error('Error updating admin user:', updateError);
      process.exit(1);
    }

    console.log(JSON.stringify({ status: 'updated', username, password }, null, 2));
    return;
  }

  const { error: insertError } = await supabase.from('users').insert({
    role_id: 1,
    name: 'Administrator',
    username,
    email: 'admin@desacijambe.local',
    password_hash,
    phone: null,
    avatar_url: null,
    is_active: true,
    is_system: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error('Error creating admin user:', insertError);
    process.exit(1);
  }

  console.log(JSON.stringify({ status: 'created', username, password }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
