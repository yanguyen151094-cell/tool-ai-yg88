import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { bookmakers as seedBookmakers } from '@/mocks/bookmakers';

/** Một nhà cái hiển thị trong mục quét mã. */
export type Bookmaker = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  region: string;
  volume: string;
  note: string;
  logoUrl: string;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type BookmakerRow = {
  id: string;
  slug: string | null;
  name: string | null;
  domain: string | null;
  region: string | null;
  volume: string | null;
  note: string | null;
  logo_url: string | null;
  featured: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
};

/** Hướng dẫn kích thước ảnh logo để chủ web chuẩn bị file. */
export const LOGO_SPEC = {
  width: 512,
  height: 512,
  minWidth: 128,
  maxSizeMb: 3,
  ratio: '1:1',
  formats: 'PNG (nền trong suốt) hoặc JPG',
};

const fallbackList: Bookmaker[] = seedBookmakers.map((item, index) => ({
  id: item.id,
  slug: item.id,
  name: item.name,
  domain: item.domain,
  region: item.region,
  volume: item.volume,
  note: item.note,
  logoUrl: '',
  featured: Boolean(item.featured),
  isActive: true,
  sortOrder: index + 1,
}));

export const mapBookmakerRow = (row: BookmakerRow, index: number): Bookmaker => {
  const slug = row.slug ?? row.id;
  return {
    id: row.id,
    slug,
    name: row.name ?? slug,
    domain: row.domain ?? '',
    region: row.region ?? '',
    volume: row.volume ?? '',
    note: row.note ?? '',
    logoUrl: row.logo_url ?? '',
    featured: Boolean(row.featured),
    isActive: row.is_active !== false,
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : index + 1,
  };
};

const SELECT_COLUMNS =
  'id, slug, name, domain, region, volume, note, logo_url, featured, is_active, sort_order';

/** Đọc danh mục nhà cái từ CSDL. */
export async function loadBookmakers(): Promise<Bookmaker[]> {
  const { data, error } = await supabase
    .from('bookmakers')
    .select(SELECT_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as BookmakerRow[];
  if (rows.length === 0) return fallbackList;
  return rows.map((row, index) => mapBookmakerRow(row, index));
}

type State = {
  list: Bookmaker[];
  loading: boolean;
  error: string;
  reload: () => void;
};

/** Hook tải danh mục nhà cái, tự rơi về dữ liệu mẫu nếu CSDL trống. */
export function useBookmakers(): State {
  const [list, setList] = useState<Bookmaker[]>(fallbackList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((prev) => prev + 1), []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const rows = await loadBookmakers();
        if (!active) return;
        setList(rows);
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : 'Không tải được danh mục nhà cái.');
        setList(fallbackList);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [tick]);

  return { list, loading, error, reload };
}

export const activeBookmakers = (list: Bookmaker[]) => list.filter((item) => item.isActive);

/** Sinh slug từ tên nhà cái: "SV 388" → "sv-388". */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);