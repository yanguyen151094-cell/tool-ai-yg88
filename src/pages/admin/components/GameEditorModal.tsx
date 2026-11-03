import { useState } from 'react';
import type { GameKind } from '@/lib/gamesRepo';
import { uploadMedia } from '@/lib/storage';

export type GameDraft = {
  id?: string;
  code: string;
  name: string;
  kind: GameKind;
  provider: string;
  p: number;
  image: string;
  description: string;
  room: string;
  dealer: string;
  predict: string;
  bet_limit: string;
  is_active: boolean;
  sort_order: number;
};

export const emptyDraft: GameDraft = {
  code: '',
  name: '',
  kind: 'slot',
  provider: 'pg',
  p: 70,
  image: '',
  description: '',
  room: '',
  dealer: '',
  predict: 'BANKER',
  bet_limit: '',
  is_active: true,
  sort_order: 0,
};

const providerChoices = [
  { value: 'pg', label: 'PG Soft' },
  { value: 'jl', label: 'Jili' },
  { value: 'pr', label: 'Pragmatic' },
  { value: 'fc', label: 'FaChai' },
  { value: 'cq', label: 'CQ9' },
  { value: 'live', label: 'Live Casino' },
];

type Props = {
  initial: GameDraft;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (draft: GameDraft) => void;
};

export default function GameEditorModal({ initial, saving, error, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<GameDraft>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const patch = (patchValue: Partial<GameDraft>) => setDraft((prev) => ({ ...prev, ...patchValue }));

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      patch({ image: url });
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : 'Tải ảnh thất bại.');
    } finally {
      setUploading(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background-950/70 p-4 backdrop-blur-sm md:p-8">
      <div className="w-full max-w-2xl rounded-lg border hairline bg-background-100">
        <div className="flex items-center justify-between border-b hairline px-5 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
              {draft.id ? 'sửa game' : 'thêm game mới'}
            </p>
            <h3 className="mt-1 font-heading text-base font-bold text-foreground-950">
              {draft.id ? draft.name || 'Cập nhật thông tin game' : 'Tạo phòng game'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border hairline text-foreground-400 transition-colors hover:text-accent-500"
            aria-label="Đóng"
          >
            <i className="ri-close-line text-base" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Mã game *
            </label>
            <input
              value={draft.code}
              onChange={(event) => patch({ code: event.target.value.toUpperCase() })}
              placeholder="BN6101"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Tên game *
            </label>
            <input
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="Mahjong Ways 2"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Loại game
            </label>
            <select
              value={draft.kind}
              onChange={(event) => patch({ kind: event.target.value as GameKind })}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="slot" className="bg-background-100">
                Nổ hũ / Slot
              </option>
              <option value="baccarat" className="bg-background-100">
                Baccarat trực tiếp
              </option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Nhà phát hành
            </label>
            <select
              value={draft.provider}
              onChange={(event) => patch({ provider: event.target.value })}
              className={`${inputClass} cursor-pointer`}
            >
              {providerChoices.map((choice) => (
                <option key={choice.value} value={choice.value} className="bg-background-100">
                  {choice.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Chỉ số P (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={draft.p}
              onChange={(event) => patch({ p: Number(event.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              value={draft.sort_order}
              onChange={(event) => patch({ sort_order: Number(event.target.value) })}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Ảnh game (dán link hoặc tải lên)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={draft.image}
                onChange={(event) => patch({ image: event.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10">
                <i className={uploading ? 'ri-loader-4-line animate-spin' : 'ri-upload-cloud-2-line'} />
                {uploading ? 'đang tải' : 'tải ảnh'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
              </label>
            </div>
            {uploadError && (
              <p className="mt-1.5 font-mono text-[10px] text-accent-500">{uploadError}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              Mô tả ngắn
            </label>
            <textarea
              value={draft.description}
              maxLength={500}
              onChange={(event) => patch({ description: event.target.value })}
              rows={2}
              className={inputClass}
            />
          </div>

          {draft.kind === 'slot' ? (
            <div className="md:col-span-2">
              <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                Phòng / mức cược hiển thị
              </label>
              <input
                value={draft.room}
                onChange={(event) => patch({ room: event.target.value })}
                placeholder="Phòng 01 · cược 10K"
                className={inputClass}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                  Tên dealer
                </label>
                <input
                  value={draft.dealer}
                  onChange={(event) => patch({ dealer: event.target.value })}
                  placeholder="Dealer Linh"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                  Dự đoán
                </label>
                <select
                  value={draft.predict}
                  onChange={(event) => patch({ predict: event.target.value })}
                  className={`${inputClass} cursor-pointer`}
                >
                  {['BANKER', 'PLAYER', 'TIE'].map((option) => (
                    <option key={option} value={option} className="bg-background-100">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                  Giới hạn cược
                </label>
                <input
                  value={draft.bet_limit}
                  onChange={(event) => patch({ bet_limit: event.target.value })}
                  placeholder="50K - 20M"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <label className="flex cursor-pointer items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) => patch({ is_active: event.target.checked })}
              className="h-4 w-4 cursor-pointer accent-primary-500"
            />
            <span className="font-mono text-[11px] text-foreground-300">
              Hiển thị game này trên website
            </span>
          </label>

          {error && (
            <p className="font-mono text-[11px] text-accent-500 md:col-span-2">{error}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t hairline px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border hairline px-4 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:text-foreground-950"
          >
            huỷ
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave(draft)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-5 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
          >
            {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-3-line" />}
            lưu game
          </button>
        </div>
      </div>
    </div>
  );
}