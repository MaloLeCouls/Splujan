import type { DiveEvent } from '../../types'

type Props = {
  events: DiveEvent[]
  totalDurationSec: number
  onChange: (events: DiveEvent[]) => void
}

const EVENT_LABELS: Record<DiveEvent['type'], string> = {
  panic:         'Essoufflement',
  ooa:           'Panne d\'air',
  rapid_ascent:  'Remontée rapide',
  skip_stop:     'Palier de déco sauté',
  sac_change:    'Effort intense (↑ conso)',
}

const EVENT_DESCRIPTIONS: Record<DiveEvent['type'], string> = {
  panic:
    "Simule un essoufflement : la consommation d'air augmente fortement. L'ordinateur peut déclencher une alarme si la pression chute trop vite.",
  ooa:
    "Panne d'air (Out Of Air) : la bouteille est vide. La plongée s'arrête immédiatement dans la simulation.",
  rapid_ascent:
    "Le plongeur remonte trop vite (> 10 m/min). L'ordinateur déclenche l'alarme SLOW et, en cas de palier sauté, peut passer en mode erreur (ER).",
  skip_stop:
    "Un palier de décompression obligatoire est ignoré. L'ordinateur enregistre la violation et peut verrouiller son algorithme.",
  sac_change:
    "Effort physique intense : la consommation de surface (SAC) augmente temporairement, réduisant l'autonomie restante.",
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
        <div key={ev.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200 space-y-1.5">
          <div className="flex gap-2 items-center">
            <select
              value={ev.type}
              onChange={e => update(ev.id, { type: e.target.value as DiveEvent['type'] })}
              className="border rounded px-1 py-0.5 text-sm"
            >
              {(Object.keys(EVENT_LABELS) as DiveEvent['type'][]).map(t => (
                <option key={t} value={t}>{EVENT_LABELS[t]}</option>
              ))}
            </select>

            <label className="text-sm text-gray-600 flex items-center gap-1">
              à
              <input
                type="number"
                min={0}
                max={Math.floor(totalDurationSec / 60)}
                value={Math.floor(ev.triggerAtSec / 60)}
                onChange={e => update(ev.id, { triggerAtSec: (parseFloat(e.target.value) || 0) * 60 })}
                className="w-14 border rounded px-1 py-0.5 text-sm"
              />
              <span>min depuis le début</span>
            </label>

            <button
              onClick={() => remove(ev.id)}
              className="ml-auto text-red-400 hover:text-red-600 text-sm"
              title="Supprimer cet événement"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-orange-700 leading-relaxed">{EVENT_DESCRIPTIONS[ev.type]}</p>
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
