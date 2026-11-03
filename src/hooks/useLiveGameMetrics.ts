import { useEffect, useState } from 'react';
import { MAX_BET_LEVEL, betLevelAt } from '@/lib/betting';

/** Tỷ lệ được tính lại sau mỗi 3 phút. */
export const LIVE_REFRESH_MS = 3 * 60 * 1000;
/** Nhịp nhấp nháy nhẹ để người xem thấy bảng số đang chạy liên tục. */
const PULSE_MS = 2500;

type Snapshot = {
  /** Số lần tính lại tỷ lệ (mỗi 3 phút +1). */
  epoch: number;
  /** Số nhịp nhấp nháy nhỏ giữa các lần tính lại. */
  pulse: number;
};

let snapshot: Snapshot = { epoch: 0, pulse: 0 };
let running = false;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const start = () => {
  if (running) return;
  running = true;

  const pulseTimer = window.setInterval(() => {
    snapshot = { epoch: snapshot.epoch, pulse: snapshot.pulse + 1 };
    emit();
  }, PULSE_MS);

  const epochTimer = window.setInterval(() => {
    snapshot = { epoch: snapshot.epoch + 1, pulse: 0 };
    emit();
  }, LIVE_REFRESH_MS);

  const stop = () => {
    window.clearInterval(pulseTimer);
    window.clearInterval(epochTimer);
  };

  window.addEventListener('beforeunload', stop, { once: true });
};

const hashOf = (key: string): number => {
  let hash = 7;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 99991;
  }
  return hash;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

/** Đăng ký nhận nhịp cập nhật dùng chung cho mọi thẻ game. */
export function useLiveMetrics(): Snapshot {
  const [value, setValue] = useState<Snapshot>({ ...snapshot });

  useEffect(() => {
    start();
    const listener = () => setValue({ ...snapshot });
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return value;
}

/** Tỷ lệ % sống của từng game: lệch quanh mốc gốc và đổi mỗi 3 phút. */
export const livePercent = (key: string, base: number, snap: Snapshot): number => {
  const hash = hashOf(key);
  const swing = ((hash + snap.epoch * 37) % 25) - 12;
  const flicker = ((hash + snap.pulse * 11) % 3) - 1;
  return clamp(base + swing + flicker, 45, 99);
};

/** Mức cược (đơn vị K) luôn nhảy đúng trong danh sách mức cược cố định. */
export const liveStake = (key: string, snap: Snapshot): number => {
  const hash = hashOf(key);
  return betLevelAt(hash + snap.epoch * 3);
};

export const formatStake = (stake: number) => `${stake.toLocaleString('vi-VN')}K`;

/** Khung cược hiển thị, ví dụ 20K - 200K. */
export const formatBetRange = (stake: number) =>
  `${stake.toLocaleString('vi-VN')}K - ${MAX_BET_LEVEL.toLocaleString('vi-VN')}K`;

export const livePlayers = (key: string, base: number, snap: Snapshot): number => {
  const hash = hashOf(key);
  return base + ((hash + snap.pulse * 13) % 40) + snap.epoch * 3;
};