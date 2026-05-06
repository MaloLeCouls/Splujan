import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { getComputerEntry } from '../computers/ui-registry'
import { useCalibrationStore } from '../calibration/useCalibrationStore'
import CalibrationPanel from '../calibration/CalibrationPanel'
import { ZOOP_NOVO_DEFAULTS, mergeConfigs } from '../calibration/zoop-novo-defaults'
import { DISPLAY_MODE_LABELS } from '../calibration/types'
import type { DisplayMode } from '../calibration/types'
import type { DiveState } from '../../types'

// ── Mock DiveState pour chaque mode d'affichage ──────────────────────────────
const BASE_STATE: DiveState = {
  timeSec: 0, depth: 0, maxDepth: 0, ascentRate: 0,
  tankPressure: 200, waterTemp: 14,
  gas: { o2Fraction: 0.21 },
  compartments: [], ndlMinutes: null, ceilingDepth: 0,
  decoStops: [], totalAscentTimeSec: 0,
  inDecompression: false, ascentRateAlarm: 'ok',
  isPostDive: false, erLock: false, noFlyTimeMinutes: 0, desaturationTimeMinutes: 0,
}

const MOCK_STATES: Record<DisplayMode, DiveState> = {
  surface: {
    ...BASE_STATE,
    timeSec: 0, depth: 0, maxDepth: 0,
    tankPressure: 197, waterTemp: 14,
  },
  'dive-ok': {
    ...BASE_STATE,
    timeSec: 1080, depth: 20.0, maxDepth: 20.0,
    tankPressure: 163, waterTemp: 12,
    ndlMinutes: 23,
  },
  'dive-deco': {
    ...BASE_STATE,
    timeSec: 2400, depth: 30.0, maxDepth: 40.0,
    tankPressure: 89, waterTemp: 10,
    ndlMinutes: null, ceilingDepth: 3.2,
    decoStops: [{ depth: 3, durationSec: 360 }],
    totalAscentTimeSec: 480,
    inDecompression: true,
  },
  'post-dive': {
    ...BASE_STATE,
    timeSec: 2580, depth: 0, maxDepth: 40.0,
    tankPressure: 45, waterTemp: 10,
    isPostDive: true,
    noFlyTimeMinutes: 720,
    desaturationTimeMinutes: 1440,
  },
}

export default function CalibrationPage() {
  const navigate = useNavigate()
  const { selectedComputerSlug } = useStore()
  const { isCalibrating, toggleCalibration, panelMode, setPanelMode } = useCalibrationStore()

  // Ensure calibration mode is on for this page
  useEffect(() => {
    if (!isCalibrating) toggleCalibration()
    // Default to surface mode when entering
    setPanelMode('surface')
    return () => {
      if (useCalibrationStore.getState().isCalibrating) toggleCalibration()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeMode: DisplayMode = panelMode ?? 'surface'
  const mockState = MOCK_STATES[activeMode]

  const entry = getComputerEntry(selectedComputerSlug)
  const ComputerComponent = entry?.Component

  const calibOverridesObj = useCalibrationStore(s => s.overrides[selectedComputerSlug])
  const mergedCalibConfigs = useMemo(
    () => mergeConfigs(ZOOP_NOVO_DEFAULTS, calibOverridesObj ?? {}),
    [calibOverridesObj],
  )

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← Accueil
        </button>
        <h1 className="text-white font-semibold flex-1 text-center text-sm">
          🔧 Calibration — {entry?.label ?? selectedComputerSlug}
        </h1>
        <span className="text-xs text-gray-500 italic">
          Outil de réglage des positions d'affichage
        </span>
      </div>

      {/* Main — watch preview centered */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 px-4">
        <div className="text-center text-gray-400 text-sm max-w-md mb-2">
          <p>
            Glisse les champs directement sur la montre pour les repositionner.
            Utilise le panneau à droite pour régler la police, la taille et l'alignement.
          </p>
          <p className="mt-1 text-gray-500 text-xs">
            Onglets ci-dessous = changer le mode d'affichage prévisualisé · Flèches clavier = ±0.25% (Shift = ±1%)
          </p>
        </div>

        {/* Mode preview tabs */}
        <div className="flex gap-2 mb-2">
          {(Object.keys(DISPLAY_MODE_LABELS) as DisplayMode[]).map(m => (
            <button
              key={m}
              onClick={() => setPanelMode(m)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                m === activeMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
              ].join(' ')}
            >
              {DISPLAY_MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {ComputerComponent && <ComputerComponent state={mockState} scale={0.9} />}

        <p className="text-gray-600 text-xs mt-1">
          Valeurs fictives — uniquement pour positionner les champs
        </p>
      </div>

      {/* Calibration panel — always open on this page */}
      <CalibrationPanel
        computerSlug={selectedComputerSlug}
        currentMode={activeMode}
        mergedConfigs={mergedCalibConfigs}
        onClose={() => navigate('/')}
      />
    </div>
  )
}
