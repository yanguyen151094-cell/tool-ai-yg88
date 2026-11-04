import { useEffect, useState } from 'react';

/**
 * Tỷ lệ thắng nhảy liên tục trong khoảng 0 - max.
 * Dùng cho câu thông báo "tỷ lệ thắng hiện đang là ...%" ở kết quả quét nhà cái.
 */
export function useLiveWinRate(initial: number, max = 20, interval = 1100) {
  const [rate, setRate] = useState(initial);

  useEffect(() => {
    setRate(initial);
  }, [initial]);

  useEffect(() => {
    if (!Number.isFinite(max) || max <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRate((previous) => {
        const next = Math.floor(Math.random() * (max + 1));
        return next === previous ? (previous + 3) % (max + 1) : next;
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [max, interval]);

  return rate;
}