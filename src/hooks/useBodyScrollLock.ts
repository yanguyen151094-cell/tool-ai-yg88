import { useEffect } from 'react';

/**
 * Khoá cuộn trang dùng chung.
 *
 * Trước đây mỗi cửa sổ tự lưu/khôi phục overflow riêng. Khi hai cửa sổ mở chồng
 * lên nhau (chi tiết game + cửa sổ hack), mỗi lần trang vẽ lại thì giá trị được
 * lưu lại có thể là "hidden" của cửa sổ kia, dẫn tới việc trang bị khoá cuộn
 * vĩnh viễn sau khi đóng. Dùng bộ đếm chung sẽ tránh được hoàn toàn lỗi này.
 */

let lockCount = 0;
let savedOverflow = '';

const applyLock = () => {
  if (typeof document === 'undefined') return;
  savedOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
};

const applyUnlock = () => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = savedOverflow;
  savedOverflow = '';
};

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) applyLock();
  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) applyUnlock();
}

/** Gỡ toàn bộ khoá — dùng khi đổi trang để chắc chắn trang luôn cuộn được. */
export function resetBodyScroll(): void {
  if (typeof document === 'undefined') return;
  lockCount = 0;
  savedOverflow = '';
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  document.body.style.position = '';
}

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [active]);
}

export default useBodyScrollLock;