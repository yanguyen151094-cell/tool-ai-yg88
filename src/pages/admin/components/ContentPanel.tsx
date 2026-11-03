import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { contentDefaults, contentLabels, type ContentRow } from '@/lib/content';
import { uploadMedia } from '@/lib/storage';

type EditableRow = {
  key: string;
  label: string;
  value: string;
  persisted: boolean;
};

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const isImageKey = (key: string) => key.includes('image') || key.includes('banner');

const buildRows = (data: ContentRow[]): EditableRow[] => {
  const map = new Map<string, EditableRow>();
  Object.entries(contentDefaults).forEach(([key, value]) => {
    map.set(key, {
      key,
      label: contentLabels[key] ?? key,
      value,
      persisted: false,
    });
  });
  data.forEach((row) => {
    if (!row.key) return;
    map.set(row.key, {
      key: row.key,
      label: row.label || contentLabels[row.key] || row.key,
      value: row.value ?? '',
      persisted: true,
    });
  });
  return Array.from(map.values());
};

export default function ContentPanel() {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('site_content')
        .select('key, label, value, updated_at')
        .order('key', { ascending: true });
      if (fetchError) throw fetchError;
      setRows(buildRows((data ?? []) as ContentRow[]));
    } catch (caught) {
      setError(messageOf(caught, 'Không tải được nội dung website.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (row) =>
        row.key.toLowerCase().includes(keyword) || row.label.toLowerCase().includes(keyword),
    );
  }, [rows, query]);

  const updateValue = (key: string, value: string) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, value } : row)));
  };

  const handleSave = async (row: EditableRow) => {
    setSavingKey(row.key);
    setError('');
    setNotice('');
    try {
      const { error: saveError } = await supabase.from('site_content').upsert(
        {
          key: row.key,
          label: row.label,
          value: row.value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      );
      if (saveError) throw saveError;
      setRows((prev) =>
        prev.map((item) => (item.key === row.key ? { ...item, persisted: true } : item)),
      );
      setNotice(`Đã lưu “${row.label}”.`);
    } catch (caught) {
      setError(messageOf(caught, 'Lưu nội dung thất bại.'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleUpload = async (row: EditableRow, file: File | undefined) => {
    if (!file) return;
    setUploadingKey(row.key);
    setError('');
    try {
      const url = await uploadMedia(file);
      updateValue(row.key, url);
      const { error: saveError } = await supabase
        .from('site_content')
        .upsert(
          { key: row.key, label: row.label, value: url, updated_at: new Date().toISOString() },
          { onConflict: 'key' },
        );
      if (saveError) throw saveError;
      setRows((prev) =>
        prev.map((item) => (item.key === row.key ? { ...item, persisted: true } : item)),
      );
      setNotice(`Đã cập nhật ảnh cho “${row.label}”.`);
    } catch (caught) {
      setError(messageOf(caught, 'Tải ảnh thất bại.'));
    } finally {
      setUploadingKey(null);
    }
  };

  const handleAdd = async () => {
    const key = newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!key) {
      setError('Cần nhập khoá nội dung (chữ thường, không dấu).');
      return;
    }
    setError('');
    try {
      const { error: insertError } = await supabase.from('site_content').upsert(
        {
          key,
          label: newLabel.trim() || key,
          value: newValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      );
      if (insertError) throw insertError;
      setNewKey('');
      setNewLabel('');
      setNewValue('');
      setNotice('Đã thêm nội dung mới.');
      await load();
    } catch (caught) {
      setError(messageOf(caught, 'Thêm nội dung thất bại.'));
    }
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
            $ content --edit
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">
            Nội dung &amp; hình ảnh
          </h2>
          <p className="mt-1 text-sm text-foreground-500">
            Sửa tiêu đề, mô tả, banner, link liên hệ… thay đổi sẽ hiển thị ngay trên website.
          </p>
        </div>
        <div className="relative w-full md:max-w-xs">
          <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm nội dung..."
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      {notice && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-2">
          <i className="ri-checkbox-circle-line text-[13px] text-primary-500" />
          <p className="font-mono text-[11px] text-primary-500">{notice}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
          <i className="ri-error-warning-line text-[13px] text-accent-500" />
          <p className="font-mono text-[11px] text-accent-500">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border hairline py-16 font-mono text-[12px] text-foreground-500">
          <i className="ri-loader-4-line animate-spin" />
          đang tải nội dung...
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {filtered.map((row) => (
            <div key={row.key} className="rounded-lg border hairline bg-background-100/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-heading text-sm font-semibold text-foreground-950">
                    {row.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-foreground-600">
                    {row.key}
                    {row.persisted ? '' : ' · chưa lưu vào CSDL'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingKey === row.key}
                  onClick={() => handleSave(row)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-500/40 px-3 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10 disabled:opacity-60"
                >
                  <i
                    className={
                      savingKey === row.key ? 'ri-loader-4-line animate-spin' : 'ri-save-3-line'
                    }
                  />
                  lưu
                </button>
              </div>

              <div className="mt-3">
                {row.value.length > 90 || row.key.includes('subtitle') || row.key.includes('about') || row.key.includes('notice') ? (
                  <textarea
                    value={row.value}
                    rows={3}
                    maxLength={1000}
                    onChange={(event) => updateValue(row.key, event.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <input
                    value={row.value}
                    onChange={(event) => updateValue(row.key, event.target.value)}
                    className={inputClass}
                  />
                )}
              </div>

              {isImageKey(row.key) && (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded border hairline bg-background-200/40">
                    {row.value ? (
                      <img
                        src={row.value}
                        alt={row.label}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <i className="ri-image-line text-base text-foreground-600" />
                      </div>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10 sm:w-auto">
                    <i
                      className={
                        uploadingKey === row.key
                          ? 'ri-loader-4-line animate-spin'
                          : 'ri-upload-cloud-2-line'
                      }
                    />
                    tải ảnh mới
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleUpload(row, event.target.files?.[0])}
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-accent-500/25 bg-background-100/50 p-4">
        <p className="font-mono text-[10px] tracking-[0.16em] text-accent-500 uppercase">
          thêm nội dung mới
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <input
            value={newKey}
            onChange={(event) => setNewKey(event.target.value)}
            placeholder="khoá (vd: promo_text)"
            className={inputClass}
          />
          <input
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            placeholder="Tên hiển thị"
            className={inputClass}
          />
          <input
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            placeholder="Giá trị"
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="mt-3 flex cursor-pointer items-center gap-2 rounded-md bg-accent-500 px-4 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:opacity-90"
        >
          <i className="ri-add-line" />
          thêm nội dung
        </button>
      </div>
    </div>
  );
}