import { useRef } from 'react'
import type { DiveComputerProps } from '../types'
import type { FieldConfig, DisplayMode } from '../../calibration/types'
import { ZOOP_NOVO_DEFAULTS, mergeConfigs } from '../../calibration/zoop-novo-defaults'
import { useCalibrationStore } from '../../calibration/useCalibrationStore'
import FieldHandle from '../../calibration/FieldHandle'
import './ZoopNovoPhoto.css'

const SLUG = 'suunto-zoop-novo'
const BASE = 640

// ── Helpers ──────────────────────────────────────────────────────────────────
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

// ── Field component (module-level to avoid remount on every parent render) ───
function Field({ cfg, sz, className = '', children }: {
  cfg: FieldConfig | undefined
  sz: number
  className?: string
  children: React.ReactNode
}) {
  if (!cfg?.visible) return null
  return (
    <div
      className={`znp-field ${cfg.align === 'center' ? 'center' : cfg.align === 'right' ? 'right' : ''} ${className}`}
      style={{
        left:   cfg.left  !== undefined ? `${cfg.left}%`  : undefined,
        right:  cfg.right !== undefined ? `${cfg.right}%` : undefined,
        top:    `${cfg.top}%`,
        width:  cfg.width !== undefined ? `${cfg.width}%` : undefined,
        fontSize:   Math.round(cfg.fontSizeRatio * sz),
        fontFamily: `${cfg.fontFamily}, monospace`,
      }}
    >
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ZoopNovoPhoto({ state, scale = 1 }: DiveComputerProps) {
  const sz = BASE * scale
  const containerRef = useRef<HTMLDivElement>(null)

  const isCalibrating   = useCalibrationStore(s => s.isCalibrating)
  const selectedFieldId = useCalibrationStore(s => s.selectedFieldId)
  const panelMode       = useCalibrationStore(s => s.panelMode)
  const rawOverridesObj = useCalibrationStore(s => s.overrides[SLUG])
  const cfg = mergeConfigs(ZOOP_NOVO_DEFAULTS, rawOverridesObj ?? {})

  const mode     = getMode(state.depth, state.maxDepth, state.inDecompression, state.isPostDive)
  const ndl      = state.ndlMinutes !== null ? Math.floor(state.ndlMinutes) : null
  const diveMin  = Math.floor(state.timeSec / 60)
  const ascentAlarm = state.ascentRateAlarm !== 'ok'

  // ── SURFACE ────────────────────────────────────────────────────────────────
  const surfaceContent = mode === 'surface' && (() => {
    const d = new Date()
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()
    const unitFs = Math.round((cfg.surf_temp_val?.fontSizeRatio ?? 0.047) * sz * 0.53)
    return (
      <>
        <Field cfg={cfg.surf_clock} sz={sz}>{fmtClock()}</Field>
        <Field cfg={cfg.surf_date}  sz={sz}>{dateStr}</Field>
        <Field cfg={cfg.surf_temp_val} sz={sz}>
          {Math.round(state.waterTemp)}
          <span style={{ fontSize: unitFs, fontFamily: 'DotGothic16, monospace', marginLeft: 2 }}>°C</span>
        </Field>
        <Field cfg={cfg.surf_temp_lbl}  sz={sz}>TEMP</Field>
        <Field cfg={cfg.surf_mode_val}  sz={sz}>AIR</Field>
        <Field cfg={cfg.surf_mode_lbl}  sz={sz}>MODE</Field>
      </>
    )
  })()

  // ── DIVE OK ────────────────────────────────────────────────────────────────
  const diveOkContent = mode === 'dive-ok' && (
    <>
      <Field cfg={cfg.dok_speaker} sz={sz}>((‐</Field>
      <Field cfg={cfg.depth}       sz={sz}>{fmtDepth(state.depth)}</Field>
      <Field cfg={cfg.dok_ac_lbl}  sz={sz}>AC</Field>
      <Field cfg={cfg.depth_unit}  sz={sz}>m</Field>
      <Field cfg={cfg.ndl} sz={sz} className={ndl !== null && ndl <= 3 ? 'znp-blink' : ''}>
        {ndl !== null ? pad2(ndl) : '--'}
      </Field>
      <Field cfg={cfg.ndl_lbl} sz={sz}>NO DEC TIME</Field>
      {ascentAlarm && (
        <Field
          cfg={cfg.slow_alarm} sz={sz}
          className={`znp-blink ${state.ascentRateAlarm === 'danger' ? 'znp-alarm-red' : 'znp-alarm-orange'}`}
        >
          SLOW
        </Field>
      )}
      <div className="znp-sep" style={{ left: '50%', top: '60%', height: '7%' }} />
      <Field cfg={cfg.dok_clock}        sz={sz}>{fmtClock()}</Field>
      <Field cfg={cfg.dok_divetime}     sz={sz}>{pad2(diveMin)}</Field>
      <Field cfg={cfg.dok_clock_lbl}    sz={sz}>TIME</Field>
      <Field cfg={cfg.dok_divetime_lbl} sz={sz}>DIVE TIME</Field>
      <Field cfg={cfg.dok_maxdepth}     sz={sz} className="znp-ghost">
        MAX {state.maxDepth.toFixed(1)}m
      </Field>
    </>
  )

  // ── DIVE DECO ──────────────────────────────────────────────────────────────
  const diveDecoContent = mode === 'dive-deco' && (() => {
    const firstStop = state.decoStops[0]
    const stopDepth = firstStop?.depth ?? Math.ceil(state.ceilingDepth / 3) * 3
    const dtrMin    = Math.ceil(state.totalAscentTimeSec / 60)
    return (
      <>
        <Field cfg={cfg.depth}           sz={sz}>{fmtDepth(state.depth)}</Field>
        <Field cfg={cfg.depth_unit}      sz={sz}>m</Field>
        <Field cfg={cfg.dec_stop_lbl}    sz={sz} className="znp-alarm-red znp-blink">STOP</Field>
        <Field cfg={cfg.dec_ceiling}     sz={sz}>{stopDepth}</Field>
        <Field cfg={cfg.dec_ceiling_unit} sz={sz}>m</Field>
        <Field cfg={cfg.dec_dtr}         sz={sz}>{dtrMin}</Field>
        <Field cfg={cfg.dec_dtr_lbl}     sz={sz}>DTR MIN</Field>
        <Field cfg={cfg.dec_divetime}    sz={sz}>{pad2(diveMin)}</Field>
        <Field cfg={cfg.dec_divetime_lbl} sz={sz}>DIVE TIME</Field>
      </>
    )
  })()

  // ── POST-DIVE ──────────────────────────────────────────────────────────────
  const postDiveContent = mode === 'post-dive' && (
    <>
      <Field cfg={cfg.post_header}       sz={sz}>FIN PLONGÉE</Field>
      <Field cfg={cfg.post_duration}     sz={sz}>
        {pad2(Math.floor(state.timeSec / 60))}:{pad2(Math.floor(state.timeSec % 60))}
      </Field>
      <Field cfg={cfg.post_duration_lbl} sz={sz}>DURÉE PLONGÉE</Field>
      <Field cfg={cfg.post_maxdepth}     sz={sz}>{state.maxDepth.toFixed(1)}</Field>
      <Field cfg={cfg.post_maxdepth_unit} sz={sz}>m</Field>
      <Field cfg={cfg.post_maxdepth_lbl} sz={sz}>PROF MAX</Field>
      <Field cfg={cfg.post_temp}         sz={sz}>{Math.round(state.waterTemp)}</Field>
      <Field cfg={cfg.post_temp_unit}    sz={sz}>°C</Field>
      <Field cfg={cfg.post_temp_lbl}     sz={sz}>TEMP EAU</Field>
      <Field cfg={cfg.post_nofly}        sz={sz}>{fmtHM(state.noFlyTimeMinutes)}</Field>
      <Field cfg={cfg.post_nofly_lbl}    sz={sz}>NO FLY</Field>
      <Field cfg={cfg.post_desat}        sz={sz}>{fmtHM(state.desaturationTimeMinutes)}</Field>
      <Field cfg={cfg.post_desat_lbl}    sz={sz}>DÉSAT</Field>
    </>
  )

  // ── Calibration handles (shown for panelMode if set, else real mode) ───────
  const calibTargetMode = (isCalibrating && panelMode) ? panelMode : mode
  const calibHandles = isCalibrating && Object.values(cfg)
    .filter(f => f.modes.includes(calibTargetMode))
    .map(f => (
      <FieldHandle
        key={f.id}
        config={f}
        computerSlug={SLUG}
        containerRef={containerRef}
        isSelected={f.id === selectedFieldId}
      />
    ))

  return (
    <div ref={containerRef} className="znp-watch" style={{ width: sz, height: sz }}>
      <img className="znp-bg" src="/computers/suunto-zoop-novo.png" alt="Suunto Zoop Novo" draggable={false} />

      {surfaceContent}
      {diveOkContent}
      {diveDecoContent}
      {postDiveContent}

      {calibHandles}

      {/* Invisible click zones for physical buttons */}
      <button className="znp-btn" style={{ left: '19%', top: '44%', width: '9%', height: '9%' }} aria-label="Select" title="SELECT" />
      <button className="znp-btn" style={{ right: '19%', top: '44%', width: '9%', height: '9%' }} aria-label="Mode" title="MODE" />
      <button className="znp-btn" style={{ left: '36%', top: '70%', width: '9%', height: '9%' }} aria-label="Down" title="DOWN" />
      <button className="znp-btn" style={{ right: '36%', top: '70%', width: '9%', height: '9%' }} aria-label="Up" title="UP" />
    </div>
  )
}
