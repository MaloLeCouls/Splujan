import type { DiveState } from '../../../../types'

type Props = { state: DiveState }

function fmtHM(minutes: number) {
  if (minutes <= 0) return '0'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}H${m.toString().padStart(2, '0')}` : `${m}MIN`
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function PostDiveMode({ state }: Props) {
  return (
    <g>
      {/* Header */}
      <text x="83" y="18" textAnchor="middle" fontSize="9.5" className="lcd-alpha">
        FIN PLONGEE
      </text>

      <line x1="4" y1="24" x2="162" y2="24" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Dive duration — dominant */}
      <text x="83" y="64" textAnchor="middle" fontSize="30" className="lcd-digit">
        {fmtDuration(state.timeSec)}
      </text>
      <text x="83" y="76" textAnchor="middle" fontSize="7.5" className="lcd-alpha">DUREE PLONGEE</text>

      <line x1="4" y1="84" x2="162" y2="84" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Max depth */}
      <text x="42" y="114" textAnchor="middle" fontSize="22" className="lcd-digit">
        {state.maxDepth.toFixed(1)}
      </text>
      <text x="82" y="107" fontSize="10" className="lcd-alpha">m</text>
      <text x="42" y="126" textAnchor="middle" fontSize="7" className="lcd-alpha">PROF MAX</text>

      {/* Water temp */}
      <text x="130" y="114" textAnchor="middle" fontSize="20" className="lcd-digit">
        {Math.round(state.waterTemp)}
      </text>
      <text x="150" y="107" fontSize="9" className="lcd-digit">o</text>
      <text x="155" y="114" fontSize="10" className="lcd-alpha">C</text>
      <text x="130" y="126" textAnchor="middle" fontSize="7" className="lcd-alpha">TEMP EAU</text>

      <line x1="4" y1="134" x2="162" y2="134" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* No-fly time */}
      <text x="42" y="160" textAnchor="middle" fontSize="18" className="lcd-digit">
        {fmtHM(state.noFlyTimeMinutes)}
      </text>
      <text x="42" y="172" textAnchor="middle" fontSize="7" className="lcd-alpha">NO FLY</text>

      {/* Desaturation time */}
      <text x="124" y="160" textAnchor="middle" fontSize="18" className="lcd-digit">
        {fmtHM(state.desaturationTimeMinutes)}
      </text>
      <text x="124" y="172" textAnchor="middle" fontSize="7" className="lcd-alpha">DESAT</text>

      <line x1="4" y1="178" x2="162" y2="178" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Surface interval hint */}
      <text x="83" y="189" textAnchor="middle" fontSize="7" className="lcd-alpha lcd-ghost">
        INTERVALLE SURFACE
      </text>
    </g>
  )
}
