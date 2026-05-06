import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { Simulator } from '../../engine/simulator'
import { getComputerEntry, listUIComputers } from '../computers/ui-registry'
import PlaybackControls from '../controls/PlaybackControls'
import type { Speed } from '../controls/SpeedSelector'

export default function SimulationPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const { profiles, isPresentationMode, togglePresentationMode, selectedComputerSlug, setSelectedComputer } = useStore()

  const profile = profiles.find(p => p.id === profileId)

  const simulator = useMemo(
    () => (profile ? new Simulator(profile) : null),
    [profile],
  )

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [showComputerMenu, setShowComputerMenu] = useState(false)

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  const tick = useCallback(
    (ts: number) => {
      if (lastTsRef.current === null) {
        lastTsRef.current = ts
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setCurrentTime(t => {
        const next = t + dt * speed
        if (simulator && next >= simulator.totalDurationSec) {
          setIsPlaying(false)
          return simulator.totalDurationSec
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    },
    [speed, simulator],
  )

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
      return
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, tick])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying(p => !p)
      }
      if (e.code === 'ArrowLeft') setCurrentTime(t => Math.max(0, t - 30))
      if (e.code === 'ArrowRight') setCurrentTime(t => Math.min(t + 30, simulator?.totalDurationSec ?? 0))
      if (e.code === 'Escape' && isPresentationMode) togglePresentationMode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPresentationMode, simulator, togglePresentationMode])

  if (!profile || !simulator) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Profil introuvable.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">
          Retour à l'accueil
        </button>
      </div>
    )
  }

  const state = simulator.getStateAt(currentTime)
  const entry = getComputerEntry(selectedComputerSlug)
  const ComputerComponent = entry?.Component

  // ── Presentation (classroom) mode ─────────────────────────────────────────
  if (isPresentationMode) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center gap-6">
        {ComputerComponent && <ComputerComponent state={state} scale={1.2} />}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 text-lg"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={togglePresentationMode}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
          >
            Quitter (ESC)
          </button>
        </div>
        <div className="w-96">
          <PlaybackControls
            currentTimeSec={currentTime}
            totalDurationSec={simulator.totalDurationSec}
            isPlaying={isPlaying}
            speed={speed}
            events={profile.events}
            state={state}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onReset={() => { setCurrentTime(0); setIsPlaying(false) }}
            onSeek={setCurrentTime}
            onSpeedChange={setSpeed}
          />
        </div>
      </div>
    )
  }

  // ── Normal mode ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Accueil
        </button>
        <h2 className="font-semibold text-gray-900 truncate flex-1 text-center">{profile.name}</h2>

        {/* Computer switcher */}
        <div className="relative">
          <button
            onClick={() => setShowComputerMenu(m => !m)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
            title="Changer d'ordinateur"
          >
            <img
              src={`/computers/${selectedComputerSlug}.png`}
              alt=""
              className="w-5 h-5 rounded object-cover"
            />
            {entry?.label ?? selectedComputerSlug}
            <span className="text-gray-400">▾</span>
          </button>

          {showComputerMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2 min-w-[180px]">
              {listUIComputers().map(c => (
                <button
                  key={c.slug}
                  onClick={() => { setSelectedComputer(c.slug); setShowComputerMenu(false) }}
                  className={[
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                    c.slug === selectedComputerSlug
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700',
                  ].join(' ')}
                >
                  <img src={`/computers/${c.slug}.png`} alt="" className="w-6 h-6 rounded object-cover" />
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={togglePresentationMode}
          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-700"
        >
          Mode classe
        </button>
      </div>

      {/* Main: computer + controls */}
      <div className="flex flex-col items-center gap-6 py-8 px-4">
        {ComputerComponent && <ComputerComponent state={state} scale={0.75} />}
        <div className="w-full max-w-xl">
          <PlaybackControls
            currentTimeSec={currentTime}
            totalDurationSec={simulator.totalDurationSec}
            isPlaying={isPlaying}
            speed={speed}
            events={profile.events}
            state={state}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onReset={() => { setCurrentTime(0); setIsPlaying(false) }}
            onSeek={setCurrentTime}
            onSpeedChange={setSpeed}
          />
        </div>
      </div>
    </div>
  )
}
