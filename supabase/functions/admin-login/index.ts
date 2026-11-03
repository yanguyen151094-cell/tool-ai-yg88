import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const DOMAIN = 'admin.local';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ ok: false, message: 'Phuong thuc khong hop le.' });
  }

  let payload: { username?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, message: 'Du lieu gui len khong hop le.' });
  }

  const username = String(payload.username ?? '').trim().toLowerCase();
  const password = String(payload.password ?? '');

  if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
    return json({
      ok: false,
      message:
        'Ten dang nhap 3-24 ky tu: chi chu thuong khong dau, so, dau cham, gach duoi hoac gach ngang.',
    });
  }
  if (password.length < 6) {
    return json({ ok: false, message: 'Mat khau can tu 6 ky tu.' });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) {
    return json({ ok: false, message: 'Thieu cau hinh may chu quan tri.' });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = `${username}@${DOMAIN}`;

  const { count } = await admin
    .from('admin_users')
    .select('user_id', { count: 'exact', head: true });
  const adminCount = count ?? 0;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createError) {
    const message = createError.message.toLowerCase();
    const exists =
      message.includes('already') || message.includes('registered') || message.includes('exists');
    if (exists) {
      return json({ ok: true, email, created: false });
    }
    return json({ ok: false, message: createError.message });
  }

  if (created?.user && adminCount === 0) {
    await admin.from('admin_users').insert({ user_id: created.user.id });
  }

  return json({ ok: true, email, created: true });
});
