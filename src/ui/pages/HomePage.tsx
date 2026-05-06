import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { exportProfileAsJSON } from '../../storage/importExport'
import ComputerPicker from '../computers/ComputerPicker'
import type { DiveProfile } from '../../types'

function ProfileCard({ profile, onSimulate, onEdit }: {
  profile: DiveProfile
  onSimulate: () => void
  onEdit: () => void
}) {
  const segments = profile.segments.length
  const totalSec = profile.segments.reduce((s, seg) => s + seg.durationSec, 0)
  const totalMin = Math.round(totalSec / 60)
  const maxDepth = Math.max(
    ...profile.segments.map(seg => ('toDepth' in seg ? seg.toDepth : seg.depth))
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
        {profile.description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{profile.description}</p>
        )}
        <div className="flex gap-3 mt-2 text-xs text-gray-400">
          <span>↓ {maxDepth} m</span>
          <span>⏱ {totalMin} min</span>
          <span>{segments} segment{segments > 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSimulate}
          className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ▶ Simuler
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          title="Éditer"
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
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">DiveSim</h1>
          <p className="text-gray-500 text-sm mt-0.5">Simulateur pédagogique d'ordinateur de plongée</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">

        {/* ── Step 1: Choose computer ───────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
            <h2 className="text-base font-semibold text-gray-900">Choisissez votre ordinateur</h2>
          </div>
          <ComputerPicker />
        </div>

        {/* ── Step 2: Choose scenario ──────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
            <h2 className="text-base font-semibold text-gray-900">Choisissez un scénario</h2>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleNewProfile}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + Nouveau
              </button>
              <label className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">
                Importer
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </div>

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
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 pb-8 text-center text-xs text-gray-400">
        ⚠ Outil pédagogique uniquement — ne pas utiliser pour planifier une plongée réelle.
      </footer>
    </div>
  )
}
