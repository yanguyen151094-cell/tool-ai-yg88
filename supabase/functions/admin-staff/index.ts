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
  deposit_url?: string;
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

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail('Du lieu gui len khong hop le.');
  }

  const action = body.action;

  /** Chuan hoa link nap: chi nhan http/https, rong = xoa link. */
  const cleanUrl = (raw: unknown) => {
    const value = String(raw ?? '').trim().slice(0, 500);
    if (!value) return '';
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
      return parsed.toString();
    } catch {
      return null;
    }
  };

  /** Khach dang nhap lay link nap tien cua dai ly minh (hoac mac dinh chu web). */
  if (action === 'resolve_deposit') {
    let url = '';
    const { data: prof } = await db
      .from('profiles')
      .select('agent_id')
      .eq('id', caller.id)
      .maybeSingle();
    const agentId = prof?.agent_id ? String(prof.agent_id) : '';
    if (agentId) {
      const { data: agent } = await db
        .from('admin_users')
        .select('deposit_url')
        .eq('user_id', agentId)
        .maybeSingle();
      url = String(agent?.deposit_url ?? '').trim();
    }
    if (!url) {
      const { data: ownerRow } = await db
        .from('admin_users')
        .select('deposit_url')
        .eq('role', 'owner')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      url = String(ownerRow?.deposit_url ?? '').trim();
    }
    return json({ ok: true, url });
  }

  const { data: me } = await db
    .from('admin_users')
    .select('role, username, can_view_customers, can_scan_bookmakers, ref_code, deposit_url')
    .eq('user_id', caller.id)
    .maybeSingle();
  if (!me) return fail('Tai khoan nay khong co quyen quan tri.');
  const isOwner = me.role === 'owner';
  const staffName = me.username || caller.email?.split('@')[0] || 'nv';

  /**
   * Xac minh mat khau moi bang chinh dich vu dang nhap.
   * Nho vay neu mat khau khong duoc luu dung, quan tri vien biet ngay thay vi bao "thanh cong" gia.
   */
  const verifyPassword = async (email: string, password: string) => {
    if (!email) return { ok: false, message: 'Tai khoan khong co email noi bo.' };
    try {
      const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) return { ok: true, message: '' };
      const payload = (await response.json().catch(() => null)) as
        | { error_description?: string; msg?: string; message?: string }
        | null;
      return {
        ok: false,
        message:
          payload?.error_description || payload?.msg || payload?.message || `HTTP ${response.status}`,
      };
    } catch {
      return { ok: false, message: 'Khong goi duoc dich vu dang nhap de xac minh.' };
    }
  };

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
    if (targetId === caller.id && !isOwner) return fail('Khong the tu cong diem cho chinh minh.');

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
    const { data: authUser } = await db.auth.admin.getUserById(targetId);
    const email = authUser?.user?.email ?? '';
    const { error } = await db.auth.admin.updateUserById(targetId, { password });
    if (error) return fail(error.message);
    const check = await verifyPassword(email, password);
    if (!check.ok) {
      return fail(
        `Da dat mat khau nhung chua xac minh duoc (${check.message}). Anh thu lai giup em.`,
      );
    }
    return json({ ok: true, username: target.username, email });
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

  if (action === 'set_deposit_link') {
    const url = cleanUrl(body.deposit_url);
    if (url === null) return fail('Link nap phai bat dau bang http:// hoac https://.');
    const { error } = await db
      .from('admin_users')
      .update({ deposit_url: url })
      .eq('user_id', caller.id);
    if (error) return fail(error.message);
    return json({ ok: true, deposit_url: url });
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
        deposit_url: me.deposit_url ?? '',
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

  if (action === 'set_staff_deposit') {
    const targetId = String(body.user_id ?? '');
    if (!targetId) return fail('Thieu admin can dat link nap.');
    const url = cleanUrl(body.deposit_url);
    if (url === null) return fail('Link nap phai bat dau bang http:// hoac https://.');
    const { data: target } = await db
      .from('admin_users')
      .select('user_id')
      .eq('user_id', targetId)
      .in('role', ['staff', 'owner'])
      .maybeSingle();
    if (!target) return fail('Khong tim thay admin can dat link nap.');
    const { error } = await db
      .from('admin_users')
      .update({ deposit_url: url })
      .eq('user_id', targetId);
    if (error) return fail(error.message);
    return json({ ok: true, deposit_url: url });
  }

  if (action === 'list_staff') {
    const { data, error } = await db
      .from('admin_users')
      .select(
        'user_id, username, can_view_customers, can_scan_bookmakers, ref_code, deposit_url, created_at',
      )
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
    if (password.length > 72) return fail('Mat khau toi da 72 ky tu.');
    const targetId = String(body.user_id ?? '');
    const { data: target } = await db
      .from('admin_users')
      .select('user_id, email, role')
      .eq('user_id', targetId)
      .in('role', ['staff', 'owner'])
      .maybeSingle();
    if (!target) return fail('Khong tim thay nhan vien.');
    if (target.role === 'owner' && targetId !== caller.id) {
      return fail('Khong the doi mat khau cua chu web khac.');
    }
    const { data: authUser } = await db.auth.admin.getUserById(targetId);
    const email = target.email || authUser?.user?.email || '';
    const { error } = await db.auth.admin.updateUserById(targetId, { password });
    if (error) return fail(error.message);
    const check = await verifyPassword(email, password);
    if (!check.ok) {
      return fail(
        `Da dat mat khau nhung chua xac minh duoc (${check.message}). Anh thu lai giup em.`,
      );
    }
    return json({ ok: true, email });
  }

  if (action === 'delete_staff') {
    const targetId = String(body.user_id ?? '');
    if (!targetId) return fail('Thieu admin can xoa.');
    if (targetId === caller.id) return fail('Khong the xoa chinh tai khoan dang dang nhap.');
    const { data: target } = await db
      .from('admin_users')
      .select('user_id, username, role')
      .eq('user_id', targetId)
      .eq('role', 'staff')
      .maybeSingle();
    if (!target) return fail('Khong tim thay admin can xoa.');

    await db.from('admin_users').delete().eq('user_id', targetId);
    await db.from('coin_transactions').delete().eq('user_id', targetId);
    await db.from('coin_transactions').delete().eq('created_by', targetId);
    await db.from('baccarat_sessions').delete().eq('user_id', targetId);
    await db.from('profiles').delete().eq('id', targetId);
    const { error } = await db.auth.admin.deleteUser(targetId);
    if (error) {
      return fail(`Da thu hoi quyen nhung chua xoa duoc tai khoan dang nhap: ${error.message}`);
    }
    return json({ ok: true, username: target.username });
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
