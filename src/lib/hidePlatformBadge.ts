/**
 * Gỡ hoàn toàn huy hiệu "Powered by Netlify" (và các huy hiệu nền tảng tương tự)
 * do nơi lưu trữ web tự chèn vào cuối trang.
 *
 * Huy hiệu này được chèn bằng thẻ có style inline !important, nên ẩn bằng CSS
 * không đủ mạnh. Cách chắc chắn nhất là xoá hẳn phần tử khỏi trang.
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

const TEXT_HINTS = ['powered by netlify', 'deploys by netlify', 'netlify'];

const isAppNode = (el: Element): boolean => {
  const root = document.getElementById('root');
  return !!root && (root === el || root.contains(el));
};

const looksLikeBadge = (el: Element): boolean => {
  const text = (el.textContent || '').trim().toLowerCase();
  if (!text || text.length > 160) return false;
  return TEXT_HINTS.some((hint) => text.includes(hint));
};

const remove = (el: Element) => {
  if (isAppNode(el)) return;
  if (el === document.body || el === document.documentElement) return;
  el.parentNode?.removeChild(el);
};

const sweep = () => {
  try {
    document.querySelectorAll(SELECTORS).forEach(remove);

    // Quét thêm các khối nhỏ nằm ngoài ứng dụng mang nội dung huy hiệu
    const candidates = document.body.querySelectorAll('div, a, span, iframe, section, aside');
    candidates.forEach((el) => {
      if (isAppNode(el)) return;
      if (el.childElementCount > 4) return;
      if (looksLikeBadge(el)) remove(el);
    });
  } catch {
    /* bỏ qua mọi lỗi để không ảnh hưởng trang */
  }
};

let observer: MutationObserver | null = null;

export function hidePlatformBadge(): void {
  if (typeof window === 'undefined') return;

  sweep();

  if (observer) return;

  const start = () => {
    sweep();

    observer = new MutationObserver((mutations) => {
      let needsSweep = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as Element;
          if (isAppNode(el)) return;
          needsSweep = true;
        });
      });
      if (needsSweep) sweep();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Quét nhắc lại vài lần trong 10 giây đầu vì huy hiệu có thể chèn rất muộn
    [400, 1200, 2500, 5000, 9000].forEach((delay) => {
      window.setTimeout(sweep, delay);
    });

    window.addEventListener('load', sweep);
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
}

export default hidePlatformBadge;