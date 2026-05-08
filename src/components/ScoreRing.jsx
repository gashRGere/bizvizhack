export default function ScoreRing({ score, size = 120 }) {
  const r = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const pct = score / 10
  const dash = circ * pct
  const gap  = circ - dash

  const color =
    score >= 8 ? '#10B981' :
    score >= 5 ? '#5B6CF7' : '#F43F5E'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#1E2535" strokeWidth="8"
        />
        {/* fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          className="score-ring"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-text-primary leading-none">{score}</span>
        <span className="text-xs text-text-dim mt-0.5">/ 10</span>
      </div>
    </div>
  )
}
