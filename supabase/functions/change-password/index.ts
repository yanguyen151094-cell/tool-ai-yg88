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

/** Dang nhap thu bang email + mat khau de xac minh mat khau that su dung. */
const trySignIn = async (url: string, anonKey: string, email: string, password: string) => {
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
    return { ok: false, message: 'Khong goi duoc dich vu dang nhap.' };
  }
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

  let body: { current_password?: string; new_password?: string };
  try {
    body = await req.json();
  } catch {
    return fail('Du lieu gui len khong hop le.');
  }

  const currentPassword = String(body.current_password ?? '');
  const newPassword = String(body.new_password ?? '');
  const email = caller.email ?? '';

  if (!email) return fail('Tai khoan nay khong co email noi bo de doi mat khau.');
  if (currentPassword.length < 6) return fail('Anh nhap mat khau hien tai giup em.');
  if (newPassword.length < 6) return fail('Mat khau moi can it nhat 6 ky tu.');
  if (newPassword.length > 72) return fail('Mat khau moi toi da 72 ky tu.');
  if (currentPassword === newPassword) {
    return fail('Mat khau moi phai khac mat khau hien tai.');
  }

  const currentCheck = await trySignIn(url, anonKey, email, currentPassword);
  if (!currentCheck.ok) {
    const lower = currentCheck.message.toLowerCase();
    if (lower.includes('invalid') || lower.includes('credentials')) {
      return fail('Mat khau hien tai chua dung. Anh kiem tra lai giup em.');
    }
    return fail(`Khong xac minh duoc mat khau hien tai (${currentCheck.message}).`);
  }

  // Client service-role chi dung cho thao tac cap nhat mat khau.
  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: updateError } = await db.auth.admin.updateUserById(caller.id, {
    password: newPassword,
  });
  if (updateError) return fail(updateError.message);

  const newCheck = await trySignIn(url, anonKey, email, newPassword);
  if (!newCheck.ok) {
    return fail(`Da dat mat khau moi nhung chua xac minh duoc (${newCheck.message}).`);
  }

  return json({ ok: true, email });
});