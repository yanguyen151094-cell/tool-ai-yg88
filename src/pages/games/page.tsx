import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import AiStatusStrip from '@/components/feature/AiStatusStrip';
import ModeSwitch from './components/ModeSwitch';
import SlotCard from './components/SlotCard';
import BaccaratHackPanel from './components/BaccaratHackPanel';
import ScanModal from './components/ScanModal';
import CompareRow from './components/CompareRow';
import GameDetailPanel from './components/GameDetailPanel';
import { baccaratTables, buildProviderOptions, slotGames } from '@/lib/games';
import { loadGames } from '@/lib/gamesRepo';
import { useAuth } from '@/hooks/useAuth';
import { spendCoins } from '@/lib/coins';
import type { BaccaratTable, SlotGame } from '@/mocks/games';

type Mode = 'slot' | 'baccarat';
type ScanTarget = { name: string; kind: Mode } | null;
type DetailState = {
  kind: Mode;
  name: string;
  code: string;
  image: string;
  provider: string;
  meta: string;
  p: number;
} | null;

const PAGE_SIZE = 60;
const HACK_COST = 10;

export default function GamesPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('slot');
  const [provider, setProvider] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [scanTarget, setScanTarget] = useState<ScanTarget>(null);
  const [detail, setDetail] = useState<DetailState>(null);
  const { user: authUser, profile, signOut, refresh } = useAuth();
  const [coins, setCoins] = useState(0);
  const [slots, setSlots] = useState<SlotGame[]>([]);
  const [tables, setTables] = useState<BaccaratTable[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState('');
  const [notice, setNotice] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const displayName = profile?.username || authUser?.email || null;

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const payload = await loadGames();
        if (!active) return;
        setSlots(payload.slots.length > 0 ? payload.slots : slotGames);
        setTables(payload.tables.length > 0 ? payload.tables : baccaratTables);
      } catch (caught) {
        if (!active) return;
        setGamesError(
          caught instanceof Error ? caught.message : 'Không tải được danh sách game.',
        );
        setSlots(slotGames);
        setTables(baccaratTables);
      } finally {
        if (active) setGamesLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (profile) setCoins(Number(profile.coins ?? 0));
    else setCoins(0);
  }, [profile?.id, profile?.coins]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [mode, provider, query]);

  const providerOptions = useMemo(() => buildProviderOptions(slots), [slots]);

  const filteredSlots = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return slots.filter((game) => {
      const matchProvider = provider === 'all' || game.providerKey === provider;
      const matchKeyword =
        !keyword ||
        game.name.toLowerCase().includes(keyword) ||
        game.code.toLowerCase().includes(keyword);
      return matchProvider && matchKeyword;
    });
  }, [provider, query, slots]);

  const compareGames = useMemo(
    () => compareIds.map((id) => slots.find((game) => game.id === id)).filter((item) => !!item),
    [compareIds, slots],
  );

  const requireLogin = () => {
    setNotice('Bạn cần đăng nhập để mở phiên phân tích.');
    window.setTimeout(() => navigate('/login'), 900);
  };

  const handleScan = (name: string, kind: Mode) => {
    if (!authUser) {
      requireLogin();
      return;
    }
    if (coins < HACK_COST) {
      setNotice('Bạn đã hết coin. Nạp thêm để tiếp tục mở phiên phân tích.');
      return;
    }
    setScanTarget({ name, kind });
  };

  const openSlotDetail = (game: SlotGame) => {
    if (compareMode) {
      setCompareIds((prev) => {
        if (prev.includes(game.id)) return prev.filter((item) => item !== game.id);
        if (prev.length >= 3) {
          setNotice('Chỉ so sánh tối đa 3 game cùng lúc.');
          return prev;
        }
        return [...prev, game.id];
      });
      return;
    }
    setDetail({
      kind: 'slot',
      name: game.name,
      code: game.code,
      image: game.image,
      provider: game.provider,
      meta: `# ${game.providerKey.toUpperCase()} · ${game.code} · ${game.room}`,
      p: game.p,
    });
  };

  /** Trừ coin thật trên máy chủ, trả về true nếu trừ thành công. */
  const spend = async (amount: number, note: string) => {
    if (!authUser) {
      requireLogin();
      return false;
    }
    const result = await spendCoins(amount, note);
    if (!result.ok) {
      if (result.coins > 0) setCoins(result.coins);
      setNotice(result.message);
      return false;
    }
    setCoins(result.coins);
    refresh();
    setNotice(`Đã trừ ${amount.toLocaleString('vi-VN')} coin cho phiên phân tích.`);
    return true;
  };

  const handleLogout = async () => {
    await signOut();
    setCoins(0);
    navigate('/login');
  };

  const total = filteredSlots.length;

  const closeDetail = useCallback(() => setDetail(null), []);
  const closeScan = useCallback(() => setScanTarget(null), []);
  const openHackFromDetail = useCallback(() => {
    if (!detail) return;
    handleScan(detail.name, detail.kind);
  }, [detail, coins, authUser]);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <main className="pt-16 md:pt-[72px]">
        <div className="relative overflow-hidden border-b hairline">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 md:py-7 lg:px-10">
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.22em] text-primary-500 uppercase">
                $ list --live
              </p>
              <h1 className="mt-1.5 font-heading text-xl font-bold text-foreground-950 md:text-2xl">
                Danh sách game đang mở
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-md border hairline bg-background-100/70 px-3 py-2 font-mono text-[11px]">
                <i className="ri-copper-coin-line text-accent-500" />
                <span className="text-foreground-600">coin</span>
                <span className="text-foreground-950">{coins.toLocaleString('vi-VN')}</span>
              </div>
              {displayName ? (
                <div className="flex items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-2 font-mono text-[11px]">
                  <i className="ri-user-line text-primary-500" />
                  <span className="max-w-[120px] truncate text-primary-500">{displayName}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-1 cursor-pointer text-foreground-500 transition-colors hover:text-accent-500"
                    aria-label="Đăng xuất"
                  >
                    <i className="ri-logout-box-r-line" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500"
                >
                  <i className="ri-login-box-line" />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>

        <AiStatusStrip sticky />

        {(gamesLoading || gamesError) && (
          <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 lg:px-10">
            {gamesLoading ? (
              <div className="flex items-center gap-2 rounded-md border hairline bg-background-100/60 px-3 py-2 font-mono text-[11px] text-foreground-500">
                <i className="ri-loader-4-line animate-spin" />
                đang tải danh sách game...
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-accent-500/30 bg-accent-500/10 px-3 py-2 font-mono text-[11px] text-accent-500">
                <i className="ri-error-warning-line" />
                {gamesError} — đang hiển thị dữ liệu tạm.
              </div>
            )}
          </div>
        )}

        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:px-10">
          <ModeSwitch
            mode={mode}
            onChange={(next) => setMode(next)}
            slotCount={slots.length}
            baccaratCount={tables.length}
          />

          <div
            className={`mt-3 flex-col gap-2 rounded-md border hairline bg-background-100/50 p-2.5 lg:flex-row lg:items-center ${
              mode === 'slot' ? 'flex' : 'hidden'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCompareMode((prev) => !prev);
                  if (compareMode) setCompareIds([]);
                }}
                className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors ${
                  compareMode
                    ? 'border-primary-500/60 bg-primary-500/15 text-primary-500'
                    : 'border-background-300/50 bg-background-50/60 text-foreground-500 hover:text-foreground-950'
                }`}
              >
                <i className={compareMode ? 'ri-check-line' : 'ri-add-line'} />
                so sánh
              </button>

              <div className="relative">
                <select
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                  aria-label="Chọn nhà phát hành"
                  className="cursor-pointer appearance-none rounded border border-background-300/50 bg-background-50/60 py-1.5 pl-6 pr-7 font-mono text-[11px] text-foreground-200 focus:border-primary-500/60"
                >
                  {providerOptions.map((option) => (
                    <option key={option.key} value={option.key} className="bg-background-100">
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
                <i className="ri-subtract-line pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-foreground-600" />
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] text-foreground-600" />
              </div>
            </div>

            <div className="relative w-full lg:ml-auto lg:max-w-xs">
              <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên game..."
                className="w-full rounded border border-background-300/50 bg-background-50/60 py-1.5 pl-8 pr-2.5 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
              />
            </div>
          </div>

          {notice && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-accent-500/30 bg-accent-500/10 px-3 py-2">
              <i className="ri-information-line text-[13px] text-accent-500" />
              <p className="font-mono text-[11px] text-accent-500">{notice}</p>
            </div>
          )}

          {compareMode && mode === 'slot' && (
            <div className="mt-3 rounded-md border border-primary-500/30 bg-primary-500/5 px-3 py-2.5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-primary-500 uppercase">
                chế độ so sánh · chọn tối đa 3 game
              </p>
              {compareGames.length === 0 ? (
                <p className="mt-1 font-mono text-[11px] text-foreground-500">
                  bấm vào game bên dưới để thêm vào bảng so sánh.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {compareGames.map((game) => (
                    <CompareRow
                      key={game.id}
                      game={game}
                      onRemove={() =>
                        setCompareIds((prev) => prev.filter((item) => item !== game.id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-b hairline pb-2">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              {mode === 'slot' ? 'phòng nổ hũ / slot' : 'baccarat trực tiếp / phiên bẻ khoá'}
            </p>
            <p className="flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-600">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
              {mode === 'slot' ? (
                <>{`tỷ lệ & cược cập nhật mỗi 3 phút · ${total} kết quả`}</>
              ) : (
                <>{`tls 1.3 · ${HACK_COST} coin / phiên`}</>
              )}
            </p>
          </div>

          {mode === 'slot' ? (
            filteredSlots.length > 0 ? (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredSlots.slice(0, visible).map((game) => (
                    <div
                      key={game.id}
                      className={
                        compareMode && compareIds.includes(game.id)
                          ? 'rounded-md ring-1 ring-primary-500'
                          : ''
                      }
                    >
                      <SlotCard game={game} onScan={() => openSlotDetail(game)} />
                    </div>
                  ))}
                </div>
                {visible < filteredSlots.length && (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisible((prev) => prev + PAGE_SIZE)}
                      className="cursor-pointer rounded-md border border-primary-500/40 px-5 py-2.5 font-mono text-[11px] whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500"
                    >
                      tải thêm ({filteredSlots.length - visible})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center rounded-lg border hairline bg-background-100/50 py-14">
                <i className="ri-search-eye-line text-2xl text-foreground-600" />
                <p className="mt-3 font-mono text-[12px] text-foreground-500">
                  không tìm thấy phòng phù hợp
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProvider('all');
                    setQuery('');
                  }}
                  className="mt-4 cursor-pointer rounded-md border border-primary-500/40 px-4 py-2 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500 hover:text-background-50"
                >
                  xoá bộ lọc
                </button>
              </div>
            )
          ) : (
            <BaccaratHackPanel
              coins={coins}
              cost={HACK_COST}
              playerName={displayName}
              onSpend={spend}
              onNotice={(message) => {
                if (!authUser) {
                  requireLogin();
                  return;
                }
                setNotice(message);
              }}
            />
          )}

          <div className="mt-8 flex flex-col gap-3 rounded-lg border border-primary-500/20 bg-background-100/50 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="flex items-start gap-3">
              <i className="ri-error-warning-line mt-0.5 text-base text-accent-500" />
              <p className="max-w-2xl font-mono text-[10px] leading-relaxed text-foreground-500">
                Toàn bộ chỉ số trên bảng là thống kê từ dữ liệu công khai, không dự đoán chính xác kết
                quả và không đảm bảo lợi nhuận. Hãy chơi có trách nhiệm, chỉ dành cho người từ 18+.
              </p>
            </div>
            <Link
              to="/#pricing"
              className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2 font-mono text-[11px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
            >
              <i className="ri-copper-coin-line" />
              Nạp coin
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <GameDetailPanel
        open={detail !== null}
        kind={detail?.kind ?? 'slot'}
        name={detail?.name ?? ''}
        code={detail?.code ?? ''}
        image={detail?.image ?? ''}
        provider={detail?.provider ?? ''}
        meta={detail?.meta ?? ''}
        p={detail?.p ?? 0}
        coins={coins}
        hackCost={HACK_COST}
        onClose={closeDetail}
        onHack={openHackFromDetail}
      />

      <ScanModal
        open={scanTarget !== null}
        target={scanTarget}
        onClose={closeScan}
        cost={HACK_COST}
        coins={coins}
        onSpend={spend}
      />
    </div>
  );
}