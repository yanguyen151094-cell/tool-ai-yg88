import { baccaratSeeds, providerLabels, slotGamesSeed } from '@/mocks/games';
import type { BaccaratTable, SlotGame, SlotStatus } from '@/mocks/games';
import { baccaratImage, slotImages } from '@/mocks/games';
import { artOf } from '@/lib/games';
import { supabase } from '@/lib/supabase';

export type GameKind = 'slot' | 'baccarat';

export type GameRecord = {
  id: string;
  code: string;
  name: string;
  kind: GameKind;
  provider: string;
  p: number;
  image: string;
  description: string;
  room: string;
  dealer: string;
  predict: string;
  bet_limit: string;
  is_active: boolean;
  sort_order: number;
};

export const providerKeyOf = (provider: string): string => {
  const entry = Object.entries(providerLabels).find(([key, label]) => key === provider || label === provider);
  return entry ? entry[0] : provider.toLowerCase().replace(/\s+/g, '').slice(0, 2);
};

const providerFull = (provider: string): string => {
  const key = providerKeyOf(provider);
  return providerLabels[key] ?? provider;
};

const statusOf = (p: number): SlotStatus => {
  if (p >= 85) return 'hot';
  if (p >= 65) return 'stable';
  return 'cold';
};

const streakOf = (code: string): string[] => {
  let seed = 0;
  for (const char of code) seed += char.charCodeAt(0);
  return Array.from({ length: 8 }, (_, index) => {
    const value = (seed + index * 7) % 9;
    if (value === 4) return 'T';
    return value % 2 === 0 ? 'B' : 'P';
  });
};

export const toSlotGame = (row: GameRecord, index: number): SlotGame => ({
  id: row.id ?? row.code,
  code: row.code,
  name: row.name,
  provider: providerFull(row.provider),
  providerKey: providerKeyOf(row.provider),
  p: Number(row.p),
  image: row.image && !slotImages.includes(row.image) ? row.image : artOf(row.name, index),
  room: row.room || `Phòng ${String((index % 24) + 1).padStart(2, '0')}`,
  heat: Number(row.p),
  confidence: Number(row.p),
  payout: `x${Number(row.p) * 13 + (index % 7) * 11}`,
  status: statusOf(Number(row.p)),
  players: 40 + Number(row.p) * 4,
  updated: `${(index % 27) + 1} giây trước`,
});

export const toBaccaratTable = (row: GameRecord, index: number): BaccaratTable => ({
  id: row.id ?? row.code,
  code: row.code,
  name: row.name,
  dealer: row.dealer || 'Dealer',
  round: `#${48190 + index}`,
  predict: (row.predict as BaccaratTable['predict']) || 'BANKER',
  confidence: Number(row.p),
  streak: streakOf(row.code),
  players: 90 + Number(row.p) * 3,
  limit: row.bet_limit || '50K - 20M',
  image: row.image || baccaratImage,
});

export type GamesPayload = {
  slots: SlotGame[];
  tables: BaccaratTable[];
  source: 'db' | 'mock';
};

export async function loadGames(): Promise<GamesPayload> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as GameRecord[];
  if (rows.length === 0) {
    return { slots: [], tables: [], source: 'mock' };
  }

  const slots = rows.filter((row) => row.kind !== 'baccarat').map(toSlotGame);
  const tables = rows.filter((row) => row.kind === 'baccarat').map(toBaccaratTable);
  return { slots, tables, source: 'db' };
}

export type SeedRow = Omit<GameRecord, 'id'>;

export const buildSeedRows = (): SeedRow[] => {
  const slots: SeedRow[] = slotGamesSeed.map(([code, name, provider, p, image], index) => ({
    code,
    name,
    kind: 'slot' as GameKind,
    provider,
    p,
    image,
    description: `Phòng nổ hũ ${name}`,
    room: `Phòng ${String((index % 24) + 1).padStart(2, '0')} · cược ${10 + (index % 9) * 10}K`,
    dealer: '',
    predict: '',
    bet_limit: '',
    is_active: true,
    sort_order: index,
  }));

  const tables: SeedRow[] = baccaratSeeds.map(([code, name, dealer, predict, confidence, limit], index) => ({
    code,
    name,
    kind: 'baccarat' as GameKind,
    provider: 'Live Casino',
    p: confidence,
    image: baccaratImage,
    description: `Bàn baccarat trực tiếp ${name}`,
    room: '',
    dealer,
    predict,
    bet_limit: limit,
    is_active: true,
    sort_order: 1000 + index,
  }));

  return [...slots, ...tables];
};