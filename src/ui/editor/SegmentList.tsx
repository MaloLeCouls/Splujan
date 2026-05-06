import type { DiveSegment } from '../../types'
import Icon from '../components/Icon'
import { UnitInput } from '../components/Layout'

type Props = {
  segments: DiveSegment[]
  onChange: (s: DiveSegment[]) => void
}

const KIND_META = {
  descent:  { label: 'Descente',  glyph: '↘', color: 'var(--accent)' },
  constant: { label: 'Plateau',   glyph: '→', color: 'var(--ink-2)' },
  ascent:   { label: 'Remontée',  glyph: '↗', color: 'oklch(0.55 0.08 145)' },
} as const

export default function SegmentList({ segments, onChange }: Props) {
  function update(i: number, seg: DiveSegment) {
    const next = [...segments]; next[i] = seg; onChange(next)
  }
  function remove(i: number) { onChange(segments.filter((_, j) => j !== i)) }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= segments.length) return
    const next = [...segments]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function add(kind: DiveSegment['type']) {
    const last = segments[segments.length - 1]
    const lastDepth = last ? ('toDepth' in last ? last.toDepth : last.depth) : 0
    const seg: DiveSegment =
      kind === 'descent' ? { type: 'descent', toDepth: Math.max(lastDepth, 20), durationSec: 120 } :
      kind === 'constant' ? { type: 'constant', depth: lastDepth, durationSec: 600 } :
      { type: 'ascent', toDepth: 0, durationSec: 180 }
    onChange([...segments, seg])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {segments.map((seg, i) => {
        const meta = KIND_META[seg.type]
        return (
          <div
            key={i}
            className="ds-card"
            style={{
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '24px 110px 1fr auto',
              alignItems: 'center', gap: 12,
            }}
          >
            <div className="ds-mono" style={{ color: 'var(--ink-4)', fontSize: 11, textAlign: 'center' }}>
              {String(i + 1).padStart(2, '0')}
            </div>

            <div className="flex items-center gap-2" style={{ color: meta.color }}>
              <span style={{ fontSize: 18, lineHeight: 1, fontFamily: 'var(--font-mono)' }}>{meta.glyph}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{meta.label}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {seg.type === 'constant' ? (
                <Inline label="à">
                  <SmallNumber value={seg.depth} unit="m"
                    onChange={v => update(i, { ...seg, depth: v })}/>
                </Inline>
              ) : (
                <Inline label="vers">
                  <SmallNumber value={seg.toDepth} unit="m"
                    onChange={v => update(i, { ...seg, toDepth: v })}/>
                </Inline>
              )}
              <Inline label="durée">
                <SmallNumber
                  value={Math.round(seg.durationSec / 60 * 10) / 10}
                  unit="min"
                  step={0.5}
                  onChange={v => update(i, { ...seg, durationSec: Math.round(v * 60) } as DiveSegment)}
                />
              </Inline>
            </div>

            <div className="flex gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="ds-btn ds-btn-sm ds-btn-icon ds-btn-ghost" title="Monter">
                <Icon name="chevron-down" size={12} style={{ transform: 'rotate(180deg)' }}/>
              </button>
              <button onClick={() => move(i, 1)} disabled={i === segments.length - 1} className="ds-btn ds-btn-sm ds-btn-icon ds-btn-ghost" title="Descendre">
                <Icon name="chevron-down" size={12}/>
              </button>
              <button onClick={() => remove(i)} className="ds-btn ds-btn-sm ds-btn-icon ds-btn-ghost" title="Supprimer" style={{ color: 'var(--danger)' }}>
                <Icon name="x" size={12}/>
              </button>
            </div>
          </div>
        )
      })}

      <div className="flex gap-2 mt-1">
        <button onClick={() => add('descent')} className="ds-btn ds-btn-sm">
          <span style={{ color: KIND_META.descent.color, fontFamily: 'var(--font-mono)' }}>↘</span> Descente
        </button>
        <button onClick={() => add('constant')} className="ds-btn ds-btn-sm">
          <span style={{ color: KIND_META.constant.color, fontFamily: 'var(--font-mono)' }}>→</span> Plateau
        </button>
        <button onClick={() => add('ascent')} className="ds-btn ds-btn-sm">
          <span style={{ color: KIND_META.ascent.color, fontFamily: 'var(--font-mono)' }}>↗</span> Remontée
        </button>
      </div>
    </div>
  )
}

function Inline({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{label}</span>
      {children}
    </div>
  )
}

function SmallNumber({ value, unit, onChange, step = 1 }: {
  value: number; unit: string; onChange: (v: number) => void; step?: number
}) {
  return (
    <div style={{ position: 'relative', width: 92 }}>
      <input
        type="number" value={value} step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="ds-input ds-mono"
        style={{ height: 28, fontSize: 12.5, paddingRight: 38 }}
      />
      <span className="ds-mono" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ink-4)' }}>
        {unit}
      </span>
    </div>
  )
}

export { UnitInput }
