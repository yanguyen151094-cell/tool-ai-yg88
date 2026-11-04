import { useEffect, useState } from 'react';
import BookmakerLogo from '@/pages/games/components/BookmakerLogo';
import { LOGO_SPEC, type Bookmaker } from '@/lib/bookmakers';
import { uploadMedia } from '@/lib/storage';

type Draft = {
  name: string;
  domain: string;
  region: string;
  volume: string;
  note: string;
  logoUrl: string;
  featured: boolean;
  isActive: boolean;
  sortOrder: string;
};

const toDraft = (item: Bookmaker): Draft => ({
  name: item.name,
  domain: item.domain,
  region: item.region,
  volume: item.volume,
  note: item.note,
  logoUrl: item.logoUrl,
  featured: item.featured,
  isActive: item.isActive,
  sortOrder: String(item.sortOrder),
});

const inputClass =
  'w-full rounded-md border border-background-300/50 bg-background-50/70 px-2.5 py-1.5 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

type Props = {
  item: Bookmaker;
  onSave: (id: string, patch: Partial<Bookmaker>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
};

export default function BookmakerRowEditor({ item, onSave, onDelete, onError, onNotice }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft(item));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(toDraft(item));
  }, [item]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const save = async (patch?: Partial<Bookmaker>) => {
    setSaving(true);
    try {
      await onSave(item.id, {
        name: draft.name.trim() || item.name,
        domain: draft.domain.trim(),
        region: draft.region.trim(),
        volume: draft.volume.trim(),
        note: draft.note.trim(),
        logoUrl: draft.logoUrl,
        featured: draft.featured,
        isActive: draft.isActive,
        sortOrder: Number(draft.sortOrder) || 0,
        ...patch,
      });
      onNotice(`Đã lưu ${draft.name.trim() || item.name}.`);
      setOpen(false);
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Lưu nhà cái thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError('Tệp logo phải là ảnh (PNG, JPG hoặc WEBP).');
      return;
    }
    if (file.size > LOGO_SPEC.maxSizeMb * 1024 * 1024) {
      onError(`Ảnh quá lớn. Vui lòng chọn ảnh dưới ${LOGO_SPEC.maxSizeMb}MB.`);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      set('logoUrl', url);
      setSaving(true);
      await onSave(item.id, { logoUrl: url });
      onNotice(`Đã thay logo cho ${item.name}.`);
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Tải logo thất bại.');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  return (
    <div
      className={`rounded-lg border bg-background-100/50 p-3 ${
        item.featured ? 'border-primary-500/35' : 'hairline'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <BookmakerLogo name={item.name} domain={item.domain} logoUrl={item.logoUrl} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-heading text-[13px] font-bold text-foreground-950">
              {item.name}
            </p>
            {item.featured && (
              <span className="rounded-full border border-primary-500/40 bg-primary-500/15 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.1em] text-primary-500 uppercase">
                ưu tiên
              </span>
            )}
            {!item.isActive && (
              <span className="rounded-full border border-accent-500/40 bg-accent-500/15 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.1em] text-accent-500 uppercase">
                đang ẩn
              </span>
            )}
            {item.logoUrl ? (
              <span className="rounded-full border border-secondary-500/40 bg-secondary-500/10 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.1em] text-secondary-500 uppercase">
                logo riêng
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate font-mono text-[10px] text-foreground-600">
            {item.domain || 'chưa có tên miền'} · {item.region || 'chưa có vùng'} · thứ tự{' '}
            {item.sortOrder}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex cursor-pointer items-center gap-1 rounded border border-primary-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
          >
            <i className={open ? 'ri-arrow-up-s-line' : 'ri-edit-line'} />
            {open ? 'thu gọn' : 'sửa'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex cursor-pointer items-center gap-1 rounded border border-accent-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10"
          >
            <i className="ri-delete-bin-line" />
            xoá
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-2.5 py-2">
          <p className="min-w-0 flex-1 font-mono text-[10px] text-accent-500">
            Xoá hẳn “{item.name}” khỏi danh mục? Thao tác không khôi phục được.
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                await onDelete(item.id);
                onNotice(`Đã xoá ${item.name}.`);
              } catch (caught) {
                onError(caught instanceof Error ? caught.message : 'Xoá thất bại.');
              } finally {
                setConfirmDelete(false);
              }
            }}
            className="cursor-pointer rounded border border-accent-500/50 bg-accent-500/20 px-2.5 py-1 font-mono text-[10px] whitespace-nowrap text-accent-500"
          >
            xoá luôn
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="cursor-pointer rounded border hairline px-2.5 py-1 font-mono text-[10px] whitespace-nowrap text-foreground-400"
          >
            giữ lại
          </button>
        </div>
      )}

      {open && (
        <div className="mt-3 border-t hairline pt-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                tên nhà cái
              </span>
              <input
                value={draft.name}
                onChange={(event) => set('name', event.target.value)}
                className={inputClass}
                placeholder="YG88"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                tên miền
              </span>
              <input
                value={draft.domain}
                onChange={(event) => set('domain', event.target.value)}
                className={inputClass}
                placeholder="yg88.com"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                vùng / node
              </span>
              <input
                value={draft.region}
                onChange={(event) => set('region', event.target.value)}
                className={inputClass}
                placeholder="AP-SG1"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                dòng tiền
              </span>
              <input
                value={draft.volume}
                onChange={(event) => set('volume', event.target.value)}
                className={inputClass}
                placeholder="1.248 tỷ"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                mô tả ngắn
              </span>
              <input
                value={draft.note}
                onChange={(event) => set('note', event.target.value)}
                className={inputClass}
                placeholder="cổng thể thao & casino"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                thứ tự hiển thị
              </span>
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(event) => set('sortOrder', event.target.value)}
                className={inputClass}
                placeholder="1"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-col gap-3 rounded-md border hairline bg-background-50/50 p-2.5 sm:flex-row sm:items-start">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border hairline bg-background-200/40">
              <BookmakerLogo
                name={draft.name || item.name}
                domain={draft.domain}
                logoUrl={draft.logoUrl}
                size="xl"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] text-foreground-500">
                Logo nên là ảnh vuông <b className="text-primary-500">{LOGO_SPEC.width}×{LOGO_SPEC.height}px</b>{' '}
                (tỉ lệ {LOGO_SPEC.ratio}), tối thiểu {LOGO_SPEC.minWidth}×{LOGO_SPEC.minWidth}px,{' '}
                {LOGO_SPEC.formats}, dưới {LOGO_SPEC.maxSizeMb}MB.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 rounded border border-primary-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10">
                  <i className={uploading ? 'ri-loader-4-line animate-spin' : 'ri-upload-cloud-2-line'} />
                  {uploading ? 'đang tải' : 'tải logo lên'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => handleLogo(event.target.files?.[0])}
                  />
                </label>
                {draft.logoUrl && (
                  <button
                    type="button"
                    onClick={() => set('logoUrl', '')}
                    className="flex cursor-pointer items-center gap-1 rounded border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-accent-500"
                  >
                    <i className="ri-eraser-line" />
                    bỏ logo riêng
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => set('featured', !draft.featured)}
              className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap transition-colors ${
                draft.featured
                  ? 'border-primary-500/60 bg-primary-500/15 text-primary-500'
                  : 'border-background-300/50 text-foreground-500 hover:text-foreground-950'
              }`}
            >
              <i className={draft.featured ? 'ri-star-fill' : 'ri-star-line'} />
              nhà cái ưu tiên (có mã code)
            </button>
            <button
              type="button"
              onClick={() => set('isActive', !draft.isActive)}
              className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap transition-colors ${
                draft.isActive
                  ? 'border-secondary-500/50 bg-secondary-500/10 text-secondary-500'
                  : 'border-background-300/50 text-foreground-500 hover:text-foreground-950'
              }`}
            >
              <i className={draft.isActive ? 'ri-eye-line' : 'ri-eye-off-line'} />
              {draft.isActive ? 'đang hiển thị' : 'đang ẩn'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save()}
              className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-md bg-primary-500 px-3.5 py-1.5 font-mono text-[10px] font-bold whitespace-nowrap text-background-50 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-3-line'} />
              lưu thay đổi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}