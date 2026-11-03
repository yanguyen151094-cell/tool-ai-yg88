import {
  baccaratImage,
  baccaratSeeds,
  providerKeys,
  providerLabels,
  slotGamesSeed,
  slotImages,
} from '@/mocks/games';
import { betLevelAt } from '@/lib/betting';
import type { BaccaratTable, SlotGame, SlotStatus } from '@/mocks/games';

const statusOf = (p: number): SlotStatus => {
  if (p >= 85) return 'hot';
  if (p >= 65) return 'stable';
  return 'cold';
};

const stakeOf = (index: number) => betLevelAt(index);

const roomOf = (index: number) =>
  `Phòng ${String((index % 24) + 1).padStart(2, '0')} · cược ${stakeOf(index)}K`;

/** Lấy đúng ảnh riêng của từng game theo tên, game lạ mới dùng ảnh dự phòng. */
export const artOf = (name: string, index: number) => {
  const seed = slotGamesSeed.find(([, seedName]) => seedName === name);
  if (seed) return seed[4];
  return slotImages[index % slotImages.length];
};

export const slotGames: SlotGame[] = slotGamesSeed.map(([code, name, provider, p], index) => ({
  id: code,
  code,
  name,
  provider: providerLabels[provider] ?? provider,
  providerKey: provider,
  p,
  image: artOf(name, index),
  room: roomOf(index),
  heat: p,
  confidence: p,
  payout: `x${p * 13 + (index % 7) * 11}`,
  status: statusOf(p),
  players: 40 + p * 4,
  updated: `${(index % 27) + 1} giây trước`,
}));

const streakOf = (code: string): string[] => {
  let seed = 0;
  for (const char of code) seed += char.charCodeAt(0);
  return Array.from({ length: 8 }, (_, index) => {
    const value = (seed + index * 7) % 9;
    if (value === 4) return 'T';
    return value % 2 === 0 ? 'B' : 'P';
  });
};

export const baccaratTables: BaccaratTable[] = baccaratSeeds.map(
  ([code, name, dealer, predict, confidence, limit], index) => ({
    id: code,
    code,
    name,
    dealer,
    round: `#${48190 + index}`,
    predict,
    confidence,
    streak: streakOf(code),
    players: 90 + confidence * 3,
    limit,
    image: baccaratImage,
  }),
);

export const providerFullName = (key: string) => providerLabels[key] ?? key.toUpperCase();

/**
 * Danh sách nhà phát hành lấy theo dữ liệu thật đang có,
 * nhà phát hành nào chưa có game thì không hiện ra.
 */
export const buildProviderOptions = (games: SlotGame[], allLabel = 'Tất cả') => {
  const counts = new Map<string, number>();
  games.forEach((game) => {
    counts.set(game.providerKey, (counts.get(game.providerKey) ?? 0) + 1);
  });

  const order = providerKeys.filter((key) => counts.has(key));
  const extra = [...counts.keys()].filter((key) => !order.includes(key as never));

  return [
    { key: 'all', label: allLabel, count: games.length },
    ...[...order, ...extra].map((key) => ({
      key,
      label: providerFullName(key),
      count: counts.get(key) ?? 0,
    })),
  ];
};

export { providerKeys };