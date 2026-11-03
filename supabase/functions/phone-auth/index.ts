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

const DOMAIN = 'user.yg88.local';

/** Chuan hoa so dien thoai Viet Nam ve dang 0xxxxxxxxx (10 so). */
const normalizePhone = (raw: string) => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (digits.length === 9) digits = `0${digits}`;
  return digits;
};

const isValidPhone = (digits: string) => /^0\d{9}$/.test(digits);

const usernameSlug = (raw: string) =>
  raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const normalizeTelegram = (raw: string) =>
  raw
    .trim()
    .replace(/^@+/, '')
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '')
    .trim()
    .slice(0, 60);

const isDuplicate = (message: string) => {
  const text = message.toLowerCase();
  return text.includes('already') || text.includes('registered') || text.includes('exists');
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ ok: false, message: 'Phuong thuc khong hop le.' });
  }

  let payload: {
    rawPhone?: string;
    password?: string;
    username?: string;
    telegram?: string;
    ref?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, code: 'bad_request', message: 'Du lieu gui len khong hop le.' });
  }

  const username = String(payload.username ?? '').trim().slice(0, 40);
  const rawPhone = String(payload.rawPhone ?? '').trim();
  const password = String(payload.password ?? '');
  const telegram = normalizeTelegram(String(payload.telegram ?? ''));
  const refCode = String(payload.ref ?? '').trim().slice(0, 32).toLowerCase();

  const slug = usernameSlug(username);
  if (slug.length < 3) {
    return json({
      ok: false,
      code: 'invalid_username',
      message: 'Ten dang nhap can it nhat 3 ky tu chu hoac so.',
    });
  }
  if (password.length < 6) {
    return json({ ok: false, code: 'weak_password', message: 'Mat khau can it nhat 6 ky tu.' });
  }

  const phone = rawPhone ? normalizePhone(rawPhone) : '';
  if (rawPhone && !isValidPhone(phone)) {
    return json({
      ok: false,
      code: 'invalid_phone',
      message: 'So dien thoai khong hop le. Nhap 10 so, vi du 0901234567.',
    });
  }
  if (!phone && !telegram) {
    return json({
      ok: false,
      code: 'missing_contact',
      message: 'Can so dien thoai hoac Telegram de admin lien he duoc voi ban.',
    });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) {
    return json({ ok: false, message: 'Thieu cau hinh may chu.' });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = `${slug}@${DOMAIN}`;

  /** Tim dai ly theo ma link gioi thieu. Khong hop le thi bo qua. */
  let agentId: string | null = null;
  let agentName: string | null = null;
  if (refCode) {
    const { data: agent } = await admin
      .from('admin_users')
      .select('user_id, username, ref_code, role')
      .ilike('ref_code', refCode)
      .limit(1)
      .maybeSingle();
    if (agent) {
      agentId = agent.user_id;
      agentName = agent.username ?? null;
    }
  }

  const { data: nameTaken } = await admin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .limit(1)
    .maybeSingle();

  if (nameTaken) {
    return json({
      ok: false,
      code: 'exists',
      message: 'Ten dang nhap nay da co nguoi dung. Chon ten khac giup minh nhe.',
    });
  }

  if (phone) {
    const { data: phoneTaken } = await admin
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    if (phoneTaken) {
      return json({
        ok: false,
        code: 'exists',
        message: 'So dien thoai nay da duoc dung cho tai khoan khac.',
      });
    }
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      phone: phone || null,
      telegram: telegram || null,
      ref: refCode || null,
    },
  });

  if (createError) {
    if (isDuplicate(createError.message)) {
      return json({
        ok: false,
        code: 'exists',
        message: 'Ten dang nhap nay da co nguoi dung. Chon ten khac giup minh nhe.',
      });
    }
    return json({ ok: false, code: 'server_error', message: createError.message });
  }

  const userId = created?.user?.id;
  if (!userId) {
    return json({ ok: false, code: 'server_error', message: 'Khong tao duoc tai khoan.' });
  }

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: userId,
      email,
      username,
      phone: phone || null,
      telegram: telegram || null,
      agent_id: agentId,
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    return json({ ok: false, code: 'server_error', message: profileError.message });
  }

  return json({
    ok: true,
    email,
    username,
    phone: phone || null,
    telegram: telegram || null,
    agent: agentName,
  });
});
