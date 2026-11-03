export type SlotHackTone = 'ok' | 'warn' | 'bad' | 'dim';

export type SlotHackLine = {
  text: string;
  tone?: SlotHackTone;
  kind?: 'cmd' | 'out' | 'hex';
  stage: number;
};

export type SlotStage = { key: string; label: string; note: string };

export const SLOT_STAGES: SlotStage[] = [
  { key: 'handshake', label: 'bắt tay node', note: 'tls 1.3 · 14 cổng' },
  { key: 'mount', label: 'nạp luồng quay', note: '4.812 vòng gần nhất' },
  { key: 'decrypt', label: 'giải mã gói rtp', note: 'aes-256-gcm' },
  { key: 'pattern', label: 'dò nhịp nổ hũ', note: 'pattern engine v9' },
  { key: 'calibrate', label: 'hiệu chỉnh mức cược', note: 'risk buffer 0.12' },
  { key: 'render', label: 'kết xuất tín hiệu', note: 'xuất bảng dự đoán' },
];

export type SlotRoundOutcome = 'win' | 'lose';

export type SlotRoundPrediction = {
  round: number;
  signal: string;
  multiplier: number;
  confidence: number;
  bet: number;
  note: string;
  outcome: SlotRoundOutcome;
};

const seedOf = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 99991, 17);

const pick = <T,>(list: T[], seed: number, index: number): T =>
  list[(seed + index * 37) % list.length];

const WIN_SIGNALS = ['MỞ HŨ LỚN', 'MỞ HŨ NHỎ', 'BUFF FREE SPIN', 'GIỮ NHỊP'];

const LOSE_SIGNALS = ['LỆCH NHỊP', 'TÍN HIỆU YẾU', 'BỎ VÒNG', 'HŨ KHOÁ TẠM'];

const WIN_NOTES = [
  'cầu đang tăng nhiệt · vào tay',
  'hũ vừa trả nhỏ · chờ 1 vòng',
  'cửa sổ thưởng mở · ưu tiên',
  'nhịp ổn định · cược đều',
];

const LOSE_NOTES = [
  'dự đoán lệch · mất cược vòng này',
  'hũ không trả · giữ vốn',
  'máy đổi nhịp · chưa vào',
  'tín hiệu nhiễu · bỏ qua vòng',
];

export const buildSlotPredictions = (
  gameName: string,
  rounds: number,
  betLevel: number,
): SlotRoundPrediction[] => {
  const seed = seedOf(gameName || 'yg88');

  return Array.from({ length: rounds }, (_, index) => {
    const roll = (seed + index * 29 + ((index * index * 17) % 41)) % 100;
    const won = roll < 63;
    const confidence = won
      ? 74 + ((seed + index * 13) % 22)
      : 38 + ((seed + index * 11) % 28);
    const multiplier = won ? Number((1.8 + ((seed + index * 7) % 42) / 10).toFixed(1)) : 0;
    const step = [0, 1, -1, 1, 0][(seed + index) % 5];

    return {
      round: index + 1,
      signal: won ? pick(WIN_SIGNALS, seed, index) : pick(LOSE_SIGNALS, seed, index),
      multiplier,
      confidence,
      bet: Math.max(2, betLevel + step * 4),
      note: won ? pick(WIN_NOTES, seed, index + 3) : pick(LOSE_NOTES, seed, index + 3),
      outcome: won ? 'win' : 'lose',
    };
  });
};

const hexLine = (offset: string, bytes: string, stage: number): SlotHackLine => ({
  kind: 'hex',
  text: `${offset}  ${bytes}`,
  tone: 'dim',
  stage,
});

