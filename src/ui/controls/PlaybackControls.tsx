import Timeline from './Timeline'
import SpeedSelector, { type Speed } from './SpeedSelector'
import type { DiveEvent, DiveState } from '../../types'

type Props = {
  currentTimeSec: number
  totalDurationSec: number
  isPlaying: boolean
  speed: Speed
  events: DiveEvent[]
  state: DiveState
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSeek: (timeSec: number) => void
  onSpeedChange: (speed: Speed) => void
}

function fmtMM_SS(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function PlaybackControls({
  currentTimeSec,
  totalDurationSec,
  isPlaying,
  speed,
  events,
  state,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onSpeedChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3 w-full max-w-xl">
      <Timeline
        currentTimeSec={currentTimeSec}
        totalDurationSec={totalDurationSec}
        events={events}
        onSeek={onSeek}
      />

      <div className="flex items-center gap-3">
        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Retour au début"
        >
          ⏮
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          {isPlaying ? '⏸ Pause' : '▶ Lecture'}
        </button>

        {/* Speed */}
        <SpeedSelector speed={speed} onChange={onSpeedChange} />
      </div>

      {/* Status subtitle */}
      <p className="text-xs text-gray-500 font-mono">
        T+{fmtMM_SS(currentTimeSec)} · {state.depth.toFixed(1)} m ·{' '}
        {state.inDecompression ? '⚠ DECO' : state.ndlMinutes !== null ? `NDL ${Math.floor(state.ndlMinutes)} min` : '—'}
      </p>
    </div>
  )
}
