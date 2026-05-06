import type { DiveComputerProps } from '../types'
import SurfaceMode from './modes/SurfaceMode'
import DiveModeOK from './modes/DiveModeOK'
import DiveModeStop from './modes/DiveModeStop'
import PostDiveMode from './modes/PostDiveMode'
import ERLockMode from './modes/ERLockMode'
import './styles.css'

const W = 210
const H = 255
export const SCR = { x: 22, y: 28, w: 166, h: 192 } as const

export default function ZoopNovo({ state, scale = 1, onButtonPress }: DiveComputerProps) {
  function renderScreen() {
    if (state.erLock)        return <ERLockMode state={state} />
    if (state.isPostDive)    return <PostDiveMode state={state} />
    if (state.depth < 0.5 && state.maxDepth === 0) return <SurfaceMode state={state} />
    if (state.inDecompression) return <DiveModeStop state={state} />
    return <DiveModeOK state={state} />
  }

  return (
    <svg
      className="zoop-novo"
      width={W * scale}
      height={H * scale}
      viewBox={`0 0 ${W} ${H}`}
      aria-label="Suunto Zoop Novo"
    >
      <defs>
        <radialGradient id="zn-body" cx="38%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#42A5F5" />
          <stop offset="45%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#0A2157" />
        </radialGradient>
        <linearGradient id="zn-btn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="zn-bezel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#0c0c0c" />
        </linearGradient>
        <linearGradient id="zn-reflect" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.09" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ambient shadow */}
      <rect x="9" y="12" width={W - 12} height={H - 14} rx="38" fill="rgba(0,0,0,0.32)" />

      {/* Body */}
      <rect x="5" y="5" width={W - 10} height={H - 10} rx="38" fill="url(#zn-body)" />

      {/* Rim highlight */}
      <rect x="5" y="5" width={W - 10} height={H - 10} rx="38"
        fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

      {/* Inner bezel ring */}
      <rect x="16" y="22" width={W - 32} height={H - 44} rx="27"
        fill="url(#zn-bezel)" />

      {/* LCD screen */}
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx="5" fill="#9aaa6e" />

      {/* Screen content */}
      <g transform={`translate(${SCR.x}, ${SCR.y})`}>
        <svg width={SCR.w} height={SCR.h} viewBox={`0 0 ${SCR.w} ${SCR.h}`}>
          <style>{`
            .lcd-digit { font-family:'DSEG7Modern','Courier New',monospace; font-weight:bold; fill:#1b2b08; }
            .lcd-alpha { font-family:'DSEG14Modern','Courier New',monospace; fill:#1b2b08; }
            .lcd-ghost { opacity:0.22; fill:#1b2b08; }
            .alarm-red   { fill:#c01000; }
            .alarm-orange{ fill:#b05800; }
          `}</style>
          {renderScreen()}
        </svg>
      </g>

      {/* Glass reflection overlay */}
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx="5"
        fill="url(#zn-reflect)" />

      {/* SUUNTO branding */}
      <text x={W / 2} y="18" textAnchor="middle"
        fontSize="6.5" fontFamily="Arial,sans-serif" fontWeight="bold"
        letterSpacing="3.8" fill="rgba(255,255,255,0.78)">
        SUUNTO
      </text>

      {/* Bottom labels */}
      <text x="52" y={H - 7} textAnchor="middle"
        fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold"
        letterSpacing="0.8" fill="rgba(255,255,255,0.58)">
        DOWN
      </text>
      <text x={W - 52} y={H - 7} textAnchor="middle"
        fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold"
        letterSpacing="0.8" fill="rgba(255,255,255,0.58)">
        UP
      </text>

      {/* LEFT — SELECT button (play/pause) */}
      <text x="8" y="74" textAnchor="middle"
        fontSize="4.2" fontFamily="Arial,sans-serif" fontWeight="bold"
        letterSpacing="0.3" fill="rgba(255,255,255,0.58)">
        SELECT
      </text>
      <rect x="1" y="77" width="12" height="23" rx="3" fill="url(#zn-btn)" stroke="#111" strokeWidth="0.5"
        onClick={() => onButtonPress?.('select')} style={{ cursor: onButtonPress ? 'pointer' : 'default' }} />
      <rect x="3" y="79.5" width="8" height="3.5" rx="1" fill="rgba(255,255,255,0.08)"
        style={{ pointerEvents: 'none' }} />

      {/* LEFT — DOWN button (seek −30 s) */}
      <rect x="1" y="160" width="12" height="23" rx="3" fill="url(#zn-btn)" stroke="#111" strokeWidth="0.5"
        onClick={() => onButtonPress?.('down')} style={{ cursor: onButtonPress ? 'pointer' : 'default' }} />
      <rect x="3" y="162.5" width="8" height="3.5" rx="1" fill="rgba(255,255,255,0.08)"
        style={{ pointerEvents: 'none' }} />

      {/* RIGHT — MODE button (toggle mode) */}
      <text x={W - 8} y="74" textAnchor="middle"
        fontSize="4.2" fontFamily="Arial,sans-serif" fontWeight="bold"
        letterSpacing="0.3" fill="rgba(255,255,255,0.58)">
        MODE
      </text>
      <rect x={W - 13} y="77" width="12" height="23" rx="3" fill="url(#zn-btn)" stroke="#111" strokeWidth="0.5"
        onClick={() => onButtonPress?.('mode')} style={{ cursor: onButtonPress ? 'pointer' : 'default' }} />
      <rect x={W - 11} y="79.5" width="8" height="3.5" rx="1" fill="rgba(255,255,255,0.08)"
        style={{ pointerEvents: 'none' }} />

      {/* RIGHT — UP button (seek +30 s) */}
      <rect x={W - 13} y="160" width="12" height="23" rx="3" fill="url(#zn-btn)" stroke="#111" strokeWidth="0.5"
        onClick={() => onButtonPress?.('up')} style={{ cursor: onButtonPress ? 'pointer' : 'default' }} />
      <rect x={W - 11} y="162.5" width="8" height="3.5" rx="1" fill="rgba(255,255,255,0.08)"
        style={{ pointerEvents: 'none' }} />
    </svg>
  )
}
