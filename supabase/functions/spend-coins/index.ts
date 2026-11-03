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

/** Chi cho phep cac muc phi co dinh cua he thong. */
const ALLOWED_AMOUNTS = new Set([5, 10, 20, 30, 50, 100]);

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

  let body: { amount?: number; note?: string };
  try {
    body = await req.json();
  } catch {
    return fail('Du lieu gui len khong hop le.');
  }

  const amount = Math.round(Number(body.amount ?? 0));
  if (!Number.isFinite(amount) || !ALLOWED_AMOUNTS.has(amount)) {
    return fail('Muc phi khong hop le.');
  }

  const note = String(body.note ?? '').slice(0, 160) || 'Phi phien phan tich';

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('id, coins')
    .eq('id', caller.id)
    .maybeSingle();

  if (profileError) return fail(profileError.message);
  if (!profile) return fail('Khong tim thay ho so nguoi choi.');

  const current = Number(profile.coins ?? 0);
  if (current < amount) {
    return json({
      ok: false,
      code: 'INSUFFICIENT',
      coins: current,
      message: 'Ban da het coin. Nap them de tiep tuc.',
    });
  }

  const next = current - amount;
  const { error: updateError } = await db
    .from('profiles')
    .update({ coins: next, updated_at: new Date().toISOString() })
    .eq('id', caller.id);

  if (updateError) return fail(updateError.message);

  const { error: txError } = await db.from('coin_transactions').insert({
    user_id: caller.id,
    amount: -amount,
    note,
  });

  if (txError) return fail(txError.message);

  return json({ ok: true, coins: next, spent: amount });
});
