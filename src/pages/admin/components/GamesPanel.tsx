import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { buildSeedRows, type GameKind, type GameRecord } from '@/lib/gamesRepo';
import GameEditorModal, { emptyDraft, type GameDraft } from './GameEditorModal';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function GamesPanel() {
  const [rows, setRows] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | GameKind>('all');
  const [draft, setDraft] = useState<GameDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [autoSeeded, setAutoSeeded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .order('kind', { ascending: true })
        .order('sort_order', { ascending: true });
      if (fetchError) throw fetchError;
      setRows((data ?? []) as GameRecord[]);
    } catch (caught) {
      setError(messageOf(caught, 'Không tải được danh sách game.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || autoSeeded) return;
    setAutoSeeded(true);
    if (rows.length === 0) {
      handleSeed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, rows.length, autoSeeded]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchKind = kind === 'all' || row.kind === kind;
      const matchKeyword =
        !keyword ||
        row.name.toLowerCase().includes(keyword) ||
        row.code.toLowerCase().includes(keyword);
      return matchKind && matchKeyword;
    });
  }, [rows, query, kind]);

  const handleSave = async (value: GameDraft) => {
    setSaveError('');
    if (!value.code.trim() || !value.name.trim()) {
      setSaveError('Cần nhập mã game và tên game.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: value.code.trim().toUpperCase(),
        name: value.name.trim(),
        kind: value.kind,
        provider: value.provider,
        p: Number.isFinite(value.p) ? Math.min(100, Math.max(0, value.p)) : 60,
        image: value.image.trim(),
        description: value.description.trim(),
        room: value.room.trim(),
        dealer: value.dealer.trim(),
        predict: value.predict,
        bet_limit: value.bet_limit.trim(),
        is_active: value.is_active,
        sort_order: Number.isFinite(value.sort_order) ? value.sort_order : 0,
        updated_at: new Date().toISOString(),
      };

      if (value.id) {
        const { error: updateError } = await supabase.from('games').update(payload).eq('id', value.id);
        if (updateError) throw updateError;
        setNotice(`Đã cập nhật game ${payload.code}.`);
      } else {
        const { error: insertError } = await supabase.from('games').insert(payload);
        if (insertError) throw insertError;
        setNotice(`Đã thêm game ${payload.code}.`);
      }
      setDraft(null);
      await load();
    } catch (caught) {
      setSaveError(messageOf(caught, 'Lưu game thất bại.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      const { error: deleteError } = await supabase.from('games').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setPendingDelete(null);
      setNotice('Đã xoá game khỏi danh sách.');
      await load();
    } catch (caught) {
      setError(messageOf(caught, 'Xoá game thất bại.'));
    }
  };

  const handleToggle = async (row: GameRecord) => {
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('games')
        .update({ is_active: !row.is_active })
        .eq('id', row.id);
      if (updateError) throw updateError;
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, is_active: !item.is_active } : item)),
      );
    } catch (caught) {
      setError(messageOf(caught, 'Không đổi được trạng thái game.'));
    }
  };

  const handleSeed = async (silent = false) => {
    setSeeding(true);
    if (!silent) setError('');
    try {
      const seeds = buildSeedRows();
      for (let index = 0; index < seeds.length; index += 60) {
        const chunk = seeds.slice(index, index + 60);
        const { error: seedError } = await supabase
          .from('games')
          .upsert(chunk, { onConflict: 'code', ignoreDuplicates: true });
        if (seedError) throw seedError;
      }
      setNotice(`Đã nạp ${seeds.length} phòng game có sẵn vào cơ sở dữ liệu.`);
      await load();
    } catch (caught) {
      if (!silent) setError(messageOf(caught, 'Nạp dữ liệu mẫu thất bại.'));
    } finally {
      setSeeding(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
            $ games --manage
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">Quản lý game</h2>
          <p className="mt-1 text-sm text-foreground-500">
            Thêm, sửa, ẩn hoặc xoá phòng game hiển thị trên trang danh sách game.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSeed()}
            disabled={seeding}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-accent-500/40 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10 disabled:opacity-60"
          >
            <i className={seeding ? 'ri-loader-4-line animate-spin' : 'ri-database-2-line'} />
            nạp dữ liệu mẫu
          </button>
          <button
            type="button"
            onClick={() => {
              setSaveError('');
              setDraft({ ...emptyDraft, sort_order: rows.length + 1 });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-primary-500 px-4 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
          >
            <i className="ri-add-line" />
            thêm game
          </button>
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

      <div className="mt-5 flex flex-col gap-2 rounded-md border hairline bg-background-100/50 p-2.5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-1 rounded-md bg-background-50/60 p-1">
          {(
            [
              { key: 'all', label: 'tất cả' },
              { key: 'slot', label: 'nổ hũ' },
              { key: 'baccarat', label: 'baccarat' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setKind(tab.key)}
              className={`cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors ${
                kind === tab.key
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-500 hover:text-foreground-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:ml-auto lg:max-w-xs">
          <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm mã hoặc tên game..."
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border hairline">
        <div className="hidden grid-cols-12 gap-3 border-b hairline bg-background-100/70 px-4 py-2.5 font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase md:grid">
          <span className="col-span-1">ảnh</span>
          <span className="col-span-4">game</span>
          <span className="col-span-2">loại</span>
          <span className="col-span-2">nhà phát hành</span>
          <span className="col-span-1">p</span>
          <span className="col-span-2 text-right">thao tác</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 font-mono text-[12px] text-foreground-500">
            <i className="ri-loader-4-line animate-spin" />
            đang tải danh sách game...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <i className="ri-gamepad-line text-2xl text-foreground-600" />
            <p className="mt-3 font-mono text-[12px] text-foreground-500">
              chưa có game nào — bấm “nạp dữ liệu mẫu” để bắt đầu
            </p>
          </div>
        ) : (
          <div className="divide-y divide-background-200/60">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 items-center gap-3 px-4 py-3 transition-colors hover:bg-background-100/40 md:grid-cols-12"
              >
                <div className="hidden h-9 w-14 overflow-hidden rounded border hairline bg-background-200/40 md:col-span-1 md:block">
                  {row.image ? (
                    <img src={row.image} alt={row.name} className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <i className="ri-image-line text-[12px] text-foreground-600" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 md:col-span-4">
                  <p className="truncate font-mono text-[12px] text-foreground-950">{row.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-foreground-600">
                    {row.code}
                    {row.is_active ? '' : ' · đang ẩn'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      row.kind === 'baccarat'
                        ? 'bg-accent-500/15 text-accent-500'
                        : 'bg-primary-500/15 text-primary-500'
                    }`}
                  >
                    {row.kind === 'baccarat' ? 'baccarat' : 'nổ hũ'}
                  </span>
                </div>

                <p className="truncate font-mono text-[11px] text-foreground-500 md:col-span-2">
                  {row.provider || '—'}
                </p>

                <p className="font-mono text-[11px] text-foreground-950 md:col-span-1">
                  {Number(row.p)}%
                </p>

                <div className="flex items-center gap-1 md:col-span-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggle(row)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                    aria-label={row.is_active ? 'Ẩn game' : 'Hiện game'}
                  >
                    <i className={`text-[12px] ${row.is_active ? 'ri-eye-line' : 'ri-eye-off-line'}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSaveError('');
                      setDraft({
                        id: row.id,
                        code: row.code,
                        name: row.name,
                        kind: row.kind,
                        provider: row.provider || 'pg',
                        p: Number(row.p),
                        image: row.image ?? '',
                        description: row.description ?? '',
                        room: row.room ?? '',
                        dealer: row.dealer ?? '',
                        predict: row.predict || 'BANKER',
                        bet_limit: row.bet_limit ?? '',
                        is_active: row.is_active,
                        sort_order: row.sort_order,
                      });
                    }}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                    aria-label="Sửa game"
                  >
                    <i className="ri-edit-line text-[12px]" />
                  </button>
                  {pendingDelete === row.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="cursor-pointer rounded bg-accent-500 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-background-50"
                      >
                        xoá
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(null)}
                        className="cursor-pointer rounded border hairline px-2 py-1 font-mono text-[10px] whitespace-nowrap text-foreground-400"
                      >
                        thôi
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(row.id)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-accent-500"
                      aria-label="Xoá game"
                    >
                      <i className="ri-delete-bin-line text-[12px]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 font-mono text-[10px] text-foreground-600">
        hiển thị {filtered.length} / {rows.length} game
      </p>

      {draft && (
        <GameEditorModal
          initial={draft}
          saving={saving}
          error={saveError}
          onClose={() => setDraft(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}