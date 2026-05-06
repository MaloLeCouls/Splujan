import { useEffect } from 'react'
import type { DisplayMode, FieldConfig, FieldConfigMap, FontFamily } from './types'
import { DISPLAY_MODE_LABELS, FONT_FAMILIES, FONT_LABELS } from './types'
import { useCalibrationStore } from './useCalibrationStore'

const ALL_MODES: DisplayMode[] = ['surface', 'dive-ok', 'dive-deco', 'post-dive']

interface CalibrationPanelProps {
  computerSlug: string
  currentMode: DisplayMode   // real watch mode (from sim or mock)
  mergedConfigs: FieldConfigMap
  onClose: () => void
}

export default function CalibrationPanel({
  computerSlug,
  currentMode,
  mergedConfigs,
  onClose,
}: CalibrationPanelProps) {
  const { selectedFieldId, selectField, updateField, resetField, resetAll, panelMode, setPanelMode } = useCalibrationStore()

  const activeMode: DisplayMode = panelMode ?? currentMode
  const modeFields = Object.values(mergedConfigs).filter(f =>
    f.modes.includes(activeMode),
  )
  const selected = selectedFieldId ? mergedConfigs[selectedFieldId] : null

  // Arrow-key fine-tune when a field is selected
  useEffect(() => {
    if (!selected) return
    function onKey(e: KeyboardEvent) {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) return
      e.preventDefault()
      e.stopPropagation()
      const step = e.shiftKey ? 1 : 0.25
      const s = selected!
      if (e.code === 'ArrowLeft')  updateField(computerSlug, s.id, { left: (s.left ?? 0) - step, right: undefined })
      if (e.code === 'ArrowRight') updateField(computerSlug, s.id, { left: (s.left ?? 0) + step, right: undefined })
      if (e.code === 'ArrowUp')    updateField(computerSlug, s.id, { top: Math.max(0, s.top - step) })
      if (e.code === 'ArrowDown')  updateField(computerSlug, s.id, { top: Math.min(95, s.top + step) })
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [selected, computerSlug, updateField])

  function copyJSON() {
    const overrides = useCalibrationStore.getState().overrides[computerSlug] ?? {}
    navigator.clipboard.writeText(JSON.stringify(overrides, null, 2)).catch(() => {})
  }

  function handleResetAll() {
    if (confirm('Réinitialiser tous les ajustements pour cet ordinateur ?')) {
      resetAll(computerSlug)
      selectField(null)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        top: 60,
        width: 264,
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        background: '#1e1e2e',
        color: '#cdd6f4',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        zIndex: 40,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #313244' }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#89b4fa' }}>🔧 Calibration</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#cdd6f4', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px' }}
        >
          ×
        </button>
      </div>

      {/* Mode tabs */}
      <div style={{ padding: '6px 8px', borderBottom: '1px solid #313244', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {ALL_MODES.map(m => (
          <button
            key={m}
            onClick={() => setPanelMode(m === activeMode && panelMode !== null ? null : m)}
            title={`Afficher les champs du mode « ${DISPLAY_MODE_LABELS[m]} »`}
            style={{
              flex: 1, minWidth: 60,
              padding: '3px 4px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 10,
              background: m === activeMode ? '#89b4fa' : '#313244',
              color:      m === activeMode ? '#1e1e2e' : '#a6adc8',
              fontWeight: m === activeMode ? 700 : 400,
            }}
          >
            {DISPLAY_MODE_LABELS[m]}
          </button>
        ))}
      </div>
      <div style={{ padding: '3px 12px 5px', borderBottom: '1px solid #313244', color: '#6c7086', fontSize: 10 }}>
        {modeFields.length} champs dans ce mode
        {panelMode && panelMode !== currentMode && (
          <span style={{ color: '#fab387', marginLeft: 6 }}>(prévisualisation forcée)</span>
        )}
      </div>

      {/* Field list */}
      <div style={{ padding: '6px 6px', borderBottom: '1px solid #313244' }}>
        <div style={{ color: '#6c7086', fontSize: 10, padding: '2px 6px 4px' }}>Cliquer pour sélectionner · glisser sur la montre pour déplacer</div>
        {modeFields.map(f => {
          const isModified = !!useCalibrationStore.getState().overrides[computerSlug]?.[f.id]
          return (
            <button
              key={f.id}
              onClick={() => selectField(f.id === selectedFieldId ? null : f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', textAlign: 'left',
                padding: '4px 8px', borderRadius: 5, border: 'none',
                background: f.id === selectedFieldId ? '#313244' : 'transparent',
                color: f.id === selectedFieldId ? '#89b4fa' : '#cdd6f4',
                cursor: 'pointer', fontSize: 11, marginBottom: 1,
              }}
            >
              <span style={{ flex: 1 }}>{f.label}</span>
              {isModified && <span style={{ fontSize: 9, color: '#fab387', background: '#45475a', borderRadius: 3, padding: '1px 4px' }}>modifié</span>}
            </button>
          )
        })}
      </div>

      {/* Selected field controls */}
      {selected ? (
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontWeight: 700, color: '#89b4fa', marginBottom: 10, fontSize: 13 }}>{selected.label}</div>

          <SliderRow
            label="Gauche %"
            value={selected.left ?? 0}
            min={0} max={98} step={0.25}
            onChange={v => updateField(computerSlug, selected.id, { left: v, right: undefined })}
          />
          <SliderRow
            label="Haut %"
            value={selected.top}
            min={0} max={98} step={0.25}
            onChange={v => updateField(computerSlug, selected.id, { top: v })}
          />
          {selected.width !== undefined && (
            <SliderRow
              label="Largeur %"
              value={selected.width}
              min={1} max={80} step={0.5}
              onChange={v => updateField(computerSlug, selected.id, { width: v })}
            />
          )}
          <SliderRow
            label="Taille police (px @640)"
            value={Math.round(selected.fontSizeRatio * 640)}
            min={6} max={80} step={1}
            onChange={v => updateField(computerSlug, selected.id, { fontSizeRatio: v / 640 })}
          />

          {/* Font family */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: '#a6adc8', marginBottom: 3 }}>Police</div>
            <select
              value={selected.fontFamily}
              onChange={e => updateField(computerSlug, selected.id, { fontFamily: e.target.value as FontFamily })}
              style={{
                width: '100%', background: '#313244', color: '#cdd6f4',
                border: '1px solid #45475a', borderRadius: 4,
                padding: '4px 6px', fontSize: 11, cursor: 'pointer',
              }}
            >
              {FONT_FAMILIES.map(ff => (
                <option key={ff} value={ff}>{FONT_LABELS[ff]}</option>
              ))}
            </select>
          </div>

          {/* Alignment */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: '#a6adc8', marginBottom: 3 }}>Alignement</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['left', 'center', 'right'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => updateField(computerSlug, selected.id, { align: a })}
                  style={{
                    flex: 1, padding: '4px 0', borderRadius: 4,
                    border: '1px solid #45475a',
                    background: selected.align === a ? '#89b4fa' : '#313244',
                    color: selected.align === a ? '#1e1e2e' : '#cdd6f4',
                    cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  }}
                >
                  {a === 'left' ? '⇤' : a === 'center' ? '⇔' : '⇥'}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selected.visible}
              onChange={e => updateField(computerSlug, selected.id, { visible: e.target.checked })}
              style={{ accentColor: '#89b4fa', width: 14, height: 14 }}
            />
            <span style={{ color: '#a6adc8' }}>Visible</span>
          </label>

          {/* Reset this field */}
          <button
            onClick={() => { resetField(computerSlug, selected.id); selectField(null) }}
            style={{
              display: 'block', width: '100%', padding: '5px', borderRadius: 5,
              border: '1px solid #f38ba8', background: 'transparent', color: '#f38ba8',
              cursor: 'pointer', fontSize: 11,
            }}
          >
            ↺ Réinitialiser ce champ
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px', color: '#6c7086', fontSize: 11, textAlign: 'center' }}>
          Sélectionne un champ ci-dessus<br />ou clique directement sur la montre
        </div>
      )}

      {/* Bottom actions */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #313244', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, color: '#585b70' }}>
          ← → ↑ ↓ : ±0.25% &nbsp;|&nbsp; Shift + flèche : ±1%
        </div>
        <button
          onClick={copyJSON}
          style={{
            padding: '5px', borderRadius: 5,
            border: '1px solid #89b4fa', background: 'transparent', color: '#89b4fa',
            cursor: 'pointer', fontSize: 11,
          }}
        >
          Copier JSON (overrides)
        </button>
        <button
          onClick={handleResetAll}
          style={{
            padding: '5px', borderRadius: 5,
            border: '1px solid #f38ba8', background: 'transparent', color: '#f38ba8',
            cursor: 'pointer', fontSize: 11,
          }}
        >
          Tout réinitialiser
        </button>
      </div>
    </div>
  )
}

function SliderRow({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a6adc8', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color: '#cdd6f4', fontVariantNumeric: 'tabular-nums' }}>
          {value.toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#89b4fa' }}
      />
    </div>
  )
}
