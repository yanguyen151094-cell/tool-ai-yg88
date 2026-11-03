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

const DEMO_EMAIL = 'demo@yg88.local';
const DEMO_PASSWORD = 'demo123456';
const DEMO_USERNAME = 'demo';

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

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!url || !serviceKey || !anonKey) {
    return json({ ok: false, message: 'Thieu cau hinh may chu.' });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const publicClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: signInError } = await publicClient.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (!signInError) {
    return json({ ok: true, email: DEMO_EMAIL, password: DEMO_PASSWORD, created: false });
  }

  const { error: createError } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { username: DEMO_USERNAME },
  });

  if (!createError) {
    return json({ ok: true, email: DEMO_EMAIL, password: DEMO_PASSWORD, created: true });
  }

  if (!isDuplicate(createError.message)) {
    return json({ ok: false, message: createError.message });
  }

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    return json({ ok: false, message: listError.message });
  }

  const existing = listed?.users?.find(
    (user) => (user.email ?? '').toLowerCase() === DEMO_EMAIL,
  );

  if (!existing) {
    return json({ ok: false, message: 'Khong tim thay tai khoan demo.' });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
    password: DEMO_PASSWORD,
    email_confirm: true,
  });

  if (updateError) {
    return json({ ok: false, message: updateError.message });
  }

  return json({ ok: true, email: DEMO_EMAIL, password: DEMO_PASSWORD, created: false });
});