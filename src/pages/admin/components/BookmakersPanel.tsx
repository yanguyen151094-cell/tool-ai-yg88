import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LOGO_SPEC, mapBookmakerRow, slugify, type Bookmaker, type BookmakerRow } from '@/lib/bookmakers';
import { uploadMedia } from '@/lib/storage';
import BookmakerRowEditor from './BookmakerRowEditor';

const SELECT_COLUMNS =
  'id, slug, name, domain, region, volume, note, logo_url, featured, is_active, sort_order';

const inputClass =
  'w-full rounded-md border border-background-300/50 bg-background-50/70 px-2.5 py-2 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const emptyForm = {
  name: '',
  domain: '',
  region: 'AP-SG1',
  volume: '',
  note: '',
  logoUrl: '',
  featured: false,
};

export default function BookmakersPanel() {
  const [list, setList] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('bookmakers')
        .select(SELECT_COLUMNS)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (fetchError) throw fetchError;
      const rows = (data ?? []) as BookmakerRow[];
      setList(rows.map((row, index) => mapBookmakerRow(row, index)));
    } catch (caught) {
      setError(messageOf(caught, 'Không tải được danh mục nhà cái.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.domain.toLowerCase().includes(keyword) ||
        item.region.toLowerCase().includes(keyword),
    );
  }, [list, query]);

  const saveItem = async (id: string, patch: Partial<Bookmaker>) => {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.domain !== undefined) payload.domain = patch.domain;
    if (patch.region !== undefined) payload.region = patch.region;
    if (patch.volume !== undefined) payload.volume = patch.volume;
    if (patch.note !== undefined) payload.note = patch.note;
    if (patch.logoUrl !== undefined) payload.logo_url = patch.logoUrl;
    if (patch.featured !== undefined) payload.featured = patch.featured;
    if (patch.isActive !== undefined) payload.is_active = patch.isActive;
    if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder;

    const { error: saveError } = await supabase.from('bookmakers').update(payload).eq('id', id);
    if (saveError) throw saveError;
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteItem = async (id: string) => {
    const { error: deleteError } = await supabase.from('bookmakers').delete().eq('id', id);
    if (deleteError) throw deleteError;
    setList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNewLogo = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Tệp logo phải là ảnh (PNG, JPG hoặc WEBP).');
      return;
    }
    if (file.size > LOGO_SPEC.maxSizeMb * 1024 * 1024) {
      setError(`Ảnh quá lớn. Vui lòng chọn ảnh dưới ${LOGO_SPEC.maxSizeMb}MB.`);
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await uploadMedia(file);
      setForm((prev) => ({ ...prev, logoUrl: url }));
      setNotice('Đã tải logo mới lên, bấm “thêm nhà cái” để lưu.');
    } catch (caught) {
      setError(messageOf(caught, 'Tải logo thất bại.'));
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('Cần nhập tên nhà cái.');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const base = slugify(name) || 'bookmaker';
      const exists = list.some((item) => item.slug === base);
      const slug = exists ? `${base}-${Math.random().toString(36).slice(2, 5)}` : base;
      const sortOrder = list.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;

      const { error: insertError } = await supabase.from('bookmakers').insert({
        slug,
        name,
        domain: form.domain.trim(),
        region: form.region.trim() || 'AP-SG1',
        volume: form.volume.trim(),
        note: form.note.trim(),
        logo_url: form.logoUrl,
        featured: form.featured,
        is_active: true,
        sort_order: sortOrder,
      });
      if (insertError) throw insertError;

      setForm(emptyForm);
      setNotice(`Đã thêm nhà cái ${name}.`);
      await load();
    } catch (caught) {
      setError(messageOf(caught, 'Thêm nhà cái thất bại.'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
            $ bookmaker --manage
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">
            Danh mục nhà cái
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-foreground-500">
            Thêm nhà cái mới, thay logo bằng ảnh của anh, sửa tên miền / dòng tiền và đánh dấu nhà
            cái “ưu tiên” để mở khoá bảng mã code.
          </p>
        </div>
        <div className="relative w-full md:max-w-xs">
          <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm nhà cái..."
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-primary-500/25 bg-background-100/50 p-3.5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-primary-500/40 bg-background-50/70">
            <i className="ri-image-2-line text-xl text-primary-500" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-1.5 py-0.5 font-mono text-[8px] whitespace-nowrap text-background-50">
              1:1
            </span>
          </div>
          <div className="font-mono text-[10px] text-foreground-600">
            <p className="text-foreground-400">KÍCH THƯỚC LOGO</p>
            <p className="mt-0.5 text-primary-500">
              {LOGO_SPEC.width} × {LOGO_SPEC.height} px
            </p>
          </div>
        </div>
        <p className="min-w-0 flex-1 font-mono text-[10px] leading-relaxed text-foreground-500">
          Anh chuẩn bị ảnh vuông tỉ lệ <b className="text-foreground-300">1:1</b>, khuyến nghị{' '}
          <b className="text-primary-500">
            {LOGO_SPEC.width}×{LOGO_SPEC.height}px
          </b>{' '}
          (tối thiểu {LOGO_SPEC.minWidth}×{LOGO_SPEC.minWidth}px). Định dạng {LOGO_SPEC.formats}, dung
          lượng dưới {LOGO_SPEC.maxSizeMb}MB. Hệ thống tự thu nhỏ để vừa khung hiển thị nên ảnh vuông
          sẽ không bị méo.
        </p>
      </div>

      {notice && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-2">
          <i className="ri-checkbox-circle-line text-[13px] text-primary-500" />
          <p className="font-mono text-[11px] text-primary-500">{notice}</p>
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
          <i className="ri-error-warning-line text-[13px] text-accent-500" />
          <p className="font-mono text-[11px] text-accent-500">{error}</p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-secondary-500/25 bg-background-100/50 p-3.5">
        <p className="font-mono text-[10px] tracking-[0.16em] text-secondary-500 uppercase">
          thêm nhà cái mới
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Tên nhà cái (vd: SV388)"
            className={inputClass}
          />
          <input
            value={form.domain}
            onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
            placeholder="Tên miền (vd: sv388.com)"
            className={inputClass}
          />
          <input
            value={form.region}
            onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
            placeholder="Vùng / node (vd: AP-SG1)"
            className={inputClass}
          />
          <input
            value={form.volume}
            onChange={(event) => setForm((prev) => ({ ...prev, volume: event.target.value }))}
            placeholder="Dòng tiền (vd: 742 tỷ)"
            className={inputClass}
          />
          <input
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Mô tả ngắn"
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10">
              <i className={uploading ? 'ri-loader-4-line animate-spin' : 'ri-upload-cloud-2-line'} />
              {form.logoUrl ? 'đổi logo' : 'chọn logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => handleNewLogo(event.target.files?.[0])}
              />
            </label>
            {form.logoUrl && (
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded border hairline bg-background-50">
                <img src={form.logoUrl} alt="Logo mới" className="h-full w-full object-contain p-1" />
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, featured: !prev.featured }))}
            className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap transition-colors ${
              form.featured
                ? 'border-primary-500/60 bg-primary-500/15 text-primary-500'
                : 'border-background-300/50 text-foreground-500 hover:text-foreground-950'
            }`}
          >
            <i className={form.featured ? 'ri-star-fill' : 'ri-star-line'} />
            nhà cái ưu tiên (có mã code)
          </button>
          <button
            type="button"
            disabled={adding}
            onClick={handleAdd}
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-secondary-500 px-4 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <i className={adding ? 'ri-loader-4-line animate-spin' : 'ri-add-line'} />
            thêm nhà cái
          </button>
          <span className="font-mono text-[10px] text-foreground-600">
            hoặc bấm “sửa” ở danh sách bên dưới để thay logo nhà cái đã có.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border hairline py-14 font-mono text-[12px] text-foreground-500">
          <i className="ri-loader-4-line animate-spin" />
          đang tải danh mục nhà cái...
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between border-b hairline pb-2">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              danh sách nhà cái
            </p>
            <p className="font-mono text-[10px] text-foreground-600">{filtered.length} nhà cái</p>
          </div>
          {filtered.map((item) => (
            <BookmakerRowEditor
              key={item.id}
              item={item}
              onSave={saveItem}
              onDelete={deleteItem}
              onError={setError}
              onNotice={setNotice}
            />
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border hairline bg-background-100/50 py-12">
              <i className="ri-search-eye-line text-2xl text-foreground-600" />
              <p className="mt-3 font-mono text-[12px] text-foreground-500">
                chưa có nhà cái nào khớp tìm kiếm
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}