export function AudiRings() {
  return <svg viewBox="0 0 140 50" fill="none" aria-hidden="true">
    {[28, 56, 84, 112].map((cx) => <circle key={cx} cx={cx} cy="25" r="22" stroke="currentColor" strokeWidth="2.5" />)}
  </svg>
}
