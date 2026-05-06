import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { Simulator } from '../../engine/simulator'
import { DEFAULT_COMPUTER_SLUG, getComputerEntry } from '../computers/ui-registry'
import PlaybackControls from '../controls/PlaybackControls'
import type { Speed } from '../controls/SpeedSelector'

export default function SimulationPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const { profiles, isPresentationMode, togglePresentationMode } = useStore()

  const profile = profiles.find(p => p.id === profileId)

  const simulator = useMemo(
    () => (profile ? new Simulator(profile) : null),
    [profile],
  )

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)

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

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying(p => !p)
      }
      if (e.code === 'ArrowLeft') {
        setCurrentTime(t => Math.max(0, t - 30))
      }
      if (e.code === 'ArrowRight') {
        setCurrentTime(t =>
          Math.min(t + 30, simulator?.totalDurationSec ?? 0),
        )
      }
      if (e.code === 'Escape' && isPresentationMode) {
        togglePresentationMode()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPresentationMode, simulator, togglePresentationMode])

  const computerSlug = DEFAULT_COMPUTER_SLUG
  const computerEntry = getComputerEntry(computerSlug)
  const ComputerComponent = computerEntry?.Component

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

  if (isPresentationMode) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center gap-8">
        {ComputerComponent && <ComputerComponent state={state} scale={2.5} />}
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Retour
          </button>
          <h2 className="font-semibold text-gray-900 truncate max-w-xs">{profile.name}</h2>
          <button
            onClick={togglePresentationMode}
            className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700"
          >
            Mode classe
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          {ComputerComponent && <ComputerComponent state={state} scale={1.5} />}
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
