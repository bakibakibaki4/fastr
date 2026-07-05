"use client";

type Props = {
  /** 0..1 */
  fraction: number;
  goalReached: boolean;
  children: React.ReactNode;
};

const SIZE = 280;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export default function ProgressRing({ fraction, goalReached, children }: Props) {
  const offset = C * (1 - Math.min(1, Math.max(0, fraction)));
  const color = goalReached ? "var(--goal)" : "var(--accent)";

  return (
    <div className="ring-wrap" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="ring-svg"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.4s ease" }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}
