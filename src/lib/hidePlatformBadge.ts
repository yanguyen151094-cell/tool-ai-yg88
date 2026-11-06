/**
 * Gỡ huy hiệu "Powered by Netlify" (và các huy hiệu nền tảng tương tự) do nơi
 * lưu trữ web tự chèn vào cuối trang.
 *
 * Cách làm gồm 3 lớp:
 * 1. Chèn CSS ẩn sẵn theo các thuộc tính hay dùng của huy hiệu (ẩn được cả khi
 *    huy hiệu nằm trong phần tử bọc, kể cả khi được chèn rất muộn).
 * 2. Theo dõi DOM (MutationObserver) ở phạm vi toàn bộ body để bắt huy hiệu vừa
 *    được chèn vào (kể cả bên trong một khối bọc sâu) rồi xoá hẳn.
 * 3. Quét lại có giới hạn nhịp (throttle) để không làm trang bị ì.
 */

const SELECTORS = [
  '#netlify-badge',
  '[id^="netlify-badge"]',
  '[id*="netlify-badge"]',
  '[data-netlify-badge]',
  '.netlify-badge',
  'iframe[src*="netlify"]',
  'a[href*="netlify.com"]',
  'a[href*="netlify.app"]',
  'img[src*="netlify"]',
].join(',');

const BADGE_HINTS = ['powered by netlify', 'deploys by netlify', 'netlify'];

const STYLE_ID = 'hide-platform-badge-style';

const isAppNode = (el: Element): boolean => {
  const root = document.getElementById('root');
  return !!root && (root === el || root.contains(el));
};

const injectCss = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #netlify-badge,
    [id^="netlify-badge"],
    [id*="netlify-badge"],
    [data-netlify-badge],
    .netlify-badge,
    iframe[src*="netlify"],
    a[href*="netlify.com"],
    a[href*="netlify.app"],
    img[src*="netlify"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }
  `;
  (document.head || document.documentElement).appendChild(style);
};

const matchesSelector = (el: Element): boolean => {
  try {
    return el.matches(SELECTORS);
  } catch {
    return false;
  }
};

const looksLikeBadgeByText = (el: Element): boolean => {
  const text = (el.textContent || '').trim().toLowerCase();
  if (!text || text.length > 160) return false;
  return BADGE_HINTS.some((hint) => text.includes(hint));
};

const removeNode = (el: Element) => {
  if (isAppNode(el)) return;
  if (el === document.body || el === document.documentElement) return;
  el.parentNode?.removeChild(el);
};

const cleanWhole = (el: Element) => {
  // Xoá chính nó nếu khớp
  if (matchesSelector(el) || (!isAppNode(el) && looksLikeBadgeByText(el))) {
    removeNode(el);
    return true;
  }
  // Xoá các phần tử con khớp selector (huy hiệu nằm trong khối bọc)
  let touched = false;
  try {
    el.querySelectorAll(SELECTORS).forEach((child) => {
      removeNode(child);
      touched = true;
    });
  } catch {
    /* bỏ qua */
  }
  return touched;
};

const sweep = () => {
  try {
    Array.from(document.body.children).forEach((child) => {
      if (isAppNode(child)) {
        // Trong ứng dụng chỉ xử lý theo selector, không dò theo chữ để tránh xoá nhầm
        child.querySelectorAll(SELECTORS).forEach(removeNode);
        return;
      }
      cleanWhole(child);
    });
  } catch {
    /* bỏ qua mọi lỗi để không ảnh hưởng trang */
  }
};

let observer: MutationObserver | null = null;
let scheduled = 0;
let lastRun = 0;
const MIN_GAP = 120;

const scheduleSweep = () => {
  if (scheduled) return;
  const now = Date.now();
  const wait = Math.max(0, MIN_GAP - (now - lastRun));
  scheduled = window.setTimeout(() => {
    scheduled = 0;
    lastRun = Date.now();
    sweep();
  }, wait);
};

export function hidePlatformBadge(): void {
  if (typeof window === 'undefined') return;
  if (observer) return;

  const start = () => {
    injectCss();
    sweep();

    observer = new MutationObserver((mutations) => {
      let touched = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as Element;
          if (matchesSelector(el)) {
            removeNode(el);
            touched = true;
            return;
          }
          if (!isAppNode(el) && looksLikeBadgeByText(el)) {
            removeNode(el);
            touched = true;
            return;
          }
          if (cleanWhole(el)) touched = true;
        });
      });
      if (touched) scheduleSweep();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Quét nhắc lại vài lần đầu để bắt huy hiệu được chèn theo script trễ
    [200, 600, 1200, 2500, 4000, 7000, 12000].forEach((delay) => {
      window.setTimeout(() => {
        injectCss();
        sweep();
      }, delay);
    });

    window.addEventListener('beforeunload', () => {
      observer?.disconnect();
      observer = null;
      window.clearTimeout(scheduled);
      scheduled = 0;
    });
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
}

export default hidePlatformBadge;