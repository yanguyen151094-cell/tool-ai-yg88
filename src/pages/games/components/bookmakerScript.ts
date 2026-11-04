import type { HackLine } from './HackTerminal';

/** Danh sách mã code chuyên nghiệp được chấp nhận khi nhập. */
export const PROFESSIONAL_CODES = ['8', '18', '38', '68', '88', '188', '288', '588'];

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const randomChar = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

/** Một khoá mã trong phiên quét: mã nhập + serial trích xuất + mệnh giá. */
export type VaultCode = {
  code: string;
  serial: string;
  amount: number;
};

/** Mệnh giá cố định của từng mã code (đồng) — theo đúng thang tiền Việt. */
export const CODE_VALUES: Record<string, number> = {
  '8': 8_000,
  '18': 18_000,
  '38': 38_000,
  '68': 68_000,
  '88': 88_000,
  '188': 188_000,
  '288': 288_000,
  '588': 588_000,
};

/** Đổi chỗ + thay ký tự để mỗi khoá có một serial riêng. */
const buildSerial = (base: string, index: number) => {
  const chars = base.split('');
  chars[index % chars.length] = randomChar();
  const shift = (index + 1) % chars.length;
  return chars.map((_, position) => chars[(position + shift) % chars.length]).join('');
};

/**
 * Sinh danh sách 8 khoá mã của một phiên quét.
 * Mệnh giá giữ đúng thang 8K → 588K, serial đổi mới mỗi lần quét phiên.
 */
export const buildVaultSession = (): VaultCode[] => {
  const base = Array.from({ length: 8 }, randomChar).join('');
  return PROFESSIONAL_CODES.map((code, index) => ({
    code,
    serial: buildSerial(base, index),
    amount: CODE_VALUES[code],
  }));
};

const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * Tìm khoá theo mã người dùng nhập: nhận cả mã số (1888) lẫn serial (GY27CM8Z).
 */
export const findVaultCode = (input: string, vault: VaultCode[]): VaultCode | null => {
  const key = normalize(input);
  if (!key) return null;
  return (
    vault.find((item) => normalize(item.serial) === key || normalize(item.code) === key) ?? null
  );
};

export const formatVnd = (value: number) => `${Number(value).toLocaleString('vi-VN')}đ`;

/**
 * Nhà cái thường: mỗi phiên quét lại bốc một tỷ lệ thắng mới trong khoảng 0 - 20%.
 * Luôn khác phiên trước để con số thật sự "nhảy" liên tục.
 */
export const randomVaultRate = (previous: number) => {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const value = Math.floor(Math.random() * 21);
    if (value !== previous) return value;
  }
  return previous >= 20 ? 0 : previous + 1;
};

export const isProfessionalCode = (value: string) =>
  PROFESSIONAL_CODES.includes(normalize(value));

/** Băm chuỗi thành số ổn định để mỗi nhà cái / tài khoản luôn ra cùng kết quả. */
export const hashText = (value: string) => {
  let hash = 2166136261;
  const text = value.toLowerCase();
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
};

/** Lấy năm hoạt động từ dữ liệu quét của nhà cái; thiếu thì suy ra cố định theo tên miền. */
export const foundedYear = (name: string, domain: string) =>
  1996 + (hashText(`${name}|${domain}`) % 26);

