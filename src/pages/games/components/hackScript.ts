import type { HackLine } from './HackTerminal';

const hex = (offset: string, bytes: string): HackLine => ({
  kind: 'hex',
  text: `${offset}  ${bytes}`,
  tone: 'dim',
});

const base = (casino: string, auth: string): HackLine[] => [
  { kind: 'cmd', text: 'ssh operator@node-07 -p 2244 -i ~/.toolai/id_ed25519' },
  { text: 'warning: host key added to known_hosts (ed25519)', tone: 'dim' },
  { text: 'session · tls 1.3 · aes-256-gcm · mtu 1460', tone: 'dim' },
  {
    kind: 'cmd',
    text: `./tool-ai-yg88 --casino "${casino}" --mode hidden-code --auth ${auth}`,
  },
  { text: 'loading modules net0 probe1 pkt2 crypto3 brute4 edge5', tone: 'dim' },
  { text: '[+] net0 loaded · 12/12 symbols', tone: 'ok' },
  { text: '[+] probe1 loaded · syscall table hooked', tone: 'ok' },
  { text: '[+] crypto3 loaded · aes-gcm / rsa-4096', tone: 'ok' },
  { text: 'resolving edge endpoints ... 14/14 reachable', tone: 'dim' },
];

export const buildLockedScript = (
  casino: string,
  account: string,
  room: string,
  winRate = 20,
): HackLine[] => {
  const name = casino.trim() ? casino.trim().toUpperCase() : 'UNKNOWN';
  const auth = account.trim() ? `${account.trim().slice(0, 2)}••••` : '••••';
  const rate = Math.min(29, Math.max(6, Math.round(winRate)));

  return [
    ...base(name, auth),
    hex('0x00f0', '4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00'),
    hex('0x0100', 'b8 00 00 00 00 0f 05 48 85 c0 74 10 48 8b 05 33'),
    hex('0x0110', '48 8d 3d 12 0f 00 00 e8 c4 fe ff ff 31 c0 c3 90'),
    { text: 'mapping process image ... 4 regions / 812 segments', tone: 'dim' },
    { text: `target account ${auth} · room ${room.trim() || 'auto'} · region ap-sg-1`, tone: 'dim' },
    { text: 'scanning hidden descriptors ... 0x1a4 / 0x1f0', tone: 'dim' },
    { text: '! found protected blob hidden-protect.sys (2.1 MB)', tone: 'warn' },
    { text: 'verifying blob signature ... rsassa-pss · valid', tone: 'dim' },
    { text: 'patch offset 0x0004a2c1 → permission denied', tone: 'warn' },
    { text: 'patch offset 0x0004a3f0 → permission denied', tone: 'warn' },
    hex('0x1a40', '7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00'),
    hex('0x1a50', '03 00 3e 00 01 00 00 00 80 34 00 00 00 00 00 00'),
    { text: 'inject dll → yg88_hook.dll ... handle closed', tone: 'warn' },
    { text: 'retry 1/3 · rotating key 0x91f2 ... rejected', tone: 'warn' },
    { text: 'retry 2/3 · rotating key 0xa33c ... rejected', tone: 'warn' },
    { text: 'retry 3/3 · key not in vendor whitelist', tone: 'warn' },
    { text: '403 FORBIDDEN · remote refused signature', tone: 'bad' },
    { text: 'blob integrity check → unchanged (sha256 ok)', tone: 'dim' },
    { text: '⚠ KHÔNG THỂ XÓA MÃ ẨN — hệ thống đã khoá', tone: 'bad' },
    { text: 'fallback → safe mode · conf 71%', tone: 'dim' },
    { text: `kết xuất tín hiệu bàn ${room.trim() || 'tự chọn'} · winrate ${rate}%`, tone: 'dim' },
    { text: 'closing socket · session archived', tone: 'dim' },
  ];
};

export const buildPreferredScript = (
  casino: string,
  account: string,
  room: string,
): HackLine[] => {
  const name = casino.trim() ? casino.trim().toUpperCase() : 'YG88';
  const auth = account.trim() ? `${account.trim().slice(0, 2)}••••` : '••••';

  return [
    ...base(name, auth),
    { text: '[+] edge5 loaded · vendor bridge attached', tone: 'ok' },
    hex('0x00f0', '4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00'),
    hex('0x0100', 'b8 00 00 00 00 0f 05 48 85 c0 74 10 48 8b 05 33'),
    { text: 'mapping process image ... 4 regions / 812 segments', tone: 'dim' },
    { text: `target account ${auth} · room ${room.trim() || 'auto'} · region ap-sg-1`, tone: 'dim' },
    { text: 'scanning hidden descriptors ... 0x1a4 / 0x1f0', tone: 'dim' },
    { text: '! found protected blob hidden-protect.sys (2.1 MB)', tone: 'warn' },
    { text: 'requesting vendor key ... yg88-root.pem', tone: 'dim' },
    { text: 'signature matched · vendor root ca trusted', tone: 'ok' },
    { text: 'override key → YG88-root ... ACCEPTED', tone: 'ok' },
    hex('0x1a40', '7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00'),
    { text: 'unlinking hidden-protect.sys from module table', tone: 'dim' },
    { text: 'decrypt blob → aes-256-gcm · key 0x7bd1 verified', tone: 'ok' },
    { text: 'unlock descriptor table · 0 files locked', tone: 'ok' },
    { text: 'purging edge cache · 14 nodes acknowledged', tone: 'dim' },
    { text: '✔ ĐÃ XÓA MÃ ẨN THÀNH CÔNG', tone: 'ok' },
    { text: 'đồng bộ tín hiệu bàn chơi · winrate 89%', tone: 'ok' },
    { text: `kết xuất tín hiệu bàn ${room.trim() || 'tự chọn'} · conf 94%`, tone: 'dim' },
    { text: 'closing socket · session archived', tone: 'dim' },
  ];
};