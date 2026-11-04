import { useMemo, useState } from 'react';

type Props = {
  name: string;
  domain: string;
  size?: 'sm' | 'md' | 'lg';
  featured?: boolean;
};

const SIZES = {
  sm: 'h-7 w-7 rounded text-[10px]',
  md: 'h-9 w-9 rounded-md text-[11px]',
  lg: 'h-11 w-11 rounded-md text-[13px]',
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
 * Logo nhà cái: thử logo thật theo tên miền trước, nếu không có thì luôn
 * hiển thị một ô nhận diện thương hiệu có màu riêng — không bao giờ để trống.
 */
export default function BookmakerLogo({ name, domain, size = 'md', featured = false }: Props) {
  const [step, setStep] = useState(0);

  const tone: Tone = TONES[hashOf(name) % TONES.length];
  const mark = markOf(name);

  const sources = useMemo(
    () => [`https://logo.clearbit.com/${domain}`, `https://icon.horse/icon/${domain}`],
    [domain],
  );

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
        className="h-full w-full object-contain p-1"
      />
    </span>
  );
}