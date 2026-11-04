import type { CSSProperties } from 'react';

type Props = {
  bursts?: number;
  particles?: number;
  className?: string;
};

const BURST_POSITIONS = [
  { left: '16%', top: '24%', delay: '0s', distance: '54px' },
  { left: '50%', top: '14%', delay: '0.35s', distance: '68px' },
  { left: '82%', top: '30%', delay: '0.7s', distance: '50px' },
  { left: '30%', top: '68%', delay: '1.05s', distance: '46px' },
  { left: '68%', top: '72%', delay: '1.4s', distance: '58px' },
];

/** Pháo hoa thuần CSS (không dùng ảnh/SVG), dùng cho khung thông báo thành công. */
export default function Fireworks({ bursts = 4, particles = 14, className = '' }: Props) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {BURST_POSITIONS.slice(0, bursts).map((burst, burstIndex) => (
        <span
          key={burst.left}
          className="firework"
          style={{ left: burst.left, top: burst.top, animationDelay: burst.delay }}
        >
          {Array.from({ length: particles }).map((_, particleIndex) => (
            <span
              key={`${burstIndex}-${particleIndex}`}
              className="firework-particle"
              style={
                {
                  '--angle': `${(360 / particles) * particleIndex}deg`,
                  '--distance': burst.distance,
                  animationDelay: burst.delay,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
    </div>
  );
}