import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { exportProfileAsJSON } from '../../storage/importExport'
import type { DiveProfile } from '../../types'

function ProfileCard({ profile, onSimulate, onEdit }: {
  profile: DiveProfile
  onSimulate: () => void
  onEdit: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
      {profile.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{profile.description}</p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onSimulate}
          className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          ▶ Simuler
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          ✏
        </button>
        <button
          onClick={() => exportProfileAsJSON(profile)}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          title="Exporter JSON"
        >
          ⬇
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profiles, addProfile, setActiveProfile } = useStore()

  function handleNewProfile() {
    const profile: DiveProfile = {
      id: crypto.randomUUID(),
      name: 'Nouveau profil',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gas: { o2Fraction: 0.21 },
      surfacePressure: 1.013,
      startingTankPressure: 200,
      tankVolume: 12,
      sac: 20,
      segments: [
        { type: 'descent', toDepth: 20, durationSec: 120 },
        { type: 'constant', depth: 20, durationSec: 1800 },
        { type: 'ascent', toDepth: 0, durationSec: 180 },
      ],
      events: [],
      gradientFactors: { low: 30, high: 85 },
    }
    addProfile(profile)
    navigate(`/editor/${profile.id}`)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    import('../../storage/importExport').then(({ importProfileFromFile }) => {
      importProfileFromFile(file)
        .then(p => useStore.getState().importProfile(p))
        .catch(() => alert('Fichier invalide'))
    })
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">DiveSim</h1>
        <p className="text-gray-500 mt-1">Simulateur pédagogique d'ordinateur de plongée</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleNewProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            + Nouveau profil
          </button>
          <label className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer transition-colors">
            Importer JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>

        {/* Profile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map(p => (
            <ProfileCard
              key={p.id}
              profile={p}
              onSimulate={() => {
                setActiveProfile(p.id)
                navigate(`/simulation/${p.id}`)
              }}
              onEdit={() => navigate(`/editor/${p.id}`)}
            />
          ))}
        </div>
      </main>

      {/* Legal disclaimer */}
      <footer className="max-w-4xl mx-auto mt-12 text-center text-xs text-gray-400">
        ⚠ Outil pédagogique uniquement. Ne jamais utiliser pour planifier une plongée réelle.
      </footer>
    </div>
  )
}
