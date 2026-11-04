import { useCallback, useEffect, useMemo, useState } from 'react';
import BookmakerConsole from './BookmakerConsole';
import BookmakerResult from './BookmakerResult';
import {
  buildBookmakerScript,
  buildLicenseCodes,
  randomVaultRate,
} from './bookmakerScript';
import type { Bookmaker } from '@/mocks/bookmakers';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type Phase = 'running' | 'result';

type Session = {
  preferred: boolean;
  winRate: number;
  codes: string[];
};

type Props = {
  open: boolean;
  bookmaker: Bookmaker | null;
  canUseCodes: boolean;
  onClose: () => void;
};

const createSession = (preferred: boolean, previousRate = -1): Session => ({
  preferred,
  winRate: preferred ? 88 : randomVaultRate(previousRate),
  codes: preferred ? buildLicenseCodes(7) : [],
});

export default function BookmakerScanModal({ open, bookmaker, canUseCodes, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('running');
  const [shown, setShown] = useState(0);
  const [session, setSession] = useState<Session>({ preferred: false, winRate: 0, codes: [] });
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open || !bookmaker) return;
    setSession(createSession(Boolean(bookmaker.featured)));
    setShown(0);
    setPhase('running');
  }, [open, bookmaker?.id, bookmaker?.featured]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const lines = useMemo(
    () =>
      bookmaker
        ? buildBookmakerScript({
            name: bookmaker.name,
            code: bookmaker.id,
            preferred: session.preferred,
            winRate: session.winRate,
            licenseCodes: session.codes,
          })
        : [],
    [bookmaker, session],
  );

  useEffect(() => {
    if (!open || phase !== 'running') return undefined;
    if (shown >= lines.length) {
      const timer = window.setTimeout(() => setPhase('result'), 420);
      return () => window.clearTimeout(timer);
    }
    const delay = lines[shown]?.kind === 'cmd' ? 220 : 62;
    const timer = window.setTimeout(() => setShown((prev) => prev + 1), delay);
    return () => window.clearTimeout(timer);
  }, [open, phase, shown, lines]);

  const rescan = useCallback(() => {
    if (!bookmaker) return;
    setSession((prev) =>
      createSession(Boolean(bookmaker.featured), prev.preferred ? -1 : prev.winRate),
    );
    setShown(0);
    setPhase('running');
  }, [bookmaker]);

  if (!open || !bookmaker) return null;

  const progress = lines.length === 0 ? 0 : Math.round((shown / lines.length) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-3 py-6 md:items-center">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-background-50/90 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-primary-500/30 bg-background-100 term-glow">
        <div className="flex items-center justify-between gap-3 border-b hairline px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
              bookmaker code engine · v2.6
            </p>
            <p className="mt-0.5 truncate font-mono text-[9px] text-foreground-600">
              {phase === 'running'
                ? 'đang quét mã code nhà cái'
                : session.preferred
                  ? 'kết quả · khoá chuyên nghiệp đã giải'
                  : 'kết quả · nhà cái đang thu hút vốn'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
            aria-label="Đóng cửa sổ"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        <div className="p-3 md:p-4">
          {phase === 'running' ? (
            <BookmakerConsole
              name={bookmaker.name}
              code={bookmaker.domain}
              lines={lines}
              shown={shown}
              running
              progress={progress}
              preferred={session.preferred}
            />
          ) : (
            <BookmakerResult
              bookmaker={bookmaker}
              preferred={session.preferred}
              winRate={session.winRate}
              codes={session.codes}
              canUseCodes={canUseCodes}
              onRescan={rescan}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}