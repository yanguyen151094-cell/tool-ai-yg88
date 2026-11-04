import { useMemo, useState } from 'react';

type Props = {
  name: string;
  domain: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  featured?: boolean;
};

const SIZES = {
  sm: 'h-7 w-7 rounded text-[10px]',
  md: 'h-9 w-9 rounded-md text-[11px]',
  lg: 'h-11 w-11 rounded-md text-[13px]',
  xl: 'h-14 w-14 rounded-lg text-[15px]',
} as const;

const PADDING = {
  sm: 'p-0.5',
  md: 'p-1',
  lg: 'p-1',
  xl: 'p-1.5',
} as const;

const TONES = ['primary', 'accent', 'secondary'] as const;
type Tone = (typeof TONES)[number];

const TONE_CLASS: Record<Tone, string> = {
  primary: 'border-primary-500/50 bg-primary-500/15 text-primary-400',
  accent: 'border-accent-500/50 bg-accent-500/15 text-accent-400',
  secondary: 'border-secondary-500/50 bg-secondary-500/15 text-secondary-400',
};

/** Băm tên nhà cái để mỗi hãng luôn rơi vào một tông màu cố định. */
const hashOf = (value: string) => {
  let sum = 0;
  for (let i = 0; i < value.length; i += 1) {
    sum += value.charCodeAt(i) * (i + 3);
  }
  return sum;
};

/** Lấy 2 ký tự nhận diện: "YG88" → "YG", "188BET" → "18", "KUBET" → "KU". */
const markOf = (name: string) => {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, '');
  if (!cleaned) return '?';
  return cleaned.slice(0, 2).toUpperCase();
};

/**
 * Logo nhà cái: ưu tiên ảnh do chủ web tải lên, sau đó logo thật theo tên miền,
 * cuối cùng là huy hiệu nhận diện thương hiệu — không bao giờ để trống.
 */
export default function BookmakerLogo({
  name,
  domain,
  logoUrl = '',
  size = 'md',
  featured = false,
}: Props) {
  const [step, setStep] = useState(0);

  const tone: Tone = TONES[hashOf(name) % TONES.length];
  const mark = markOf(name);

  const sources = useMemo(() => {
    const list: string[] = [];
    if (logoUrl) list.push(logoUrl);
    if (domain) {
      list.push(`https://logo.clearbit.com/${domain}`);
      list.push(`https://icon.horse/icon/${domain}`);
    }
    return list;
  }, [domain, logoUrl]);

  if (step >= sources.length) {
    return (
      <span
        aria-label={`Logo ${name}`}
        title={name}
        className={`flex shrink-0 items-center justify-center overflow-hidden border font-heading font-bold tracking-tight ${
          SIZES[size]
        } ${TONE_CLASS[tone]} ${featured ? 'ring-1 ring-primary-500/30' : ''}`}
      >
        {mark}
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border bg-background-50 ${
        SIZES[size]
      } ${featured ? 'border-primary-500/55' : 'border-background-300/55'}`}
    >
      <img
        src={sources[step]}
        alt={`Logo ${name}`}
        title={`${name} logo`}
        referrerPolicy="no-referrer"
        onError={() => setStep((prev) => prev + 1)}
        className={`h-full w-full object-contain ${PADDING[size]}`}
      />
    </span>
  );
}