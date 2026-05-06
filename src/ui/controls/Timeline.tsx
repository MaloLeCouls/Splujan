import type { DiveEvent } from '../../types'

type Props = {
  currentTimeSec: number
  totalDurationSec: number
  events: DiveEvent[]
  onSeek: (timeSec: number) => void
}

function fmtMM_SS(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const EVENT_COLORS: Record<string, string> = {
  panic: '#ef4444',
  ooa: '#dc2626',
  rapid_ascent: '#f97316',
  skip_stop: '#eab308',
  sac_change: '#3b82f6',
}

export default function Timeline({ currentTimeSec, totalDurationSec, events, onSeek }: Props) {
  const progress = totalDurationSec > 0 ? currentTimeSec / totalDurationSec : 0

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(Math.max(0, Math.min(1, ratio)) * totalDurationSec)
  }

  return (
    <div className="w-full select-none">
      {/* Track */}
      <div
        className="relative h-3 bg-gray-200 rounded-full cursor-pointer"
        onClick={handleClick}
      >
        {/* Progress */}
        <div
          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />

        {/* Event markers */}
        {events.map(ev => {
          const pos = (ev.triggerAtSec / totalDurationSec) * 100
          return (
            <div
              key={ev.id}
              className="absolute top-[-4px] w-2 h-5 -translate-x-1/2"
              style={{ left: `${pos}%`, backgroundColor: EVENT_COLORS[ev.type] ?? '#6b7280' }}
              title={ev.type}
            />
          )
        })}

        {/* Scrub handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      {/* Timestamps */}
      <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
        <span>00:00</span>
        <span className="text-blue-700 font-medium">{fmtMM_SS(currentTimeSec)}</span>
        <span>{fmtMM_SS(totalDurationSec)}</span>
      </div>
    </div>
  )
}
