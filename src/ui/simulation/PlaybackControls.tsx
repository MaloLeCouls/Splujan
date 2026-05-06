import Icon from '../components/Icon'

type Props = {
  tSec: number
  totalSec: number
  playing: boolean
  speed: 1 | 2 | 4 | 8
  onPlayPause: () => void
  onReset: () => void
  onSpeedChange: (s: 1 | 2 | 4 | 8) => void
  onScrub: (t: number) => void
}

export default function PlaybackControls({
  tSec, totalSec, playing, speed, onPlayPause, onReset, onSpeedChange, onScrub,
}: Props) {
  return (
    <div style={{
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      borderTop: '1px solid var(--line-2)',
    }}>
      <button onClick={onReset} className="ds-btn ds-btn-icon" title="Recommencer (R)">
        <Icon name="rewind" size={14}/>
      </button>
      <button
        onClick={onPlayPause}
        className="ds-btn ds-btn-icon ds-btn-primary"
        style={{ width: 38, height: 38, borderRadius: 8 }}
        title="Lecture / Pause (Espace)"
      >
        <Icon name={playing ? 'pause' : 'play'} size={15}/>
      </button>

      <div className="ds-mono" style={{ fontSize: 13, color: 'var(--ink)', minWidth: 110 }}>
        <span style={{ fontWeight: 500 }}>{fmt(tSec)}</span>
        <span style={{ color: 'var(--ink-4)' }}> / {fmt(totalSec)}</span>
      </div>

      <input
        type="range" min={0} max={totalSec} step={1} value={tSec}
        onChange={e => onScrub(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--ink)' }}
      />

      <div className="ds-seg">
        {([1, 2, 4, 8] as const).map(s => (
          <button key={s} aria-pressed={speed === s} onClick={() => onSpeedChange(s)}>
            {s}×
          </button>
        ))}
      </div>
    </div>
  )
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
