import { useState } from 'react'
import type { DiveProfile } from '../../types'
import SegmentList from './SegmentList'
import EventList from './EventList'
import ProfilePreview from './ProfilePreview'
import { getTotalDurationSec } from '../../engine/profile'

type Props = {
  profile: DiveProfile
  onSave: (profile: DiveProfile) => void
  onCancel: () => void
  onDelete?: (id: string) => void
}

export default function ProfileEditor({ profile, onSave, onCancel, onDelete }: Props) {
  const [draft, setDraft] = useState<DiveProfile>({ ...profile })

  function patch(updates: Partial<DiveProfile>) {
    setDraft(d => ({ ...d, ...updates, updatedAt: Date.now() }))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">Éditeur de profil</h2>

      {/* Name & description */}
      <section className="space-y-2">
        <input
          type="text"
          value={draft.name}
          onChange={e => patch({ name: e.target.value })}
          placeholder="Nom du profil"
          className="w-full border rounded-lg px-3 py-2 text-lg font-medium"
        />
        <textarea
          value={draft.description ?? ''}
          onChange={e => patch({ description: e.target.value })}
          placeholder="Description (optionnel)"
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600 resize-none"
        />
      </section>

      {/* Global parameters */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Paramètres</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-gray-600">O₂ (%)</span>
            <input
              type="number" min={21} max={40}
              value={Math.round(draft.gas.o2Fraction * 100)}
              onChange={e => patch({ gas: { o2Fraction: (parseFloat(e.target.value) || 21) / 100 } })}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600">Volume bouteille (L)</span>
            <input
              type="number" min={6} max={18}
              value={draft.tankVolume}
              onChange={e => patch({ tankVolume: parseFloat(e.target.value) || 12 })}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600">Pression initiale (bar)</span>
            <input
              type="number" min={100} max={300}
              value={draft.startingTankPressure}
              onChange={e => patch({ startingTankPressure: parseFloat(e.target.value) || 200 })}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600">SAC (L/min)</span>
            <input
              type="number" min={10} max={50}
              value={draft.sac}
              onChange={e => patch({ sac: parseFloat(e.target.value) || 20 })}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
      </section>

      {/* Profile preview */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu profil</h3>
        <div className="border rounded-lg p-2 bg-gray-50">
          <ProfilePreview profile={draft} />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Durée totale : {Math.round(getTotalDurationSec(draft) / 60)} min
        </p>
      </section>

      {/* Segments */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Segments</h3>
        <SegmentList segments={draft.segments} onChange={segs => patch({ segments: segs })} />
      </section>

      {/* Events */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Événements</h3>
        <EventList
          events={draft.events}
          totalDurationSec={getTotalDurationSec(draft)}
          onChange={evs => patch({ events: evs })}
        />
      </section>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <button
          onClick={() => onSave(draft)}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Sauvegarder
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('Supprimer ce profil ?')) onDelete(draft.id)
            }}
            className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}
