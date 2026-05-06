import type { DiveEvent } from '../../types'
import Icon from '../components/Icon'

type Props = {
  events: DiveEvent[]
  onChange: (e: DiveEvent[]) => void
}

const TYPE_LABEL: Record<DiveEvent['type'], string> = {
  rapid_ascent: 'Remontée rapide',
  ooa: 'Panne d\'air',
  skip_stop: 'Palier sauté',
  panic: 'Essoufflement',
  sac_change: 'Effort intense',
}

export default function EventList({ events, onChange }: Props) {
  function update(i: number, ev: DiveEvent) {
    const next = [...events]; next[i] = ev; onChange(next)
  }
  function remove(i: number) { onChange(events.filter((_, j) => j !== i)) }
  function add() {
    onChange([...events, { id: crypto.randomUUID(), type: 'rapid_ascent', triggerAtSec: 600 }])
  }

  if (events.length === 0) {
    return (
      <div>
        <div className="ds-card" style={{
          padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13,
          borderStyle: 'dashed', background: 'var(--bg)',
        }}>
          Aucun événement. Le scénario se déroule sans incident.
        </div>
        <button onClick={add} className="ds-btn ds-btn-sm" style={{ marginTop: 8 }}>
          <Icon name="plus" size={13}/> Ajouter un événement
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {events.map((ev, i) => (
        <div
          key={ev.id}
          className="ds-card"
          style={{
            padding: 12,
            display: 'grid',
            gridTemplateColumns: '24px 1fr auto',
            alignItems: 'center', gap: 12,
            borderLeft: '3px solid oklch(0.7 0.13 60)',
            borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
          }}
        >
          <div className="ds-mono" style={{ color: 'var(--ink-4)', fontSize: 11, textAlign: 'center' }}>
            {String(i + 1).padStart(2, '0')}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={ev.type}
              onChange={e => update(i, { ...ev, type: e.target.value as DiveEvent['type'] })}
              className="ds-input"
              style={{ height: 28, width: 'auto', fontSize: 12.5, paddingRight: 28 }}
            >
              {Object.entries(TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>à t =</span>
              <div style={{ position: 'relative', width: 92 }}>
                <input
                  type="number" min={0}
                  value={Math.round(ev.triggerAtSec / 60 * 10) / 10}
                  step={0.5}
                  onChange={e => update(i, { ...ev, triggerAtSec: Math.round((parseFloat(e.target.value) || 0) * 60) })}
                  className="ds-input ds-mono"
                  style={{ height: 28, fontSize: 12.5, paddingRight: 38 }}
                />
                <span className="ds-mono" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ink-4)' }}>
                  min
                </span>
              </div>
            </div>
          </div>

          <button onClick={() => remove(i)} className="ds-btn ds-btn-sm ds-btn-icon ds-btn-ghost" style={{ color: 'var(--danger)' }}>
            <Icon name="x" size={12}/>
          </button>
        </div>
      ))}
      <button onClick={add} className="ds-btn ds-btn-sm" style={{ alignSelf: 'flex-start' }}>
        <Icon name="plus" size={13}/> Ajouter un événement
      </button>
    </div>
  )
}
