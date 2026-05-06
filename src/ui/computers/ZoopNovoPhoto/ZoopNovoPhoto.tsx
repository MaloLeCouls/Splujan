import type { DiveComputerProps } from '../types'
import './ZoopNovoPhoto.css'

// ── Design reference: 640×640 px ─────────────────────────────────────────────
// All positions are % of the square container (matching dive-computer.html).
// LCD area: left 31–69 %, top 26–76 %.

const BASE = 640   // design reference in px

type DisplayMode = 'surface' | 'dive-ok' | 'dive-deco' | 'post-dive'

function getMode(depth: number, maxDepth: number, inDeco: boolean, isPostDive: boolean): DisplayMode {
  if (isPostDive) return 'post-dive'
  if (depth < 0.5 && maxDepth === 0) return 'surface'
  if (inDeco) return 'dive-deco'
  return 'dive-ok'
}

function pad2(n: number) { return String(Math.max(0, Math.floor(n))).padStart(2, '0') }
function fmtDepth(m: number) { return Math.max(0, m).toFixed(1) }
function fmtClock() {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
function fmtHM(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return h > 0 ? `${h}H${pad2(m)}` : `${m}MIN`
}

export default function ZoopNovoPhoto({ state, scale = 1 }: DiveComputerProps) {
  const sz = BASE * scale   // actual container size in px
  const f  = sz / BASE      // scaling factor

  // font sizes (px) — calibrated from dive-computer.html max values
  const fs = {
    depth:   Math.round(60 * f),
    ndl:     Math.round(52 * f),
    time:    Math.round(30 * f),
    speaker: Math.round(22 * f),
    unit:    Math.round(16 * f),
    ac:      Math.round(14 * f),
    label:   Math.round(11 * f),
    ndec:    Math.round(12 * f),
    deco_lg: Math.round(50 * f),   // ceiling depth
    deco_md: Math.round(28 * f),   // DTR value
    post_lg: Math.round(30 * f),   // dive duration
    post_md: Math.round(24 * f),   // max depth / temp
    post_sm: Math.round(18 * f),   // no-fly / desat
    header:  Math.round(13 * f),
  }

  const mode = getMode(state.depth, state.maxDepth, state.inDecompression, state.isPostDive)
  const ndl = state.ndlMinutes !== null ? Math.floor(state.ndlMinutes) : null
  const diveMin = Math.floor(state.timeSec / 60)
  const noFlyAlarm = state.ascentRateAlarm !== 'ok'

  // ── Field factory ─────────────────────────────────────────────────────────
  type FieldProps = {
    left?: string; right?: string; top: string
    width?: string
    fontSize: number
    fontFamily: string
    align?: 'center' | 'right' | 'left'
    className?: string
    children: React.ReactNode
  }

  function Field({ left, right, top, width, fontSize, fontFamily, align = 'left', className = '', children }: FieldProps) {
    return (
      <div
        className={`znp-field ${align === 'center' ? 'center' : align === 'right' ? 'right' : ''} ${className}`}
        style={{ left, right, top, width, fontSize, fontFamily }}
      >
        {children}
      </div>
    )
  }

  // ── Mode: SURFACE ──────────────────────────────────────────────────────────
  function SurfaceOverlay() {
    const d = new Date()
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()
    return (
      <>
        {/* Time — dominant */}
        <Field left="27%" top="42%" width="46%" fontSize={fs.depth} fontFamily="Iceland, monospace" align="center">
          {fmtClock()}
        </Field>
        {/* Date */}
        <Field left="30%" top="53%" width="40%" fontSize={fs.time * 0.7} fontFamily="Share Tech Mono, monospace" align="center">
          {dateStr}
        </Field>
        {/* Temp */}
        <Field left="31%" top="60%" fontSize={fs.time} fontFamily="Iceland, monospace">
          {Math.round(state.waterTemp)}
          <span style={{ fontSize: fs.unit, fontFamily: 'DotGothic16, monospace', marginLeft: 2 }}>°C</span>
        </Field>
        <Field left="31%" top="67%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          TEMP
        </Field>
        {/* Mode AIR */}
        <Field left="55%" top="60%" fontSize={fs.time} fontFamily="Iceland, monospace">
          AIR
        </Field>
        <Field left="55%" top="67%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace">
          MODE
        </Field>
      </>
    )
  }

  // ── Mode: DIVE OK ─────────────────────────────────────────────────────────
  function DiveOKOverlay() {
    return (
      <>
        {/* Speaker / wet contact */}
        <Field left="32%" top="30%" fontSize={fs.speaker} fontFamily="VT323, monospace">
          ((-
        </Field>
        {/* Depth */}
        <Field left="38%" top="27%" width="24%" fontSize={fs.depth} fontFamily="Iceland, monospace" align="center">
          {fmtDepth(state.depth)}
        </Field>
        {/* AC + m */}
        <Field left="62.5%" top="29%" fontSize={fs.ac} fontFamily="DotGothic16, monospace">
          AC
        </Field>
        <Field left="62.5%" top="34%" fontSize={fs.unit} fontFamily="DotGothic16, monospace">
          m
        </Field>

        {/* NDL — dominant */}
        <Field
          left="48%" top="43%" width="16%"
          fontSize={fs.ndl} fontFamily="VT323, monospace" align="center"
          className={ndl !== null && ndl <= 3 ? 'znp-blink' : ''}
        >
          {ndl !== null ? pad2(ndl) : '--'}
        </Field>
        <Field left="51%" top="53%" fontSize={fs.ndec} fontFamily="Share Tech Mono, monospace">
          NO DEC TIME
        </Field>

        {/* SLOW alarm */}
        {noFlyAlarm && (
          <Field
            left="33%" top="57%" width="34%"
            fontSize={fs.ndec * 1.1} fontFamily="Share Tech Mono, monospace" align="center"
            className={`znp-blink ${state.ascentRateAlarm === 'danger' ? 'znp-alarm-red' : 'znp-alarm-orange'}`}
          >
            SLOW
          </Field>
        )}

        {/* Bottom row: TIME | DIVE TIME */}
        <div className="znp-sep" style={{ left: '50%', top: '60%', height: '7%' }} />
        <Field left="33%" top="60%" width="16%" fontSize={fs.time} fontFamily="Iceland, monospace" align="center">
          {fmtClock()}
        </Field>
        <Field left="54%" top="60%" width="12%" fontSize={fs.time} fontFamily="Iceland, monospace" align="center">
          {pad2(diveMin)}
        </Field>
        <Field left="33%" top="67%" width="16%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          TIME
        </Field>
        <Field left="54%" top="67%" width="12%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          DIVE TIME
        </Field>

        {/* Ghost: max depth */}
        <Field left="35%" top="72%" width="30%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center" className="znp-ghost">
          MAX {state.maxDepth.toFixed(1)}m
        </Field>
      </>
    )
  }

  // ── Mode: DIVE DECO ───────────────────────────────────────────────────────
  function DiveDecoOverlay() {
    const firstStop = state.decoStops[0]
    const stopDepth = firstStop?.depth ?? Math.ceil(state.ceilingDepth / 3) * 3
    const dtrMin = Math.ceil(state.totalAscentTimeSec / 60)

    return (
      <>
        {/* Depth */}
        <Field left="38%" top="27%" width="24%" fontSize={fs.depth} fontFamily="Iceland, monospace" align="center">
          {fmtDepth(state.depth)}
        </Field>
        <Field left="62.5%" top="34%" fontSize={fs.unit} fontFamily="DotGothic16, monospace">m</Field>

        {/* STOP — blinking red */}
        <Field left="31%" top="38%" fontSize={fs.header} fontFamily="Share Tech Mono, monospace" className="znp-alarm-red znp-blink">
          STOP
        </Field>

        {/* Ceiling depth — dominant */}
        <Field left="43%" top="38%" width="22%" fontSize={fs.deco_lg} fontFamily="Iceland, monospace" align="center">
          {stopDepth}
        </Field>
        <Field left="65%" top="40%" fontSize={fs.unit} fontFamily="DotGothic16, monospace">m</Field>

        {/* DTR */}
        <Field left="31%" top="56%" width="16%" fontSize={fs.deco_md} fontFamily="Iceland, monospace" align="center">
          {dtrMin}
        </Field>
        <Field left="31%" top="63%" width="16%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          DTR MIN
        </Field>

        {/* DIVE TIME */}
        <Field left="52%" top="56%" width="16%" fontSize={fs.time} fontFamily="Iceland, monospace" align="center">
          {pad2(diveMin)}
        </Field>
        <Field left="52%" top="63%" width="16%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          DIVE TIME
        </Field>
      </>
    )
  }

  // ── Mode: POST-DIVE ───────────────────────────────────────────────────────
  function PostDiveOverlay() {
    return (
      <>
        {/* Header */}
        <Field left="31%" top="28%" width="38%" fontSize={fs.header} fontFamily="Share Tech Mono, monospace" align="center">
          FIN PLONGÉE
        </Field>

        {/* Duration — dominant */}
        <Field left="31%" top="36%" width="38%" fontSize={fs.post_lg} fontFamily="Iceland, monospace" align="center">
          {pad2(Math.floor(state.timeSec / 60))}:{pad2(Math.floor(state.timeSec % 60))}
        </Field>
        <Field left="31%" top="46%" width="38%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          DURÉE PLONGÉE
        </Field>

        {/* Max depth | Temp */}
        <Field left="31%" top="53%" width="16%" fontSize={fs.post_md} fontFamily="Iceland, monospace" align="center">
          {state.maxDepth.toFixed(1)}
        </Field>
        <Field left="47%" top="54%" fontSize={fs.unit * 0.9} fontFamily="DotGothic16, monospace">m</Field>
        <Field left="31%" top="60%" width="16%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          PROF MAX
        </Field>

        <Field left="56%" top="53%" width="13%" fontSize={fs.post_md} fontFamily="Iceland, monospace" align="center">
          {Math.round(state.waterTemp)}
        </Field>
        <Field left="69%" top="54%" fontSize={fs.unit * 0.9} fontFamily="DotGothic16, monospace">°C</Field>
        <Field left="56%" top="60%" width="13%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          TEMP EAU
        </Field>

        {/* No-fly | Desat */}
        <Field left="31%" top="65%" width="16%" fontSize={fs.post_sm} fontFamily="Iceland, monospace" align="center">
          {fmtHM(state.noFlyTimeMinutes)}
        </Field>
        <Field left="31%" top="71%" width="16%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          NO FLY
        </Field>

        <Field left="56%" top="65%" width="13%" fontSize={fs.post_sm} fontFamily="Iceland, monospace" align="center">
          {fmtHM(state.desaturationTimeMinutes)}
        </Field>
        <Field left="56%" top="71%" width="13%" fontSize={fs.label} fontFamily="Share Tech Mono, monospace" align="center">
          DÉSAT
        </Field>
      </>
    )
  }

  return (
    <div className="znp-watch" style={{ width: sz, height: sz }}>
      <img className="znp-bg" src="/computers/suunto-zoop-novo.png" alt="Suunto Zoop Novo" draggable={false} />

      {mode === 'surface'   && <SurfaceOverlay />}
      {mode === 'dive-ok'   && <DiveOKOverlay />}
      {mode === 'dive-deco' && <DiveDecoOverlay />}
      {mode === 'post-dive' && <PostDiveOverlay />}

      {/* Invisible click zones over the physical buttons */}
      <button className="znp-btn" style={{ left: '19%', top: '44%', width: '9%', height: '9%' }} aria-label="Select" title="SELECT" />
      <button className="znp-btn" style={{ right: '19%', top: '44%', width: '9%', height: '9%' }} aria-label="Mode" title="MODE" />
      <button className="znp-btn" style={{ left: '36%', top: '70%', width: '9%', height: '9%' }} aria-label="Down" title="DOWN" />
      <button className="znp-btn" style={{ right: '36%', top: '70%', width: '9%', height: '9%' }} aria-label="Up" title="UP" />
    </div>
  )
}
