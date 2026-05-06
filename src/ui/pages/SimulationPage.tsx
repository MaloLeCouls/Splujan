import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { Simulator } from '../../engine/simulator'
import { getComputerEntry, listUIComputers } from '../computers/ui-registry'
import { useCalibrationStore } from '../calibration/useCalibrationStore'
import CalibrationPanel from '../calibration/CalibrationPanel'
import { ZOOP_NOVO_DEFAULTS, mergeConfigs } from '../calibration/zoop-novo-defaults'
import type { DisplayMode } from '../calibration/types'
import type { DiveState } from '../../types'
import Icon from '../components/Icon'
import { TopNav, NavBrand, NavDivider } from '../components/Layout'
import PlaybackControls from '../simulation/PlaybackControls'
import TimelineMini from '../simulation/TimelineMini'

const STAGE_W = 720
const STAGE_H = 480

function getDisplayMode(depth: number, maxDepth: number, inDeco: boolean, isPostDive: boolean): DisplayMode {
  if (isPostDive) return 'post-dive'
  if (depth < 0.5 && maxDepth === 0) return 'surface'
  if (inDeco) return 'dive-deco'
  return 'dive-ok'
}

export default function SimulationPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const { profiles, isPresentationMode, togglePresentationMode, selectedComputerSlug, setSelectedComputer } = useStore()

  const profile = profiles.find(p => p.id === profileId)
  const simulator = useMemo(() => (profile ? new Simulator(profile) : null), [profile])

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<1 | 2 | 4 | 8>(1)
  const [showComputerMenu, setShowComputerMenu] = useState(false)

  const handleButtonPress = useCallback(
    (button: 'select' | 'down' | 'mode' | 'up') => {
      switch (button) {
        case 'select': setIsPlaying(p => !p); break
        case 'up':     setCurrentTime(t => Math.min(t + 30, simulator?.totalDurationSec ?? 0)); break
        case 'down':   setCurrentTime(t => Math.max(0, t - 30)); break
        case 'mode':   togglePresentationMode(); break
      }
    },
    [simulator, togglePresentationMode],
  )

  const { isCalibrating, selectedFieldId, toggleCalibration, selectField } = useCalibrationStore()
  const calibOverridesObj = useCalibrationStore(s => s.overrides[selectedComputerSlug])
  const mergedCalibConfigs = useMemo(
    () => mergeConfigs(ZOOP_NOVO_DEFAULTS, calibOverridesObj ?? {}),
    [calibOverridesObj],
  )

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  const tick = useCallback(
    (ts: number) => {
      if (lastTsRef.current === null) {
        lastTsRef.current = ts
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setCurrentTime(t => {
        const next = t + dt * speed
        if (simulator && next >= simulator.totalDurationSec) {
          setIsPlaying(false)
          return simulator.totalDurationSec
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    },
    [speed, simulator],
  )

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
      return
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [isPlaying, tick])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p) }
      const calibBusy = isCalibrating && selectedFieldId !== null
      if (!calibBusy) {
        if (e.code === 'ArrowLeft')  setCurrentTime(t => Math.max(0, t - 30))
        if (e.code === 'ArrowRight') setCurrentTime(t => Math.min(t + 30, simulator?.totalDurationSec ?? 0))
      }
      if (e.code === 'Escape') {
        if (isCalibrating) {
          if (selectedFieldId) selectField(null)
          else toggleCalibration()
        } else if (isPresentationMode) {
          togglePresentationMode()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPresentationMode, isCalibrating, selectedFieldId, simulator, togglePresentationMode, toggleCalibration, selectField])

  if (!profile || !simulator) return <Navigate to="/" replace/>

  const state = simulator.getStateAt(currentTime)
  const entry = getComputerEntry(selectedComputerSlug)
  const ComputerComponent = entry?.Component
  const currentDisplayMode = getDisplayMode(state.depth, state.maxDepth, state.inDecompression, state.isPostDive)

  if (isPresentationMode) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'oklch(0.12 0.005 80)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        {ComputerComponent && <ComputerComponent state={state} scale={1.2} onButtonPress={handleButtonPress}/>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="ds-btn ds-btn-primary"
            style={{ height: 42, padding: '0 20px', fontSize: 15 }}
          >
            {isPlaying ? <Icon name="pause" size={16}/> : <Icon name="play" size={16}/>}
          </button>
          <button
            onClick={togglePresentationMode}
            className="ds-btn"
            style={{ background: 'oklch(0.25 0.005 80)', borderColor: 'oklch(0.35 0.005 80)', color: 'oklch(0.85 0.005 80)' }}
          >
            Quitter (ESC)
          </button>
        </div>
        <div style={{ width: 480, background: 'oklch(0.18 0.005 80)', borderRadius: 10, overflow: 'hidden' }}>
          <PlaybackControls
            tSec={currentTime}
            totalSec={simulator.totalDurationSec}
            playing={isPlaying}
            speed={speed}
            onPlayPause={() => setIsPlaying(p => !p)}
            onReset={() => { setCurrentTime(0); setIsPlaying(false) }}
            onSpeedChange={setSpeed}
            onScrub={setCurrentTime}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopNav>
        <button onClick={() => navigate('/')} className="ds-btn ds-btn-sm ds-btn-ghost">
          <Icon name="arrow-left" size={13}/> Retour
        </button>
        <NavDivider/>
        <NavBrand/>
        <NavDivider/>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="ds-eyebrow">Simulation en cours</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.name}
          </div>
        </div>

        {/* Computer switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowComputerMenu(m => !m)}
            className="ds-btn ds-btn-sm"
          >
            <img src={`/computers/${selectedComputerSlug}.png`} alt="" style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'cover' }}/>
            {entry?.label ?? selectedComputerSlug}
            <Icon name="chevron-down" size={12}/>
          </button>
          {showComputerMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 10, boxShadow: '0 8px 24px oklch(0 0 0 / 0.1)',
              zIndex: 20, padding: 4, minWidth: 180,
            }}>
              {listUIComputers().map(c => (
                <button
                  key={c.slug}
                  onClick={() => { setSelectedComputer(c.slug); setShowComputerMenu(false) }}
                  className="ds-btn ds-btn-ghost"
                  style={{
                    width: '100%', justifyContent: 'flex-start', height: 34,
                    fontWeight: c.slug === selectedComputerSlug ? 600 : 400,
                    color: c.slug === selectedComputerSlug ? 'var(--accent)' : 'var(--ink)',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleCalibration}
          className={isCalibrating ? 'ds-btn ds-btn-sm ds-btn-primary' : 'ds-btn ds-btn-sm'}
          title="Calibrer les champs de la montre"
        >
          <Icon name="settings" size={13}/> Calibrer
        </button>
        <button onClick={togglePresentationMode} className="ds-btn ds-btn-sm">
          <Icon name="presentation" size={13}/> Mode classe
        </button>
        <button onClick={() => navigate(`/editor/${profile.id}`)} className="ds-btn ds-btn-sm">
          <Icon name="edit" size={13}/> Éditer
        </button>
      </TopNav>

      {/* Body — 2 col */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        flex: 1,
        minHeight: 0,
      }}>
        {/* Stage */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 32,
          background: `radial-gradient(circle at 50% 40%, oklch(0.96 0.005 80), var(--bg) 70%)`,
          minHeight: 0,
        }}>
          <ComputerStage slug={selectedComputerSlug} state={state} onButtonPress={handleButtonPress}/>
          <div className="ds-mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 16, letterSpacing: '0.04em' }}>
            {entry?.label ?? selectedComputerSlug}
          </div>
        </div>

        {/* Telemetry sidebar */}
        <TelemetrySidebar state={state} profile={profile}/>
      </div>

      {/* Playback */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <TimelineMini profile={profile} tSec={currentTime} onScrub={setCurrentTime}/>
        <PlaybackControls
          tSec={currentTime}
          totalSec={simulator.totalDurationSec}
          playing={isPlaying}
          speed={speed}
          onPlayPause={() => setIsPlaying(p => !p)}
          onReset={() => { setCurrentTime(0); setIsPlaying(false) }}
          onSpeedChange={setSpeed}
          onScrub={setCurrentTime}
        />
      </div>

      {isCalibrating && (
        <CalibrationPanel
          computerSlug={selectedComputerSlug}
          currentMode={currentDisplayMode}
          mergedConfigs={mergedCalibConfigs}
          onClose={toggleCalibration}
        />
      )}
    </div>
  )
}

