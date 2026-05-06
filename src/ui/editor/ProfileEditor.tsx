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

function Tip({ text }: { text: string }) {
  return (
    <abbr title={text} style={{ textDecoration: 'none', cursor: 'help' }} className="ml-1 text-blue-400 text-xs">
      ⓘ
    </abbr>
  )
}

export default function ProfileEditor({ profile, onSave, onCancel, onDelete }: Props) {
  const [draft, setDraft] = useState<DiveProfile>({ ...profile })

  function patch(updates: Partial<DiveProfile>) {
    setDraft(d => ({ ...d, ...updates, updatedAt: Date.now() }))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">Éditeur de scénario</h2>

      {/* Name & description */}
      <section className="space-y-2">
        <input
          type="text"
          value={draft.name}
          onChange={e => patch({ name: e.target.value })}
          placeholder="Nom du scénario"
          className="w-full border rounded-lg px-3 py-2 text-lg font-medium"
        />
        <textarea
          value={draft.description ?? ''}
          onChange={e => patch({ description: e.target.value })}
          placeholder="Description (optionnel) — contexte pédagogique, objectifs…"
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600 resize-none"
        />
      </section>

      {/* Global parameters */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Paramètres du plongeur et du matériel</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">

          <label className="flex flex-col gap-1">
            <span className="text-gray-700 font-medium flex items-center flex-wrap gap-x-1">
              Fraction d'oxygène (O₂)
              <Tip text="Pourcentage d'oxygène dans le mélange respiré. L'air normal contient 21 % d'O₂. Le nitrox (32–36 %) réduit la quantité d'azote et allonge les limites sans décompression, mais limite la profondeur maximale." />
            </span>
            <span className="text-xs text-gray-400">21 % = air · 32–36 % = nitrox</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number" min={21} max={40}
                value={Math.round(draft.gas.o2Fraction * 100)}
                onChange={e => patch({ gas: { o2Fraction: (parseFloat(e.target.value) || 21) / 100 } })}
                className="border rounded px-2 py-1 w-20"
              />
              <span className="text-gray-500">%</span>
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-700 font-medium flex items-center flex-wrap gap-x-1">
              Volume de la bouteille
              <Tip text="Capacité interne de la bouteille en litres. Une bouteille de 12 L à 200 bar contient 2 400 L d'air comprimé. Plus le volume est grand, plus l'autonomie est longue." />
            </span>
            <span className="text-xs text-gray-400">Standard : 12 L · grande : 15 L</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number" min={6} max={18}
                value={draft.tankVolume}
                onChange={e => patch({ tankVolume: parseFloat(e.target.value) || 12 })}
                className="border rounded px-2 py-1 w-20"
              />
              <span className="text-gray-500">L</span>
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-700 font-medium flex items-center flex-wrap gap-x-1">
              Pression initiale de la bouteille
              <Tip text="Pression du gaz dans la bouteille au départ de la plongée, en bar. Une bouteille pleine est chargée entre 200 et 232 bar selon le modèle. En dessous de 50 bar, il est recommandé de remonter." />
            </span>
            <span className="text-xs text-gray-400">Pleine = 200–232 bar</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number" min={100} max={300}
                value={draft.startingTankPressure}
                onChange={e => patch({ startingTankPressure: parseFloat(e.target.value) || 200 })}
                className="border rounded px-2 py-1 w-20"
              />
              <span className="text-gray-500">bar</span>
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-700 font-medium flex items-center flex-wrap gap-x-1">
              Consommation de surface (SAC)
              <Tip text="SAC = Surface Air Consumption. Volume d'air respiré par minute si le plongeur était à la surface (0 m). En profondeur, la consommation réelle est multipliée par la pression ambiante : à 20 m la pression est ×3, donc on respire 3× plus d'air. Un débutant consomme ≈ 25 L/min, un plongeur expérimenté ≈ 15 L/min." />
            </span>
            <span className="text-xs text-gray-400">Débutant ≈ 25 L/min · expérimenté ≈ 15 L/min</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number" min={10} max={50}
                value={draft.sac}
                onChange={e => patch({ sac: parseFloat(e.target.value) || 20 })}
                className="border rounded px-2 py-1 w-20"
              />
              <span className="text-gray-500">L/min</span>
            </div>
          </label>

        </div>
      </section>

      {/* Profile preview */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu du profil de plongée</h3>
        <div className="border rounded-lg p-2 bg-gray-50">
          <ProfilePreview profile={draft} />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Durée totale : {Math.round(getTotalDurationSec(draft) / 60)} min
        </p>
      </section>

      {/* Segments */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-1">Segments de plongée</h3>
        <p className="text-xs text-gray-400 mb-2">
          Un segment décrit une phase : <em>descente</em> vers une profondeur, <em>fond</em> (maintien à profondeur constante),
          ou <em>remontée</em>. Leur enchaînement forme le profil complet.
        </p>
        <SegmentList segments={draft.segments} onChange={segs => patch({ segments: segs })} />
      </section>

      {/* Events */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-1">Événements scénarisés</h3>
        <p className="text-xs text-gray-400 mb-2">
          Incidents pédagogiques déclenchés à un instant précis de la plongée — essoufflement, panne d'air,
          remontée trop rapide… Ils permettent d'observer comment l'ordinateur réagit et ce qu'il affiche.
        </p>
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
              if (confirm('Supprimer ce scénario ?')) onDelete(draft.id)
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
