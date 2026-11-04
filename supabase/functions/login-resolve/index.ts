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

const USER_DOMAIN = 'user.yg88.local';

const normalizePhone = (raw: string) => {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (digits.length === 9) digits = `0${digits}`;
  return digits;
};

const isValidPhone = (raw: string) => /^0\d{9}$/.test(normalizePhone(raw));

const usernameSlug = (raw: string) =>
  String(raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/**
 * Tim email noi bo de dang nhap tu mot o nhap duy nhat.
 * Chap nhan: email, so dien thoai, ten dang nhap nguoi choi, ten dang nhap admin.
 * Chi tra ve email he thong, khong bao gio tra ve mat khau.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ ok: false, message: 'Phuong thuc khong hop le.' });
  }

  let payload: { account?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, message: 'Du lieu gui len khong hop le.' });
  }

  const account = String(payload.account ?? '').trim();
  if (!account) {
    return json({ ok: false, message: 'Chua nhap tai khoan.' });
  }
  if (account.includes('@')) {
    return json({ ok: true, email: account });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) {
    return json({ ok: false, message: 'Thieu cau hinh may chu.' });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) So dien thoai -> tim ho so co so nay.
  if (isValidPhone(account)) {
    const phone = normalizePhone(account);
    const { data: byPhone } = await admin
      .from('profiles')
      .select('username, email, phone')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    if (byPhone?.email) {
      return json({ ok: true, email: byPhone.email, username: byPhone.username });
    }
  }

  // 2) Ten dang nhap nguoi choi (khong phan biet hoa thuong) -> lay email da luu.
  const { data: byName } = await admin
    .from('profiles')
    .select('username, email')
    .ilike('username', account)
    .limit(1)
    .maybeSingle();
  if (byName?.email) {
    return json({ ok: true, email: byName.email, username: byName.username });
  }

  // 3) Ten dang nhap quan tri -> dung email noi bo cua bang phan quyen.
  //    Buoc nay giup tai khoan admin dang nhap dung ngay lan dau, khong bi thu sai email.
  const { data: byAdmin } = await admin
    .from('admin_users')
    .select('username, email')
    .ilike('username', account)
    .limit(1)
    .maybeSingle();
  if (byAdmin?.email) {
    return json({ ok: true, email: byAdmin.email, username: byAdmin.username });
  }

  // 4) Chua co ho so: doan email nguoi choi theo ten viet thuong.
  return json({ ok: true, email: `${usernameSlug(account)}@${USER_DOMAIN}`, username: null });
});