export const buildSlotHackScript = (input: {
  gameName: string;
  code: string;
  provider: string;
  rtp: number;
  rounds: number;
  betLevel: number;
}): SlotHackLine[] => {
  const seed = seedOf(input.gameName || input.code || 'yg88');
  const packets = 1240 + (seed % 640);
  const merged = `0x${(seed * 13 + 4096).toString(16).toUpperCase()}`;

  return [
    { kind: 'cmd', text: `./yg88-signal-engine --engine slot --room ${input.code || 'auto'}`, stage: 0 },
    { text: 'signal-engine v4.2.1 · license PRO · operator@ap-sg-1', tone: 'dim', stage: 0 },
    { text: `[ok] handshake node-01..14 · tls 1.3 · rtt 12ms`, tone: 'ok', stage: 0 },
    { text: '[ok] xác thực chữ ký gói tin · ed25519 valid', tone: 'ok', stage: 0 },

    { kind: 'cmd', text: `--target "${input.gameName}" --provider ${input.provider || 'unknown'}`, stage: 1 },
    { text: `mount stream · ${input.code || 'room'} · ${packets} gói / 10 phút`, tone: 'dim', stage: 1 },
    { text: 'nạp 4.812 vòng quay gần nhất vào bộ đệm', tone: 'dim', stage: 1 },
    hexLine('0x00f0', '53 49 47 4e 41 4c 2d 45 4e 47 49 4e 45 20 76 34', 1),
    hexLine('0x0100', 'b8 00 00 00 00 0f 05 48 85 c0 74 10 48 8b 05 33', 1),
    { text: `[ok] đọc chỉ số rtp ${input.rtp}% · volatility 4.2`, tone: 'ok', stage: 1 },

    { kind: 'cmd', text: 'decrypt --cipher aes-256-gcm --keyring ./keys/round.bin', stage: 2 },
    { text: `giải mã ${packets} gói · checksum khớp 100%`, tone: 'dim', stage: 2 },
    { text: '[ok] mở bảng hệ số thưởng · 9 dòng thắng', tone: 'ok', stage: 2 },
    { text: `[ok] trích xuất seed máy quay ${merged}`, tone: 'ok', stage: 2 },
    hexLine('0x1a40', '7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00', 2),
    hexLine('0x1a50', '03 00 3e 00 01 00 00 00 80 34 00 00 00 00 00 00', 2),

    { kind: 'cmd', text: 'analyze --mode cluster --window 240', stage: 3 },
    { text: 'phân cụm 8 tổ hợp thắng · loại nhiễu 6%', tone: 'dim', stage: 3 },
    { text: `! phát hiện chu kỳ hũ ngắn · ${180 + (seed % 90)} vòng`, tone: 'warn', stage: 3 },
    { text: '[ok] dò nhịp nổ hũ · khớp 3/4 mẫu lịch sử', tone: 'ok', stage: 3 },
    { text: '[ok] kiểm tra chéo 14 node · sai lệch 0.4%', tone: 'ok', stage: 3 },
    { text: 'đối chiếu mô hình · pattern engine v9 loaded', tone: 'dim', stage: 3 },

    { kind: 'cmd', text: `calibrate --bankroll ${input.betLevel}K --rounds ${input.rounds}`, stage: 4 },
    { text: 'risk buffer 0.12 · stop-loss 1.8 · take-profit 3.4', tone: 'dim', stage: 4 },
    { text: `[ok] chia vốn ${input.rounds} vòng · tối ưu theo rtp`, tone: 'ok', stage: 4 },
    { text: '[ok] mức cược gợi ý đã khoá · an toàn', tone: 'ok', stage: 4 },

    { kind: 'cmd', text: 'render --format table --confirm', stage: 5 },
    { text: 'tổng hợp tín hiệu · tính độ khớp từng vòng', tone: 'dim', stage: 5 },
    { text: '[ok] ước tính tỷ lệ thắng/thua theo từng vòng', tone: 'ok', stage: 5 },
    { text: '[ok] xuất bảng dự đoán · sẵn sàng', tone: 'ok', stage: 5 },
    { text: 'phiên lưu vào hồ sơ · đóng kết nối an toàn', tone: 'dim', stage: 5 },
  ];
};