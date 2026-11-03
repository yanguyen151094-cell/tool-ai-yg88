/**
 * Gỡ huy hiệu "Powered by Netlify" (và các huy hiệu nền tảng tương tự) do nơi
 * lưu trữ web tự chèn vào cuối trang.
 *
 * Lưu ý hiệu năng: phần này chạy nền liên tục nên chỉ được xử lý đúng những
 * phần tử mới được thêm vào (không quét lại toàn bộ trang), và tự tắt sau một
 * khoảng thời gian ngắn để không làm trang bị ì.
 */

const SELECTORS = [
  '#netlify-badge',
  '[id^="netlify-badge"]',
  '[data-netlify-badge]',
  '.netlify-badge',
  'iframe[src*="netlify"]',
  'a[href*="netlify.com"]',
  'a[href*="netlify.app"]',
  'img[src*="netlify"]',
].join(',');

const BADGE_HINTS = ['powered by netlify', 'deploys by netlify'];

const isAppNode = (el: Element): boolean => {
  const root = document.getElementById('root');
  return !!root && (root === el || root.contains(el));
};

const isBadgeNode = (el: Element): boolean => {
  try {
    if (el.matches(SELECTORS)) return true;
  } catch {
    return false;
  }
  const text = (el.textContent || '').trim().toLowerCase();
  if (!text || text.length > 160) return false;
  return BADGE_HINTS.some((hint) => text.includes(hint));
};

const removeBadge = (el: Element) => {
  if (isAppNode(el)) return;
  if (el === document.body || el === document.documentElement) return;
  el.parentNode?.removeChild(el);
};

const sweep = () => {
  try {
    // Chỉ duyệt các khối trực tiếp ngoài ứng dụng — rất nhẹ so với quét toàn trang
    const containers = [document.body, ...Array.from(document.body.children)];
    containers.forEach((container) => {
      if (isAppNode(container)) return;
      if (isBadgeNode(container)) {
        removeBadge(container);
        return;
      }
      Array.from(container.children).forEach((child) => {
        if (isBadgeNode(child)) removeBadge(child);
      });
    });
  } catch {
    /* bỏ qua mọi lỗi để không ảnh hưởng trang */
  }
};

let observer: MutationObserver | null = null;
let stopTimer = 0;

export function hidePlatformBadge(): void {
  if (typeof window === 'undefined') return;
  if (observer) return;

  const start = () => {
    sweep();

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as Element;
          if (isAppNode(el)) return;
          if (isBadgeNode(el)) removeBadge(el);
        });
      });
    });

    observer.observe(document.body, { childList: true });

    // Quét nhắc lại vài lần đầu, sau đó tự tắt để không ảnh hưởng hiệu năng
    [300, 1000, 2200, 4000].forEach((delay) => {
      window.setTimeout(sweep, delay);
    });

    stopTimer = window.setTimeout(() => {
      observer?.disconnect();
      observer = null;
      sweep();
    }, 8000);

    window.addEventListener('beforeunload', () => {
      observer?.disconnect();
      observer = null;
      window.clearTimeout(stopTimer);
    });
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
}

export default hidePlatformBadge;