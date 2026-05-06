import type { DiveEvent } from '../../types'

type Props = {
  events: DiveEvent[]
  totalDurationSec: number
  onChange: (events: DiveEvent[]) => void
}

const EVENT_LABELS: Record<DiveEvent['type'], string> = {
  panic: 'Essoufflement',
  ooa: 'Panne d\'air',
  rapid_ascent: 'Remontée rapide',
  skip_stop: 'Palier sauté',
  sac_change: 'Changement SAC',
}

export default function EventList({ events, totalDurationSec, onChange }: Props) {
  function remove(id: string) {
    onChange(events.filter(e => e.id !== id))
  }

  function addEvent() {
    const newEvent: DiveEvent = {
      id: crypto.randomUUID(),
      triggerAtSec: Math.floor(totalDurationSec / 2),
      type: 'rapid_ascent',
    }
    onChange([...events, newEvent])
  }

  function update(id: string, patch: Partial<DiveEvent>) {
    onChange(events.map(e => (e.id === id ? { ...e, ...patch } : e)))
  }

  return (
    <div className="space-y-2">
      {events.map(ev => (
        <div key={ev.id} className="flex gap-2 items-center p-2 bg-orange-50 rounded-lg border border-orange-200">
          <select
            value={ev.type}
            onChange={e => update(ev.id, { type: e.target.value as DiveEvent['type'] })}
            className="border rounded px-1 py-0.5 text-sm"
          >
            {(Object.keys(EVENT_LABELS) as DiveEvent['type'][]).map(t => (
              <option key={t} value={t}>{EVENT_LABELS[t]}</option>
            ))}
          </select>

          <label className="text-sm text-gray-600">
            à T+
            <input
              type="number"
              min={0}
              max={Math.floor(totalDurationSec / 60)}
              value={Math.floor(ev.triggerAtSec / 60)}
              onChange={e => update(ev.id, { triggerAtSec: (parseFloat(e.target.value) || 0) * 60 })}
              className="w-14 ml-1 border rounded px-1 py-0.5 text-sm"
            />
            min
          </label>

          <button
            onClick={() => remove(ev.id)}
            className="ml-auto text-red-400 hover:text-red-600 text-sm"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addEvent}
        className="w-full py-1.5 border-2 border-dashed border-orange-300 rounded-lg text-sm text-orange-500 hover:border-orange-400 transition-colors"
      >
        + Ajouter un événement
      </button>
    </div>
  )
}
