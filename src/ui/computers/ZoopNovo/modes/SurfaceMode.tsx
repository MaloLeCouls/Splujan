import type { DiveState } from '../../../../types'

type Props = { state: DiveState }

function Battery({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="18" height="9" rx="1.5"
        fill="none" stroke="#1b2b08" strokeWidth="1" />
      <rect x={x + 18} y={y + 2.5} width="2.5" height="4" rx="0.5" fill="#1b2b08" />
      <rect x={x + 1.5} y={y + 1.5} width="4" height="6" rx="0.5" fill="#1b2b08" />
      <rect x={x + 6.5} y={y + 1.5} width="4" height="6" rx="0.5" fill="#1b2b08" />
      <rect x={x + 11.5} y={y + 1.5} width="4" height="6" rx="0.5" fill="#1b2b08" />
    </g>
  )
}

function WetContact({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke="#1b2b08" strokeWidth="1.3" strokeLinecap="round">
      <path d={`M ${x + 1} ${y + 8} A 5 5 0 0 1 ${x + 1} ${y - 2}`} />
      <path d={`M ${x + 5} ${y + 11} A 8 8 0 0 1 ${x + 5} ${y - 5}`} />
      <path d={`M ${x + 9} ${y + 13} A 11 11 0 0 1 ${x + 9} ${y - 7}`} />
    </g>
  )
}

export default function SurfaceMode({ state }: Props) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()

  return (
    <g>
      <WetContact x={5} y={13} />
      <Battery x={145} y={6} />

      <line x1="4" y1="27" x2="162" y2="27" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Time — dominant */}
      <text x="83" y="74" textAnchor="middle" fontSize="36" className="lcd-digit">
        {timeStr}
      </text>

      {/* Date */}
      <text x="83" y="91" textAnchor="middle" fontSize="9" className="lcd-alpha">
        {dateStr}
      </text>

      <line x1="4" y1="102" x2="162" y2="102" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Temperature */}
      <text x="40" y="130" textAnchor="middle" fontSize="20" className="lcd-digit">
        {Math.round(state.waterTemp)}
      </text>
      <text x="58" y="123" fontSize="10" className="lcd-digit">o</text>
      <text x="64" y="130" fontSize="11" className="lcd-alpha">C</text>
      <text x="40" y="142" textAnchor="middle" fontSize="7" className="lcd-alpha">TEMP</text>

      {/* DIVE mode indicator */}
      <text x="124" y="130" textAnchor="middle" fontSize="22" className="lcd-alpha">DIVE</text>
      <text x="124" y="142" textAnchor="middle" fontSize="7" className="lcd-alpha">MODE</text>

      <line x1="4" y1="152" x2="162" y2="152" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Depth unit indicator (always shows the dive mode is metric) */}
      <text x="83" y="175" textAnchor="middle" fontSize="9" className="lcd-alpha lcd-ghost">
        METRES
      </text>
    </g>
  )
}
