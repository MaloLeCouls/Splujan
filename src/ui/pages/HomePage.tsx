import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { exportProfileAsJSON } from '../../storage/importExport'
import ComputerPicker from '../computers/ComputerPicker'
import Icon from '../components/Icon'
import { TopNav, NavBrand, NavDivider, PageEyebrow, PageTitle, SectionHeader } from '../components/Layout'
import ProfilePreview from '../editor/ProfilePreview'
import type { DiveProfile } from '../../types'
import { useState, useMemo } from 'react'
import { getTotalDurationSec } from '../../engine/profile'

function ScenarioCard({ profile, onSimulate, onEdit }: {
  profile: DiveProfile
  onSimulate: () => void
  onEdit: () => void
}) {
  const segments = profile.segments.length
  const totalSec = getTotalDurationSec(profile)
  const totalMin = Math.round(totalSec / 60)
  const maxDepth = Math.max(
    ...profile.segments.map(seg => ('toDepth' in seg ? seg.toDepth : seg.depth))
  )

  const hasIncident = profile.events.some(e => e.type === 'rapid_ascent' || e.type === 'ooa')
  const hasDeco = maxDepth >= 30 && totalMin >= 30
  const kindLabel = hasIncident ? 'Incident' : hasDeco ? 'Décompression' : 'NDL'
  const kindClass = hasIncident ? 'ds-tag-danger' : hasDeco ? 'ds-tag-warn' : ''

  return (
    <div
      className="ds-card flex flex-col overflow-hidden transition-colors"
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'oklch(0.85 0.005 80)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
    >
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', padding: '8px 12px 0' }}>
        <ProfilePreview profile={profile} height={68} compact/>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div className="flex items-start justify-between gap-3">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>
              {profile.name}
            </h3>
            {profile.description && (
              <p style={{
                margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.45,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {profile.description}
              </p>
            )}
          </div>
          <span className={`ds-tag ${kindClass}`}>{kindLabel}</span>
        </div>

        <div className="flex gap-5 mt-auto pt-2" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          <Stat icon="depth" value={`${maxDepth}m`} label="prof. max"/>
          <Stat icon="clock" value={`${totalMin}min`} label="durée"/>
          <Stat icon="layers" value={String(segments)} label="seg."/>
        </div>

        <div className="flex gap-1.5 mt-1">
          <button onClick={onSimulate} className="ds-btn ds-btn-accent" style={{ flex: 1 }}>
            <Icon name="play" size={13}/> Simuler
          </button>
          <button onClick={onEdit} className="ds-btn ds-btn-icon" title="Éditer le scénario">
            <Icon name="edit" size={14}/>
          </button>
          <button onClick={() => exportProfileAsJSON(profile)} className="ds-btn ds-btn-icon" title="Exporter en JSON">
            <Icon name="download" size={14}/>
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: 'depth' | 'clock' | 'layers'; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon name={icon} size={13} style={{ color: 'var(--ink-4)' }}/>
      <span className="ds-mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
      <span style={{ color: 'var(--ink-4)' }}>{label}</span>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profiles, addProfile, setActiveProfile } = useStore()
  const [filter, setFilter] = useState<'all' | 'ndl' | 'deco' | 'incident'>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return profiles
    return profiles.filter(p => {
      const maxDepth = Math.max(...p.segments.map(s => 'toDepth' in s ? s.toDepth : s.depth), 0)
      const totalMin = Math.round(getTotalDurationSec(p) / 60)
      const hasIncident = p.events.some(e => e.type === 'rapid_ascent' || e.type === 'ooa')
      const hasDeco = maxDepth >= 30 && totalMin >= 30
      if (filter === 'incident') return hasIncident
      if (filter === 'deco') return hasDeco && !hasIncident
      if (filter === 'ndl') return !hasDeco && !hasIncident
      return true
    })
  }, [profiles, filter])

  function handleNewProfile() {
    const profile: DiveProfile = {
      id: crypto.randomUUID(),
      name: 'Nouveau profil',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gas: { o2Fraction: 0.21 },
      surfacePressure: 1.013,
      startingTankPressure: 200,
      tankVolume: 12,
      sac: 20,
      segments: [
        { type: 'descent', toDepth: 20, durationSec: 120 },
        { type: 'constant', depth: 20, durationSec: 1800 },
        { type: 'ascent', toDepth: 0, durationSec: 180 },
      ],
      events: [],
      gradientFactors: { low: 30, high: 85 },
    }
    addProfile(profile)
    navigate(`/editor/${profile.id}`)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    import('../../storage/importExport').then(({ importProfileFromFile }) => {
      importProfileFromFile(file)
        .then(p => useStore.getState().importProfile(p))
        .catch(() => alert('Fichier invalide'))
    })
    e.target.value = ''
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav>
        <NavBrand/>
        <NavDivider/>
        <div className="flex-1"/>
        <span className="ds-eyebrow" style={{ color: 'var(--ink-4)' }}>FFESSM · N2</span>
      </TopNav>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 36 }}>
          <PageEyebrow>01 — Bibliothèque</PageEyebrow>
          <PageTitle sub="Choisissez un ordinateur, lancez un scénario, et observez en classe ce que l'instrument affiche minute par minute — NDL, paliers, alarmes. Conçu pour la formation N2 FFESSM.">
            Simulateur d'ordinateur de plongée
          </PageTitle>
        </div>

        <section style={{ marginBottom: 48 }}>
          <SectionHeader
            num="01"
            title="Ordinateur"
            sub="L'écran qu'on simule. Le calcul Bühlmann ZH-L16C tourne en interne."
          />
          <ComputerPicker/>
        </section>

        <section>
          <SectionHeader
            num="02"
            title="Scénarios"
            sub="Profils pédagogiques prêts à projeter en classe."
            right={
              <>
                <div className="ds-seg">
                  {([['all', 'Tous'], ['ndl', 'NDL'], ['deco', 'Déco'], ['incident', 'Incidents']] as const).map(([k, l]) => (
                    <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
                  ))}
                </div>
                <div style={{ width: 8 }}/>
                <label className="ds-btn ds-btn-sm" style={{ cursor: 'pointer' }}>
                  <Icon name="upload" size={13}/> Importer
                  <input type="file" accept=".json" className="hidden" onChange={handleImport}/>
                </label>
                <button onClick={handleNewProfile} className="ds-btn ds-btn-sm ds-btn-primary">
                  <Icon name="plus" size={13}/> Nouveau
                </button>
              </>
            }
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {filtered.map(p => (
              <ScenarioCard
                key={p.id}
                profile={p}
                onSimulate={() => {
                  setActiveProfile(p.id)
                  navigate(`/simulation/${p.id}`)
                }}
                onEdit={() => navigate(`/editor/${p.id}`)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="ds-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, borderStyle: 'dashed', background: 'var(--bg)' }}>
              Aucun scénario dans cette catégorie.
            </div>
          )}
        </section>

        <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
          <div className="ds-mono flex items-center gap-2">
            <Icon name="alert" size={13}/>
            Outil pédagogique — ne pas utiliser pour planifier une plongée réelle
          </div>
          <div className="ds-mono" style={{ letterSpacing: '0.04em' }}>Bühlmann ZH-L16C · GF 30/85</div>
        </div>
      </main>
    </div>
  )
}