function ComputerStage({ slug, state, onButtonPress }: {
  slug: string
  state: DiveState
  onButtonPress: (b: 'select' | 'down' | 'mode' | 'up') => void
}) {
  const entry = getComputerEntry(slug)
  const ComputerComponent = entry?.Component
  return (
    <div style={{
      position: 'relative',
      width: STAGE_W, height: STAGE_H,
      maxWidth: '100%', maxHeight: '100%',
      display: 'grid', placeItems: 'center',
    }}>
      <svg
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, opacity: 0.5 }}
      >
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="oklch(0.85 0.005 80)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {ComputerComponent && <ComputerComponent state={state} scale={0.85} onButtonPress={onButtonPress}/>}
      </div>
    </div>
  )
}

function TelemetrySidebar({ state, profile }: { state: DiveState; profile: { gas: { o2Fraction: number } } }) {
  const decoState =
    state.ceilingDepth > 0 ? 'deco' :
    (state.ndlMinutes !== null && state.ndlMinutes < 5) ? 'caution' : 'ndl'

  return (
    <aside style={{
      borderLeft: '1px solid var(--line)',
      background: 'var(--surface)',
      padding: 20, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Status banner */}
      <div
        className="flex items-center gap-2"
        style={{
          padding: '10px 12px', borderRadius: 8,
          background: decoState === 'deco' ? 'var(--danger-soft)' : decoState === 'caution' ? 'var(--warn-soft)' : 'var(--accent-soft)',
          color: decoState === 'deco' ? 'var(--danger)' : decoState === 'caution' ? 'oklch(0.42 0.13 50)' : 'var(--accent-ink)',
          fontSize: 12.5, fontWeight: 500,
        }}
      >
        <Icon name={decoState === 'ndl' ? 'check' : 'alert'} size={14}/>
        {decoState === 'deco' ? 'Décompression obligatoire'
          : decoState === 'caution' ? 'Sortie de la courbe imminente'
          : 'Dans la courbe de sécurité'}
      </div>

      <TGroup label="Profondeur">
        <TBig value={state.depth.toFixed(1)} unit="m"/>
        <TLine label="Max atteinte" value={`${state.maxDepth.toFixed(1)} m`}/>
      </TGroup>

      <TGroup label="Temps">
        <TBig value={fmtMSS(state.timeSec)} unit=""/>
        <TLine label="NDL" value={state.ndlMinutes !== null ? fmtMSS(state.ndlMinutes * 60) : '—'}/>
        <TLine label="Plafond" value={state.ceilingDepth > 0 ? `${state.ceilingDepth.toFixed(1)} m` : '—'}/>
      </TGroup>

      <TGroup label="Compartiments N₂">
        <Compartments compartments={state.compartments}/>
      </TGroup>

      <TGroup label="Gaz">
        <TLine label="O₂" value={`${Math.round(profile.gas.o2Fraction * 100)}%`}/>
        <TLine label="Pression" value={`${Math.round(state.tankPressure)} bar`}/>
      </TGroup>
    </aside>
  )
}

function TGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="ds-eyebrow" style={{ marginBottom: 8 }}>{label.toUpperCase()}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  )
}

function TBig({ value, unit }: { value: string; unit: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
      <span className="ds-mono" style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
        {value}
      </span>
      <span className="ds-mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>{unit}</span>
    </div>
  )
}

function TLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between" style={{ fontSize: 12.5 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span className="ds-mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function Compartments({ compartments }: { compartments: number[] }) {
  if (compartments.length === 0) {
    return <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>—</div>
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 56 }}>
      {compartments.slice(0, 16).map((p, i) => {
        const sat = Math.max(0, Math.min(1.2, p / 2.0))
        const isOver = sat > 1
        return (
          <div key={i} title={`C${i + 1} · ${p.toFixed(2)} bar`}
               style={{ flex: 1, height: '100%', background: 'var(--line-2)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${Math.min(100, sat * 100)}%`,
              background: isOver ? 'var(--danger)' : sat > 0.85 ? 'oklch(0.58 0.13 50)' : 'var(--accent)',
              transition: 'height 0.15s, background 0.15s',
            }}/>
          </div>
        )
      })}
    </div>
  )
}

function fmtMSS(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
