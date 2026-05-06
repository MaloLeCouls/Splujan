import type { DiveState } from '../../../../types'

type Props = { state: DiveState }

function fmtMin(sec: number) {
  return Math.ceil(sec / 60).toString()
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function Battery({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="16" height="8" rx="1.5"
        fill="none" stroke="#1b2b08" strokeWidth="0.9" />
      <rect x={x + 16} y={y + 2} width="2" height="4" rx="0.5" fill="#1b2b08" />
      <rect x={x + 1.5} y={y + 1.5} width="3.5" height="5" rx="0.5" fill="#1b2b08" />
      <rect x={x + 5.5} y={y + 1.5} width="3.5" height="5" rx="0.5" fill="#1b2b08" />
      <rect x={x + 9.5} y={y + 1.5} width="3.5" height="5" rx="0.5" fill="#1b2b08" />
    </g>
  )
}

export default function DiveModeStop({ state }: Props) {
  // decoStops sorted deepest-first → [0] is the first required stop (deepest)
  const firstStop = state.decoStops[0]
  const stopDepth = firstStop?.depth ?? Math.ceil(state.ceilingDepth / 3) * 3
  const stopDurationSec = firstStop?.durationSec ?? 0
  const stopMinStr = fmtMin(stopDurationSec)
  const dtrMinStr = fmtMin(state.totalAscentTimeSec)
  const diveTimeStr = fmtTime(state.timeSec)

  return (
    <g>
      {/* Row 1 — depth + battery */}
      <Battery x={148} y={6} />

      <text x="118" y="26" textAnchor="end" fontSize="27" className="lcd-digit">
        {state.depth.toFixed(1)}
      </text>
      <text x="122" y="19" fontSize="10" className="lcd-alpha">m</text>

      <line x1="4" y1="32" x2="162" y2="32" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* STOP label — blinking */}
      <text x="30" y="68" textAnchor="middle" fontSize="15" className="lcd-alpha alarm-red zn-blink">
        STOP
      </text>

      {/* Stop depth — prominent */}
      <text x="95" y="72" textAnchor="middle" fontSize="34" className="lcd-digit">
        {stopDepth.toString().padStart(2, ' ')}
      </text>
      <text x="130" y="64" fontSize="11" className="lcd-alpha">m</text>

      {/* Stop duration */}
      <text x="162" y="72" textAnchor="end" fontSize="18" className="lcd-digit">
        {stopMinStr}
      </text>
      <text x="162" y="82" textAnchor="end" fontSize="6.5" className="lcd-alpha">MIN</text>

      <line x1="4" y1="90" x2="162" y2="90" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* DTR */}
      <text x="42" y="130" textAnchor="middle" fontSize="26" className="lcd-digit">
        {dtrMinStr}
      </text>
      <text x="42" y="142" textAnchor="middle" fontSize="7" className="lcd-alpha">DTR MIN</text>

      {/* Dive time */}
      <text x="124" y="130" textAnchor="middle" fontSize="20" className="lcd-digit">
        {diveTimeStr}
      </text>
      <text x="124" y="142" textAnchor="middle" fontSize="7" className="lcd-alpha">DIVE TIME</text>

      <line x1="4" y1="150" x2="162" y2="150" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* All stops summary (up to 3) */}
      {state.decoStops.slice(0, 3).map((s, i) => (
        <g key={s.depth}>
          <text
            x={20 + i * 52} y="172"
            textAnchor="middle" fontSize="11" className="lcd-digit"
          >
            {s.depth}
          </text>
          <text x={20 + i * 52} y="183" textAnchor="middle" fontSize="6" className="lcd-alpha">
            {fmtMin(s.durationSec)}m
          </text>
        </g>
      ))}
    </g>
  )
}
