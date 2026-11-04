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
  can_scan?: boolean;
  ref_code?: string;
};

/** Sinh ma dai ly tu ten dang nhap: chi chu thuong, so va gach ngang. */
const slugify = (raw: string) =>
  raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);

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
    .select('role, username, can_view_customers, can_scan_bookmakers, ref_code')
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

  /** Kiem tra khach co thuoc quyen quan ly cua nguoi goi hay khong. */
  const loadAllowedCustomer = async (targetId: string) => {
    const { data: target, error: targetError } = await db
      .from('profiles')
      .select('id, username, coins, agent_id')
      .eq('id', targetId)
      .maybeSingle();
    if (targetError) return { target: null, message: targetError.message };
    if (!target) return { target: null, message: 'Khong tim thay khach.' };
    if (!isOwner && target.agent_id !== caller.id) {
      return { target: null, message: 'Khach nay khong thuoc dai ly cua ban.' };
    }
    return { target, message: '' };
  };

  // ---------- Nhan vien + chu web ----------
  if (action === 'lookup') {
    const raw = String(body.query ?? '').trim();
    if (raw.length < 3 || raw.length > 40) return fail('Nhap chinh xac ten dang nhap cua khach.');
    const escaped = raw.replace(/[\\%_]/g, (c) => `\\${c}`);
    let query = db
      .from('profiles')
      .select('id, username, agent_id')
      .ilike('username', escaped)
      .limit(2);
    if (!isOwner) query = query.eq('agent_id', caller.id);
    const { data, error } = await query;
    if (error) return fail(error.message);
    if (!data || data.length === 0) {
      return fail(
        isOwner
          ? 'Khong tim thay khach voi ten dang nhap nay.'
          : 'Khong tim thay khach nay trong danh sach dai ly cua ban.',
      );
    }
    if (data.length > 1) return fail('Co nhieu tai khoan trung ten, hay nhap chinh xac hon.');
    return json({ ok: true, customer: { id: data[0].id, username: data[0].username } });
  }

  if (action === 'list_customers') {
    let query = db
      .from('profiles')
      .select('id, email, username, coins, phone, telegram, agent_id, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (!isOwner) query = query.eq('agent_id', caller.id);
    const { data, error } = await query;
    if (error) return fail(error.message);
    return json({ ok: true, items: data ?? [] });
  }

  if (action === 'customer_history') {
    const targetId = String(body.user_id ?? '');
    if (!targetId) return fail('Thieu khach can xem.');
    const { target, message } = await loadAllowedCustomer(targetId);
    if (!target) return fail(message);
    const { data, error } = await db
      .from('coin_transactions')
      .select('id, amount, note, created_at')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) return fail(error.message);
    return json({ ok: true, items: data ?? [] });
  }

  if (action === 'credit') {
    const targetId = String(body.user_id ?? '');
    const amount = Math.floor(Number(body.amount));
    if (!targetId) return fail('Thieu khach can cong diem.');
    if (!Number.isFinite(amount) || amount <= 0) return fail('So diem phai lon hon 0.');
    if (amount > MAX_CREDIT) return fail('Moi lan chi duoc cong toi da 10.000.000 diem.');
    if (targetId === caller.id) return fail('Khong the tu cong diem cho chinh minh.');

    const { target, message } = await loadAllowedCustomer(targetId);
    if (!target) return fail(message);

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

  if (action === 'reset_customer_password') {
    const targetId = String(body.user_id ?? '');
    const password = String(body.password ?? '');
    if (!targetId) return fail('Thieu khach can cap lai mat khau.');
    if (password.length < 6) return fail('Mat khau can tu 6 ky tu.');
    if (password.length > 72) return fail('Mat khau toi da 72 ky tu.');
    const { target, message } = await loadAllowedCustomer(targetId);
    if (!target) return fail(message);
    const { error } = await db.auth.admin.updateUserById(targetId, { password });
    if (error) return fail(error.message);
    return json({ ok: true, username: target.username });
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

  if (action === 'my_agency') {
    const [{ count: customerCount }, { data: credits }] = await Promise.all([
      db.from('profiles').select('id', { count: 'exact', head: true }).eq('agent_id', caller.id),
      db
        .from('coin_transactions')
        .select('amount')
        .eq('created_by', caller.id)
        .gt('amount', 0)
        .limit(1000),
    ]);
    const totalCredited = (credits ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    return json({
      ok: true,
      agency: {
        username: me.username,
        ref_code: me.ref_code ?? null,
        customer_count: customerCount ?? 0,
        total_credited: totalCredited,
      },
    });
  }

  if (action === 'delete_customer') {
    if (!isOwner) return fail('Chi chu web moi duoc xoa tai khoan khach.');
    const targetId = String(body.user_id ?? '');
    if (!targetId) return fail('Thieu khach can xoa.');
    const { target, message } = await loadAllowedCustomer(targetId);
    if (!target) return fail(message);

    await db.from('coin_transactions').delete().eq('user_id', targetId);
    await db.from('baccarat_sessions').delete().eq('user_id', targetId);
    await db.from('admin_users').delete().eq('user_id', targetId);

    const { error: profileError } = await db.from('profiles').delete().eq('id', targetId);
    if (profileError) return fail(profileError.message);
    const { error: authDeleteError } = await db.auth.admin.deleteUser(targetId);
    if (authDeleteError) return fail(authDeleteError.message);
    return json({ ok: true, username: target.username });
  }

  // ---------- Chi chu web ----------
  if (!isOwner) return fail('Chi chu web moi duoc dung chuc nang nay.');

  const withStats = async (rows: Record<string, unknown>[]) =>
    Promise.all(
      rows.map(async (row) => {
        const agentId = String(row.user_id ?? '');
        const [{ count: customerCount }, { data: credits }] = await Promise.all([
          db.from('profiles').select('id', { count: 'exact', head: true }).eq('agent_id', agentId),
          db
            .from('coin_transactions')
            .select('amount')
            .eq('created_by', agentId)
            .gt('amount', 0)
            .limit(1000),
        ]);
        return {
          ...row,
          customer_count: customerCount ?? 0,
          total_credited: (credits ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
        };
      }),
    );

  if (action === 'list_staff') {
    const { data, error } = await db
      .from('admin_users')
      .select('user_id, username, can_view_customers, can_scan_bookmakers, ref_code, created_at')
      .eq('role', 'staff')
      .order('created_at', { ascending: false });
    if (error) return fail(error.message);
    const items = await withStats((data ?? []) as Record<string, unknown>[]);
    return json({ ok: true, items });
  }

  if (action === 'create_staff') {
    const username = String(body.username ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const rawRef = String(body.ref_code ?? '').trim();
    if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
      return fail(
        'Ten dang nhap 3-24 ky tu: chu thuong khong dau, so, dau cham, gach duoi, gach ngang.',
      );
    }
    if (password.length < 6) return fail('Mat khau can tu 6 ky tu.');

    let refCode = rawRef ? slugify(rawRef) : slugify(username);
    if (refCode.length < 3) refCode = slugify(username);
    if (refCode.length < 3) return fail('Ma dai ly can it nhat 3 ky tu.');
    if (refCode.length > 24) return fail('Ma dai ly toi da 24 ky tu.');

    const { data: refTaken } = await db
      .from('admin_users')
      .select('user_id')
      .ilike('ref_code', refCode)
      .limit(1)
      .maybeSingle();
    if (refTaken) return fail('Ma dai ly nay da co nguoi dung, hay chon ma khac.');

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
      can_view_customers: true,
      can_scan_bookmakers: Boolean(body.can_scan),
      ref_code: refCode,
    });
    if (insertError) {
      await db.auth.admin.deleteUser(created.user.id);
      return fail(insertError.message);
    }
    return json({ ok: true, ref_code: refCode });
  }

  if (action === 'update_ref_code') {
    const targetId = String(body.user_id ?? '');
    const refCode = slugify(String(body.ref_code ?? ''));
    if (refCode.length < 3) return fail('Ma dai ly can it nhat 3 ky tu.');
    if (refCode.length > 24) return fail('Ma dai ly toi da 24 ky tu.');
    const { data: refTaken } = await db
      .from('admin_users')
      .select('user_id')
      .ilike('ref_code', refCode)
      .neq('user_id', targetId)
      .limit(1)
      .maybeSingle();
    if (refTaken) return fail('Ma dai ly nay da co nguoi dung, hay chon ma khac.');
    const { error } = await db
      .from('admin_users')
      .update({ ref_code: refCode })
      .eq('user_id', targetId)
      .eq('role', 'staff');
    if (error) return fail(error.message);
    return json({ ok: true, ref_code: refCode });
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

  if (action === 'set_scan_permission') {
    const { error } = await db
      .from('admin_users')
      .update({ can_scan_bookmakers: Boolean(body.can_scan) })
      .eq('user_id', String(body.user_id ?? ''))
      .eq('role', 'staff');
    if (error) return fail(error.message);
    return json({ ok: true, can_scan_bookmakers: Boolean(body.can_scan) });
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
