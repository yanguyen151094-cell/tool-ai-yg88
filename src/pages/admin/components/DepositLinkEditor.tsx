import { useEffect, useState } from 'react';

type Props = {
  title: string;
  description?: string;
  value: string;
  onSave: (url: string) => Promise<string>;
  compact?: boolean;
};

/**
 * Ô nhập link nạp tiền dùng chung cho chủ web và admin đại lý.
 * Link này là đích đến của nút "Nạp ngay" ở bảng giá và nút "Nạp tiền" cạnh tên người dùng.
 */
export default function DepositLinkEditor({ title, description, value, onSave, compact }: Props) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await onSave(draft.trim());
      setDraft(saved);
      setNotice(saved ? 'Đã lưu link nạp.' : 'Đã xoá link nạp.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Chưa lưu được link nạp.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={
        compact
          ? 'mt-2 rounded-md border hairline bg-background-50/60 p-2.5'
          : 'rounded-lg border border-primary-500/25 bg-background-100/60 p-4'
      }
    >
      <p className="font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
        {title}
      </p>
      {description && (
        <p className="mt-1 font-mono text-[10px] leading-relaxed text-foreground-500">
          {description}
        </p>
      )}

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <i className="ri-link pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-primary-500" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://..."
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            className="w-full rounded-md border border-background-300/50 bg-background-50/70 py-2 pl-8 pr-2.5 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3.5 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
        >
          <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-3-line'} />
          lưu link
        </button>
      </div>

      {notice && (
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-primary-500">
          <i className="ri-checkbox-circle-line" />
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-accent-500">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}
      <p className="mt-2 font-mono text-[9px] leading-relaxed text-foreground-600">
        Để trống nếu muốn tạm tắt: nút nạp sẽ quay về bảng giá. Khách đăng ký qua link đại lý nào thì
        bấm nút nạp sẽ đi tới link của đại lý đó.
      </p>
    </div>
  );
}