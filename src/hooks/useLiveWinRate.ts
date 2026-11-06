import { useEffect, useState } from 'react';

/**
 * Tỷ lệ thắng nhảy liên tục trong khoảng min - max.
 * Dùng cho câu thông báo "tỷ lệ thắng hiện đang là ...%" ở kết quả quét nhà cái.
 *
 * - Nhà cái ưu tiên (YG88): min = 80, max = 100.
 * - Nhà cái khác: khung hiển thị 0 - 100 nhưng số chỉ nhảy trong 0 - 20.
 */
export function useLiveWinRate(initial: number, max = 20, interval = 1100, min = 0) {
  const [rate, setRate] = useState(initial);

  useEffect(() => {
    setRate(initial);
  }, [initial]);

  useEffect(() => {
    if (!Number.isFinite(max) || !Number.isFinite(min) || max <= min) return undefined;
    const span = max - min + 1;
    const timer = window.setInterval(() => {
      setRate((previous) => {
        const next = min + Math.floor(Math.random() * span);
        if (next !== previous) return next;
        return min + ((Math.max(previous, min) - min + 3) % span);
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [max, min, interval]);

  return rate;
}