/** Nhà cái YG88 — luôn báo tài khoản ở trạng thái bình thường. */
export const isYg88Bookmaker = (name: string, domain: string) => {
  const label = `${name} ${domain}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  return label.includes('yg88');
};

export type AccountTone = 'ok' | 'warn' | 'bad';

export type AccountCheckResult = {
  account: string;
  status: string;
  tone: AccountTone;
  activeDays: number;
  activity: number;
  note: string;
};

const OTHER_STATUS: { status: string; tone: AccountTone; note: string }[] = [
  {
    status: 'đang bị theo dõi',
    tone: 'warn',
    note: 'Tài khoản có chuỗi thắng liên tục nên nhà cái đang để mắt tới.',
  },
  {
    status: 'đang thu hút vốn',
    tone: 'warn',
    note: 'Dòng tiền của tài khoản này vẫn đang bị hút về ví nóng của nhà cái.',
  },
  {
    status: 'tần suất thắng thấp',
    tone: 'bad',
    note: 'Tỷ lệ thắng vài phiên gần đây thấp hơn mức trung bình của nhà cái.',
  },
  {
    status: 'tài khoản mới',
    tone: 'warn',
    note: 'Tài khoản vừa tạo, chưa đủ dữ liệu để chấm điểm ổn định.',
  },
  {
    status: 'hoạt động yếu',
    tone: 'bad',
    note: 'Tài khoản ít phát sinh, nhà cái đang siết hạn mức rút.',
  },
];

/**
 * Tra cứu tên tài khoản tại một nhà cái.
 * Mọi nhà cái đều trả về trạng thái, số ngày hoạt động và mức độ hoạt động;
 * riêng YG88 luôn báo bình thường.
 */
export const checkAccount = (input: {
  account: string;
  name: string;
  domain: string;
}): AccountCheckResult => {
  const account = input.account.trim();
  const seed = hashText(`${input.name}|${input.domain}|${account}`);
  const activeDays = 12 + (seed % 860);
  const activity = 34 + (seed % 61);

  if (isYg88Bookmaker(input.name, input.domain)) {
    return {
      account,
      status: 'bình thường',
      tone: 'ok',
      activeDays,
      activity,
      note: 'Tài khoản đang hoạt động bình thường, không bị giới hạn và không nằm trong diện thu hồi vốn.',
    };
  }

  const picked = OTHER_STATUS[seed % OTHER_STATUS.length];
  return {
    account,
    status: picked.status,
    tone: picked.tone,
    activeDays,
    activity,
    note: picked.note,
  };
};

/** Kịch bản chạy mã của cửa sổ quét nhà cái. */
export const buildBookmakerScript = (input: {
  name: string;
  code: string;
  preferred: boolean;
  winRate: number;
  licenseCodes: string[];
}): HackLine[] => {
  const label = input.name.toUpperCase();
  const head: HackLine[] = [
    { kind: 'cmd', text: `ssh operator@edge-${input.code} -p 2244 -i ~/.toolai/id_ed25519` },
    { text: 'warning: host key added to known_hosts (ed25519)', tone: 'dim' },
    { text: 'session · tls 1.3 · aes-256-gcm · mtu 1460', tone: 'dim' },
    {
      kind: 'cmd',
      text: input.preferred
        ? `./tool-ai-code --target "${label}" --mode license-dump --deep --no-cache`
        : `./tool-ai-code --target "${label}" --mode capital-flow --deep --no-cache`,
    },
    { text: 'loading modules net0 probe1 pkt2 crypto3 brute4 edge5', tone: 'dim' },
    { text: '[+] net0 loaded · 14/14 symbols', tone: 'ok' },
    { text: '[+] probe1 loaded · syscall table hooked', tone: 'ok' },
    { text: '[+] crypto3 loaded · aes-gcm / rsa-4096', tone: 'ok' },
    { text: 'resolving edge endpoints ... 18/18 reachable', tone: 'dim' },
    {
      kind: 'hex',
      text: '0x00f0  4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00',
      tone: 'dim',
    },
    {
      kind: 'hex',
      text: '0x0100  b8 00 00 00 00 0f 05 48 85 c0 74 10 48 8b 05 33',
      tone: 'dim',
    },
    { text: 'mapping process image ... 6 regions / 1.204 segments', tone: 'dim' },
    { text: `target ${input.code} · region ap-sg-1 · rate-limit bypass ok`, tone: 'dim' },
  ];

  if (input.preferred) {
    const codes = input.licenseCodes;
    return [
      ...head,
      { text: '[+] edge5 loaded · vendor bridge attached', tone: 'ok' },
      { text: 'scanning license descriptor table ... 0x2c4 / 0x310', tone: 'dim' },
      { text: 'found vendor license table · 8 khoá hợp lệ', tone: 'ok' },
      { text: 'decrypting key ring · aes-256-gcm · key 0x7bd1 verified', tone: 'ok' },
      { text: `extracting serial keys ... ${codes.length}/${codes.length}`, tone: 'dim' },
      ...codes.map((code) => ({ text: `  ${code}`, tone: 'ok' as const })),
      { text: 'kiểm tra quyền nhập code chuyên nghiệp ... admin hợp lệ', tone: 'dim' },
      { text: '✔ ĐÃ TRÍCH XUẤT MÃ CODE CHUYÊN NGHIỆP', tone: 'ok' },
      { text: `bảng nhập code đã mở cho ${label} · 8 khoá 8K→588K`, tone: 'ok' },
      { text: 'closing socket · session archived', tone: 'dim' },
    ];
  }

  return [
    ...head,
    { text: 'scanning hidden descriptors ... 0x1a4 / 0x1f0', tone: 'dim' },
    { text: 'harvesting liquidity pools ... 24/24 pools', tone: 'dim' },
    { text: '! license descriptor: NOT FOUND', tone: 'warn' },
    { text: '! hidden-code.sys không tồn tại trên edge của nhà cái này', tone: 'warn' },
    { text: '! không có bảng khoá, không có mã code để trích xuất', tone: 'warn' },
    { text: `> trạng thái: ${label} ĐANG THU HÚT VỐN`, tone: 'bad' },
    { text: '> dòng tiền đổ về 4 ví nóng trong 60 giây', tone: 'dim' },
    { text: `> winrate mẫu mỗi phiên: 0% → 20% · phiên này ${input.winRate}%`, tone: 'dim' },
    { text: 'fallback → capital-flow telemetry · conf 68%', tone: 'dim' },
    { text: 'closing socket · session archived', tone: 'dim' },
  ];
};