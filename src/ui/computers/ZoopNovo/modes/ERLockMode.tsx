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

// ER lock — §3.16 manuel Zoop Novo
// Déclenché quand un palier obligatoire est ignoré > 3 min.
// Verrouillage algorithmique 48h — affiche "ER" clignotant.
export default function ERLockMode({ state }: Props) {
  return (
    <g>
      {/* Row 1 — depth + battery */}
      <Battery x={148} y={6} />

      <text x="118" y="26" textAnchor="end" fontSize="27" className="lcd-digit">
        {state.depth.toFixed(1)}
      </text>
      <text x="122" y="19" fontSize="10" className="lcd-alpha">m</text>

      <line x1="4" y1="32" x2="162" y2="32" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* ER — large, blinking */}
      <text
        x="83" y="120"
        textAnchor="middle"
        fontSize="72"
        className="lcd-alpha alarm-red zn-blink"
      >
        ER
      </text>

      <line x1="4" y1="142" x2="162" y2="142" stroke="#1b2b08" strokeWidth="0.5" opacity="0.35" />

      {/* Lock reminder */}
      <text x="83" y="162" textAnchor="middle" fontSize="9" className="lcd-alpha">
        ALGORITHME VERROUILLE
      </text>
      <text x="83" y="175" textAnchor="middle" fontSize="7.5" className="lcd-alpha lcd-ghost">
        CONSULTEZ UN MEDECIN
      </text>
    </g>
  )
}
