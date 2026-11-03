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

const DOMAIN = 'admin.local';
const MAX_CREDIT = 10_000_000;

type Body = {
  action?: string;
  query?: string;
  user_id?: string;
  amount?: number;
  note?: string;
  username?: string;
  password?: string;
  can_view?: boolean;
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
    .select('role, username, can_view_customers')
    .eq('user_id', caller.id)
    .maybeSingle();
  if (!me) return fail('Tai khoan nay khong co quyen quan tri.');
  const isOwner = me.role === 'owner';
  const staffName = me.username || caller.email?.split('@')[0] || 'nv';

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail('Du lieu gui len khong hop le.');
  }

  const action = body.action;

  // ---------- Nhan vien + chu web: cong diem ----------
  if (action === 'lookup') {
    const raw = String(body.query ?? '').trim();
    if (raw.length < 3 || raw.length > 40) return fail('Nhap chinh xac ten dang nhap cua khach.');
    const escaped = raw.replace(/[\\%_]/g, (c) => `\\${c}`);
    const { data, error } = await db
      .from('profiles')
      .select('id, username')
      .ilike('username', escaped)
      .limit(2);
    if (error) return fail(error.message);
    if (!data || data.length === 0) return fail('Khong tim thay khach voi ten dang nhap nay.');
    if (data.length > 1) return fail('Co nhieu tai khoan trung ten, hay nhap chinh xac hon.');
    return json({ ok: true, customer: { id: data[0].id, username: data[0].username } });
  }

  if (action === 'credit') {
    const targetId = String(body.user_id ?? '');
    const amount = Math.floor(Number(body.amount));
    if (!targetId) return fail('Thieu khach can cong diem.');
    if (!Number.isFinite(amount) || amount <= 0) return fail('So diem phai lon hon 0.');
    if (amount > MAX_CREDIT) return fail('Moi lan chi duoc cong toi da 10.000.000 diem.');
    if (targetId === caller.id) return fail('Khong the tu cong diem cho chinh minh.');

    const { data: target, error: targetError } = await db
      .from('profiles')
      .select('id, username, coins')
      .eq('id', targetId)
      .maybeSingle();
    if (targetError) return fail(targetError.message);
    if (!target) return fail('Khong tim thay khach.');

    const next = Number(target.coins ?? 0) + amount;
    const { data: updated, error: updateError } = await db
      .from('profiles')
      .update({ coins: next, updated_at: new Date().toISOString() })
      .eq('id', targetId)
      .eq('coins', target.coins)
      .select('id');
    if (updateError) return fail(updateError.message);
    if (!updated || updated.length === 0) return fail('Du lieu vua thay doi, thu lai giup em.');

    const note = String(body.note ?? '').trim().slice(0, 120);
    const { error: txError } = await db.from('coin_transactions').insert({
      user_id: targetId,
      amount,
      note: `[${staffName}] ${note || 'Cong diem'}`,
      created_by: caller.id,
    });
    if (txError) return fail(txError.message);

    return json({ ok: true, username: target.username, amount });
  }

  if (action === 'my_history') {
    const { data, error } = await db
      .from('coin_transactions')
      .select('id, amount, note, created_at')
      .eq('created_by', caller.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) return fail(error.message);
    return json({ ok: true, items: data ?? [] });
  }

  // ---------- Chi chu web ----------
  if (!isOwner) return fail('Chi chu web moi duoc dung chuc nang nay.');

  if (action === 'list_staff') {
    const { data, error } = await db
      .from('admin_users')
      .select('user_id, username, can_view_customers, created_at')
      .eq('role', 'staff')
      .order('created_at', { ascending: false });
    if (error) return fail(error.message);
    return json({ ok: true, items: data ?? [] });
  }

  if (action === 'create_staff') {
    const username = String(body.username ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
      return fail('Ten dang nhap 3-24 ky tu: chu thuong khong dau, so, dau cham, gach duoi, gach ngang.');
    }
    if (password.length < 6) return fail('Mat khau can tu 6 ky tu.');

    const email = `${username}@${DOMAIN}`;
    const { data: created, error: createError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });
    if (createError || !created.user) {
      const msg = (createError?.message ?? '').toLowerCase();
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        return fail('Ten dang nhap nay da co nguoi dung, hay chon ten khac.');
      }
      return fail(createError?.message ?? 'Khong tao duoc tai khoan.');
    }

    const { error: insertError } = await db.from('admin_users').insert({
      user_id: created.user.id,
      email,
      username,
      role: 'staff',
      can_view_customers: Boolean(body.can_view),
    });
    if (insertError) {
      await db.auth.admin.deleteUser(created.user.id);
      return fail(insertError.message);
    }
    return json({ ok: true });
  }

  if (action === 'set_view') {
    const { error } = await db
      .from('admin_users')
      .update({ can_view_customers: Boolean(body.can_view) })
      .eq('user_id', String(body.user_id ?? ''))
      .eq('role', 'staff');
    if (error) return fail(error.message);
    return json({ ok: true });
  }

  if (action === 'reset_password') {
    const password = String(body.password ?? '');
    if (password.length < 6) return fail('Mat khau can tu 6 ky tu.');
    const targetId = String(body.user_id ?? '');
    const { data: target } = await db
      .from('admin_users')
      .select('user_id')
      .eq('user_id', targetId)
      .eq('role', 'staff')
      .maybeSingle();
    if (!target) return fail('Khong tim thay nhan vien.');
    const { error } = await db.auth.admin.updateUserById(targetId, { password });
    if (error) return fail(error.message);
    return json({ ok: true });
  }

  if (action === 'remove_staff') {
    const targetId = String(body.user_id ?? '');
    const { data: target } = await db
      .from('admin_users')
      .select('user_id')
      .eq('user_id', targetId)
      .eq('role', 'staff')
      .maybeSingle();
    if (!target) return fail('Khong tim thay nhan vien.');
    const { error } = await db.from('admin_users').delete().eq('user_id', targetId);
    if (error) return fail(error.message);
    await db.auth.admin.updateUserById(targetId, { ban_duration: '876000h' });
    return json({ ok: true });
  }

  return fail('Hanh dong khong hop le.');
});
