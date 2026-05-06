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
      {/* Dive duration — dominant */}
      <text x="83" y="58" textAnchor="middle" fontSize="30" className="lcd-digit">
        {fmtDuration(state.timeSec)}
      </text>
      <text x="83" y="70" textAnchor="middle" fontSize="7.5" className="lcd-alpha">
        DUREE PLONGEE
      </text>

      <line x1="4" y1="80" x2="162" y2="80" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Max depth */}
      <text x="42" y="110" textAnchor="middle" fontSize="22" className="lcd-digit">
        {state.maxDepth.toFixed(1)}
      </text>
      <text x="82" y="103" fontSize="10" className="lcd-alpha">m</text>
      <text x="42" y="122" textAnchor="middle" fontSize="7" className="lcd-alpha">PROF MAX</text>

      {/* Water temp */}
      <text x="130" y="110" textAnchor="middle" fontSize="20" className="lcd-digit">
        {Math.round(state.waterTemp)}
      </text>
      <text x="150" y="103" fontSize="9" className="lcd-digit">o</text>
      <text x="155" y="110" fontSize="10" className="lcd-alpha">C</text>
      <text x="130" y="122" textAnchor="middle" fontSize="7" className="lcd-alpha">TEMP EAU</text>

      <line x1="4" y1="132" x2="162" y2="132" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

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
    </g>
  )
}
