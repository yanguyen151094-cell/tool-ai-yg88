import type { HackLine } from './HackTerminal';

/** Danh sách mã code chuyên nghiệp được chấp nhận khi nhập. */
export const PROFESSIONAL_CODES = [
  '8',
  '18',
  '38',
  '68',
  '88',
  '188',
  '288',
  '588',
  '1888',
  '3888',
];

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const randomChar = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

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

/**
 * Sinh loạt mã code dạng OZQL1CHF. Mỗi mã trong loạt thay đổi ký tự
 * hoặc thêm mới ký tự so với mã gốc của phiên.
 */
export const buildLicenseCodes = (count = 7): string[] => {
  const base = Array.from({ length: 8 }, randomChar).join('');
  return Array.from({ length: count }, (_, index) => {
    const chars = base.split('');
    const position = (index * 3 + 1) % chars.length;
    if (index % 2 === 0) {
      chars[position] = randomChar();
    } else {
      chars.splice(position, 0, randomChar());
    }
    return chars.join('');
  });
};

const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const isProfessionalCode = (value: string) =>
  PROFESSIONAL_CODES.includes(normalize(value));

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
      { text: 'found vendor license table · 10 khoá hợp lệ', tone: 'ok' },
      { text: 'decrypting key ring · aes-256-gcm · key 0x7bd1 verified', tone: 'ok' },
      { text: `extracting serial keys ... ${codes.length}/${codes.length}`, tone: 'dim' },
      ...codes.map((code) => ({ text: `  ${code}`, tone: 'ok' as const })),
      { text: 'kiểm tra quyền nhập code chuyên nghiệp ... admin hợp lệ', tone: 'dim' },
      { text: '✔ ĐÃ TRÍCH XUẤT MÃ CODE CHUYÊN NGHIỆP', tone: 'ok' },
      { text: `bảng nhập code đã mở cho ${label} · 10 khoá 8→3888`, tone: 'ok' },
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