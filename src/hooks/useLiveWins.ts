import { useEffect, useMemo, useRef, useState } from 'react';
import { liveGameLabels, livePlayers } from '@/mocks/liveWins';

export type LiveGameRef = {
  name: string;
  image: string;
  code: string;
};

export type LiveWin = {
  id: string;
  name: string;
  amount: number;
  game: string;
  image: string;
  code: string;
  times: number;
  createdAt: number;
  ago: string;
};

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const agoOf = (ms: number) => {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 9) return 'vừa xong';
  if (seconds < 60) return `${seconds} giây trước`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  return `${Math.round(minutes / 60)} giờ trước`;
};

const createWin = (
  current: LiveGameRef,
  catalog: LiveGameRef[],
  offsetMs = 0,
): LiveWin => {
  const pool = catalog.filter((item) => item.name !== current.name);
  const useCurrent = Math.random() < 0.34 || pool.length === 0;
  const source = useCurrent ? current : pick(pool);
  const name = source?.name ?? pick(liveGameLabels);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: pick(livePlayers),
    amount: Math.round((150 + Math.random() * 89000) * 1000),
    game: name,
    image: source?.image ?? current.image,
    code: source?.code ?? current.code,
    times: 1 + Math.floor(Math.random() * 24),
    createdAt: Date.now() - offsetMs,
    ago: agoOf(offsetMs),
  };
};

const seedWins = (current: LiveGameRef, catalog: LiveGameRef[]): LiveWin[] =>
  Array.from({ length: 12 }, (_, index) => {
    const offset = (index * 74 + 6 + Math.floor(Math.random() * 40)) * 1000;
    return createWin(current, catalog, offset);
  });

export function useLiveWins(current: LiveGameRef, catalog: LiveGameRef[]) {
  const currentRef = useRef(current);
  const catalogRef = useRef(catalog);
  currentRef.current = current;
  catalogRef.current = catalog;

  const [wins, setWins] = useState<LiveWin[]>(() => seedWins(current, catalog));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setWins(seedWins(currentRef.current, catalogRef.current));
    setNow(Date.now());
  }, [current.code, current.name]);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setWins((prev) =>
        [createWin(currentRef.current, catalogRef.current), ...prev].slice(0, 32),
      );
      timer = window.setTimeout(tick, 900 + Math.random() * 1500);
    };
    timer = window.setTimeout(tick, 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 6000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(
    () => wins.map((win) => ({ ...win, ago: agoOf(now - win.createdAt) })),
    [wins, now],
  );
}