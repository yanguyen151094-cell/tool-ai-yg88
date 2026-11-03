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

const fail = (message: string) => json({ ok: false, message });

type Body = {
  action?: string;
  user_id?: string;
  password?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return fail('Phuong thuc khong hop le.');

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anonKey || !serviceKey) return fail('Thieu cau hinh may chu.');

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return fail('Chua dang nhap.');

  // Client anon chi dung de xac thuc nguoi goi.
  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return fail('Phien dang nhap khong hop le.');
  const caller = authData.user;

  // Client service-role chi dung cho thao tac du lieu.
  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: me } = await db
    .from('admin_users')
    .select('role')
    .eq('user_id', caller.id)
    .maybeSingle();
  if (!me) return fail('Tai khoan nay khong co quyen quan tri.');
  if (me.role !== 'owner') return fail('Chi chu web moi duoc quan ly tai khoan khach.');

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail('Du lieu gui len khong hop le.');
  }

  const targetId = String(body.user_id ?? '').trim();
  if (!targetId) return fail('Thieu khach can xu ly.');
  if (targetId === caller.id) return fail('Khong the thao tac tren chinh tai khoan cua ban.');

  const { data: targetProfile } = await db
    .from('profiles')
    .select('id, username')
    .eq('id', targetId)
    .maybeSingle();
  if (!targetProfile) return fail('Khong tim thay khach nay trong he thong.');

  const displayName = targetProfile.username || 'khach';

  if (body.action === 'reset_user_password') {
    const password = String(body.password ?? '');
    if (password.length < 6) return fail('Mat khau can tu 6 ky tu tro len.');
    if (password.length > 72) return fail('Mat khau toi da 72 ky tu.');
    const { error } = await db.auth.admin.updateUserById(targetId, { password });
    if (error) return fail(error.message);
    return json({ ok: true, username: displayName });
  }

  if (body.action === 'delete_user') {
    // Khong co khoa ngoai rang buoc nen phai don du lieu lien quan truoc.
    await db.from('coin_transactions').delete().eq('user_id', targetId);
    await db.from('baccarat_sessions').delete().eq('user_id', targetId);
    await db.from('admin_users').delete().eq('user_id', targetId);

    const { error: profileError } = await db.from('profiles').delete().eq('id', targetId);
    if (profileError) return fail(profileError.message);

    const { error: authDeleteError } = await db.auth.admin.deleteUser(targetId);
    if (authDeleteError) return fail(authDeleteError.message);

    return json({ ok: true, username: displayName });
  }

  return fail('Hanh dong khong hop le.');
});