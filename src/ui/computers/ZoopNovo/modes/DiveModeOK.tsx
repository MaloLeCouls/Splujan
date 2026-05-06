import type { DiveState } from '../../../../types'

type Props = { state: DiveState }

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

function WetContact({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke="#1b2b08" strokeWidth="1.2" strokeLinecap="round">
      <path d={`M ${x + 1} ${y + 7} A 4 4 0 0 1 ${x + 1} ${y - 1}`} />
      <path d={`M ${x + 4.5} ${y + 9} A 7 7 0 0 1 ${x + 4.5} ${y - 3}`} />
      <path d={`M ${x + 8} ${y + 11} A 10 10 0 0 1 ${x + 8} ${y - 5}`} />
    </g>
  )
}

function fmtDepth(d: number) {
  return d.toFixed(1)
}

function fmtClock() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function DiveModeOK({ state }: Props) {
  const ndl = state.ndlMinutes !== null ? Math.floor(state.ndlMinutes) : null
  const diveMin = Math.floor(state.timeSec / 60)
  const diveSec = Math.floor(state.timeSec % 60)
  const diveTimeStr = `${diveMin.toString().padStart(2, '0')}:${diveSec.toString().padStart(2, '0')}`
  const clockStr = fmtClock()
  const isAlarm = state.ascentRateAlarm !== 'ok'

  return (
    <g>
      {/* Row 1 — wet contact, depth, battery */}
      <WetContact x={5} y={13} />
      <Battery x={148} y={6} />

      <text x="118" y="26" textAnchor="end" fontSize="27" className="lcd-digit">
        {fmtDepth(state.depth)}
      </text>
      <text x="122" y="19" fontSize="10" className="lcd-alpha">m</text>

      <line x1="4" y1="32" x2="162" y2="32" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* NDL — dominant element */}
      {ndl !== null ? (
        <text
          x="83" y="90"
          textAnchor="middle"
          fontSize="54"
          className={`lcd-digit${ndl <= 3 ? ' zn-blink' : ''}`}
        >
          {ndl.toString().padStart(2, ' ')}
        </text>
      ) : (
        <text x="83" y="90" textAnchor="middle" fontSize="54" className="lcd-digit">
          --
        </text>
      )}

      <text x="83" y="103" textAnchor="middle" fontSize="8.5" className="lcd-alpha">
        NO DEC TIME
      </text>

      <line x1="4" y1="111" x2="162" y2="111" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Ascent rate alarm */}
      {isAlarm && (
        <text
          x="83" y="128"
          textAnchor="middle"
          fontSize="13"
          className={`lcd-alpha zn-blink ${state.ascentRateAlarm === 'danger' ? 'alarm-red' : 'alarm-orange'}`}
        >
          SLOW
        </text>
      )}

      {/* Bottom row — clock time + dive elapsed */}
      <text x="38" y={isAlarm ? 152 : 145} textAnchor="middle" fontSize="16" className="lcd-digit">
        {clockStr}
      </text>
      <text x="38" y={isAlarm ? 163 : 156} textAnchor="middle" fontSize="7" className="lcd-alpha">
        TIME
      </text>

      <text x="128" y={isAlarm ? 152 : 145} textAnchor="middle" fontSize="16" className="lcd-digit">
        {diveTimeStr}
      </text>
      <text x="128" y={isAlarm ? 163 : 156} textAnchor="middle" fontSize="7" className="lcd-alpha">
        DIVE TIME
      </text>

      {/* Max depth small indicator */}
      <text x="83" y="183" textAnchor="middle" fontSize="8" className="lcd-alpha lcd-ghost">
        MAX {state.maxDepth.toFixed(1)}m
      </text>
    </g>
  )
}
