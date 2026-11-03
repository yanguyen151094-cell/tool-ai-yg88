import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resetBodyScroll } from '@/hooks/useBodyScrollLock';

/**
 * Mỗi khi đổi trang, gỡ mọi khoá cuộn còn sót lại.
 * Nếu người dùng rời trang trong lúc một cửa sổ đang mở, trang mới sẽ không bị
 * "đơ" (không vuốt lên xuống được).
 */
export default function ScrollLockReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    resetBodyScroll();
  }, [pathname]);

  return null;
}