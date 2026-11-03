import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type ContentMap = Record<string, string>;

export const contentDefaults: ContentMap = {
  brand_name: 'TOOL AI YG88',
  hero_badge: 'realtime · 14 node đang chạy',
  hero_title_prefix: 'AI',
  hero_title_highlight: 'ĐỌC NHỊP',
  hero_title_suffix: 'SÒNG BÀI',
  hero_subtitle:
    'Bảng điều khiển phân tích dữ liệu công khai: nhịp cầu Baccarat, độ nhiễu phòng Nổ hũ và biên lợi nhuận Slot được cập nhật từng vòng. Tất cả chỉ số mang tính tham khảo, không đảm bảo kết quả.',
  hero_cta_primary: 'TRUY CẬP CONSOLE',
  hero_cta_secondary: 'XEM DANH SÁCH GAME',
  hero_bg_image:
    'https://readdy.ai/api/search-image?query=dark%20abstract%20terminal%20grid%20with%20neon%20green%20data%20streams%20flowing%20through%20pure%20black%20space%2C%20matrix%20style%20glowing%20code%20columns%2C%20faint%20wireframe%20geometry%2C%20cinematic%20high%20contrast%2C%20deep%20black%20background%20with%20emerald%20glow%20accents&width=1920&height=1080&seq=gg88-terminal-hero-bg&orientation=landscape',
  games_title: 'Danh sách game đang mở',
  footer_about:
    'Bảng điều khiển phân tích dữ liệu công khai cho Baccarat, Nổ hũ và Slot. Toàn bộ chỉ số mang tính tham khảo, không đảm bảo kết quả và không thay thế quyết định của bạn.',
  footer_copyright: 'Chỉ dành cho người từ 18+ · Giải trí có trách nhiệm',
  contact_telegram: 'https://t.me/',
  contact_facebook: 'https://facebook.com/',
  contact_email: 'hotro@toolaiyg88.com',
  contact_zalo: 'https://zalo.me/',
  contact_hotline: '',
  notice_text:
    'Toàn bộ chỉ số trên bảng là thống kê từ dữ liệu công khai, không dự đoán chính xác kết quả và không đảm bảo lợi nhuận. Hãy chơi có trách nhiệm, chỉ dành cho người từ 18+.',
};

export const contentLabels: Record<string, string> = {
  brand_name: 'Tên thương hiệu',
  hero_badge: 'Nhãn nhỏ trên hero',
  hero_title_prefix: 'Tiêu đề hero — phần đầu',
  hero_title_highlight: 'Tiêu đề hero — phần nổi bật',
  hero_title_suffix: 'Tiêu đề hero — dòng 2',
  hero_subtitle: 'Mô tả dưới tiêu đề',
  hero_cta_primary: 'Nút chính trên hero',
  hero_cta_secondary: 'Nút phụ trên hero',
  hero_bg_image: 'Ảnh nền hero (URL)',
  games_title: 'Tiêu đề trang danh sách game',
  footer_about: 'Giới thiệu ở footer',
  footer_copyright: 'Dòng bản quyền',
  contact_telegram: 'Link Telegram',
  contact_facebook: 'Link Facebook',
  contact_email: 'Email liên hệ',
  contact_zalo: 'Link Zalo',
  contact_hotline: 'Hotline CSKH',
  notice_text: 'Ghi chú cảnh báo cuối trang game',
};

export type ContentRow = {
  key: string;
  label: string | null;
  value: string | null;
  updated_at?: string | null;
};

export function useSiteContent() {
  const [values, setValues] = useState<ContentMap>(contentDefaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const { data, error } = await supabase.from('site_content').select('key, value');
        if (error) throw error;
        if (!active) return;
        const next: ContentMap = { ...contentDefaults };
        (data ?? []).forEach((row) => {
          const key = String((row as ContentRow).key ?? '');
          if (!key) return;
          const value = (row as ContentRow).value;
          next[key] = value ?? '';
        });
        setValues(next);
      } catch {
        if (active) setValues(contentDefaults);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  return { values, loading };
}