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
  // Build the decompression status label
  let decoStatus: React.ReactNode
  if (state.inDecompression) {
    decoStatus = (
      <abbr
        title="Décompression obligatoire — le plongeur doit effectuer des paliers avant de remonter en surface. Remonter sans palier est dangereux (accident de décompression)."
        style={{ textDecoration: 'none', cursor: 'help' }}
        className="text-red-600 font-semibold"
      >
        ⚠ Déco obligatoire
      </abbr>
    )
  } else if (state.ndlMinutes !== null) {
    const ndl = Math.floor(state.ndlMinutes)
    decoStatus = (
      <abbr
        title={`NDL (No Decompression Limit) = Limite sans décompression. Il reste ${ndl} min avant que les paliers de décompression ne deviennent obligatoires. Au-delà, le plongeur doit faire des arrêts pour dégazer.`}
        style={{ textDecoration: 'none', cursor: 'help' }}
        className={ndl <= 5 ? 'text-orange-600 font-semibold' : 'text-gray-500'}
      >
        {ndl <= 5 ? `⚠ Sans déco : ${ndl} min` : `Sans déco : ${ndl} min`}
      </abbr>
    )
  } else {
    decoStatus = <span className="text-gray-400">—</span>
  }

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
          title="Revenir au début de la simulation"
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

      {/* Status — temps · profondeur · état déco */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
        <span
          title="Temps écoulé depuis le début de la plongée (minutes:secondes)"
          style={{ cursor: 'help' }}
        >
          T+{fmtMM_SS(currentTimeSec)}
        </span>
        <span className="text-gray-300">·</span>
        <span title="Profondeur actuelle en mètres" style={{ cursor: 'help' }}>
          {state.depth.toFixed(1)} m
        </span>
        <span className="text-gray-300">·</span>
        {decoStatus}
      </div>
    </div>
  )
}
