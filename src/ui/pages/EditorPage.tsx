import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import type { DiveProfile } from '../../types'
import Icon from '../components/Icon'
import {
  TopNav, NavBrand, NavDivider, FormSection, Field, UnitInput,
} from '../components/Layout'
import SegmentList from '../editor/SegmentList'
import EventList from '../editor/EventList'
import ProfilePreview from '../editor/ProfilePreview'
import { exportProfileAsJSON } from '../../storage/importExport'

export default function EditorPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const { profiles, updateProfile, deleteProfile } = useStore()
  const original = profiles.find(p => p.id === profileId)
  const [draft, setDraft] = useState<DiveProfile | null>(original ?? null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (original && !draft) setDraft(original)
  }, [original, draft])

  if (!original) return <Navigate to="/" replace/>
  if (!draft) return null

  function patch<K extends keyof DiveProfile>(key: K, value: DiveProfile[K]) {
    setDraft(d => d ? { ...d, [key]: value } : d)
    setDirty(true)
  }

  function save() {
    if (!draft) return
    updateProfile({ ...draft, updatedAt: Date.now() })
    setDirty(false)
  }

  function handleDelete() {
    if (!draft) return
    if (!confirm(`Supprimer "${draft.name}" ? Cette action est irréversible.`)) return
    deleteProfile(draft.id)
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav>
        <button onClick={() => navigate('/')} className="ds-btn ds-btn-sm ds-btn-ghost">
          <Icon name="arrow-left" size={13}/> Retour
        </button>
        <NavDivider/>
        <NavBrand/>
        <NavDivider/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ds-eyebrow">Éditeur de scénario</div>
          <input
            value={draft.name}
            onChange={e => patch('name', e.target.value)}
            style={{
              border: 0, background: 'transparent', width: '100%',
              fontSize: 14, fontWeight: 600, color: 'var(--ink)',
              padding: 0, outline: 'none', marginTop: 1,
            }}
          />
        </div>
        <button onClick={() => exportProfileAsJSON(draft)} className="ds-btn ds-btn-sm" title="Exporter en JSON">
          <Icon name="download" size={13}/>
        </button>
        <button onClick={handleDelete} className="ds-btn ds-btn-sm ds-btn-danger">
          <Icon name="trash" size={13}/>
        </button>
        <button
          onClick={() => { save(); navigate(`/simulation/${draft.id}`) }}
          className="ds-btn ds-btn-sm ds-btn-accent"
        >
          <Icon name="play" size={13}/> Simuler
        </button>
        <button
          onClick={save}
          disabled={!dirty}
          className="ds-btn ds-btn-sm ds-btn-primary"
        >
          {dirty ? 'Enregistrer' : 'Enregistré'}
        </button>
      </TopNav>

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div className="ds-card" style={{ padding: 14, marginBottom: 32, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'center' }}>
          <div>
            <div className="ds-eyebrow">Aperçu du profil</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>
              {draft.segments.length} segment{draft.segments.length > 1 ? 's' : ''} ·{' '}
              {draft.events.length} événement{draft.events.length > 1 ? 's' : ''} ·{' '}
              GF {draft.gradientFactors.low}/{draft.gradientFactors.high}
            </div>
          </div>
          <ProfilePreview profile={draft} height={80}/>
        </div>

        <FormSection
          num="01"
          title="Identité"
          sub="Nom et description du scénario, tels qu'ils apparaissent dans la bibliothèque."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nom du scénario">
              <input
                className="ds-input"
                value={draft.name}
                onChange={e => patch('name', e.target.value)}
              />
            </Field>
            <Field label="Description (optionnelle)" hint="Visible dans la bibliothèque, sous le titre.">
              <textarea
                className="ds-input"
                rows={3}
                value={draft.description ?? ''}
                onChange={e => patch('description', e.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          num="02"
          title="Gaz et bloc"
          sub="Le mélange respiré et l'autonomie de départ. La consommation est calculée à partir du SAC."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <Field label="Fraction d'O₂" hint="0,21 pour l'air ; 0,32 pour le Nx32.">
              <UnitInput
                value={draft.gas.o2Fraction}
                unit="frac"
                onChange={v => patch('gas', { ...draft.gas, o2Fraction: v })}
                min={0.18} max={1}/>
            </Field>
            <Field label="Pression de surface">
              <UnitInput
                value={draft.surfacePressure}
                unit="bar"
                onChange={v => patch('surfacePressure', v)}
                min={0.8} max={1.05}/>
            </Field>
            <Field label="Pression bloc départ">
              <UnitInput
                value={draft.startingTankPressure}
                unit="bar"
                onChange={v => patch('startingTankPressure', v)}
                min={50} max={300}/>
            </Field>
            <Field label="Volume bloc">
              <UnitInput
                value={draft.tankVolume}
                unit="L"
                onChange={v => patch('tankVolume', v)}
                min={5} max={20}/>
            </Field>
            <Field label="SAC" hint="Consommation respiratoire en surface (L/min).">
              <UnitInput
                value={draft.sac}
                unit="L/min"
                onChange={v => patch('sac', v)}
                min={5} max={40}/>
            </Field>
          </div>
        </FormSection>

        <FormSection
          num="03"
          title="Profil"
          sub="Suite de segments à profondeur constante, descente ou remontée. Le simulateur déroule dans l'ordre."
        >
          <SegmentList
            segments={draft.segments}
            onChange={segments => { setDraft(d => d ? { ...d, segments } : d); setDirty(true) }}
          />
        </FormSection>

        <FormSection
          num="04"
          title="Événements"
          sub="Incidents pédagogiques injectés à un moment précis : remontée rapide, panne d'air, oubli de palier."
        >
          <EventList
            events={draft.events}
            onChange={events => { setDraft(d => d ? { ...d, events } : d); setDirty(true) }}
          />
        </FormSection>

        <FormSection
          num="05"
          title="Facteurs de gradient"
          sub="Conservatisme du modèle Bühlmann. 30/85 = standard FFESSM. Plus bas = plus conservateur."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, maxWidth: 380 }}>
            <Field label="GF Low">
              <UnitInput
                value={draft.gradientFactors.low}
                unit="%"
                onChange={v => patch('gradientFactors', { ...draft.gradientFactors, low: v })}
                min={10} max={100}/>
            </Field>
            <Field label="GF High">
              <UnitInput
                value={draft.gradientFactors.high}
                unit="%"
                onChange={v => patch('gradientFactors', { ...draft.gradientFactors, high: v })}
                min={10} max={100}/>
            </Field>
          </div>
        </FormSection>

        {dirty && (
          <div style={{
            position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--ink)', color: 'var(--surface)',
            padding: '10px 14px', borderRadius: 9,
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 24px oklch(0 0 0 / 0.15)',
          }}>
            <span>Modifications non enregistrées</span>
            <button onClick={save} className="ds-btn ds-btn-sm" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
              Enregistrer
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
