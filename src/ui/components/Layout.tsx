import React from 'react'

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 6 L12 18 L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="6" r="1.6" fill="var(--accent)"/>
    </svg>
  )
}

export function TopNav({ children }: { children?: React.ReactNode }) {
  return (
    <header
      className="flex items-center gap-3 px-5 sticky top-0 z-10"
      style={{
        height: 52,
        borderBottom: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
    >
      {children}
    </header>
  )
}

export function NavBrand() {
  return (
    <div className="flex items-center gap-2" style={{ color: 'var(--ink)', fontWeight: 600 }}>
      <Logo size={20}/>
      <span style={{ fontSize: 14, letterSpacing: '-0.01em' }}>DiveSim</span>
      <span className="ds-mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 2, letterSpacing: '0.06em' }}>v0.2</span>
    </div>
  )
}

export function NavDivider() {
  return <div style={{ width: 1, height: 20, background: 'var(--line)' }}/>
}

export function PageEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="ds-eyebrow" style={{ marginBottom: 8 }}>{children}</div>
}

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
        {children}
      </h1>
      {sub && (
        <p style={{ color: 'var(--ink-2)', margin: '10px 0 0', maxWidth: 640, fontSize: 15 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export function SectionHeader({ num, title, sub, right }: {
  num: string
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="ds-mono" style={{ color: 'var(--ink-4)', fontSize: 12 }}>{num}</span>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h2>
        </div>
        {sub && <p style={{ margin: '4px 0 0 28px', fontSize: 13, color: 'var(--ink-3)' }}>{sub}</p>}
      </div>
      {right && <div className="flex gap-1.5 items-center">{right}</div>}
    </div>
  )
}

export function FormSection({ num, title, sub, right, children }: {
  num: string
  title: string
  sub?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: 36, paddingBottom: 28, borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 32, alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 72 }}>
          <div className="ds-mono" style={{ color: 'var(--ink-4)', fontSize: 11, marginBottom: 4 }}>{num}</div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
          {sub && <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.45 }}>{sub}</p>}
          {right && <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>{right}</div>}
        </div>
        <div>{children}</div>
      </div>
    </section>
  )
}

export function Field({ label, hint, children }: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 4 }}>{hint}</div>}
    </label>
  )
}

export function UnitInput({ value, unit, onChange, min, max }: {
  value: number
  unit: string
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="ds-input ds-mono"
        type="number" value={value} min={min} max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{ paddingRight: 50, fontWeight: 500 }}
      />
      <span className="ds-mono" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-4)', pointerEvents: 'none' }}>{unit}</span>
    </div>
  )
}
