import { useNavigate } from 'react-router-dom'
import { listUIComputers } from './ui-registry'
import { useStore } from '../../store/useStore'
import Icon from '../components/Icon'

export default function ComputerPicker() {
  const navigate = useNavigate()
  const { selectedComputerSlug, setSelectedComputer } = useStore()
  const computers = listUIComputers()

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <button
          onClick={() => navigate('/calibration')}
          className="ds-btn ds-btn-sm ds-btn-ghost"
          style={{ color: 'var(--ink-3)' }}
          title="Ajuster la position et la taille des champs affichés sur l'écran de la montre"
        >
          <Icon name="settings" size={12}/> Calibrer l'affichage
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {computers.map(({ slug, label }) => {
          const sel = slug === selectedComputerSlug
          return (
            <button
              key={slug}
              onClick={() => setSelectedComputer(slug)}
              className="ds-card text-left"
              style={{
                padding: 14,
                borderColor: sel ? 'var(--accent)' : 'var(--line)',
                boxShadow: sel ? '0 0 0 3px var(--accent-soft)' : 'none',
                background: 'var(--surface)',
                cursor: 'pointer',
                transition: 'border-color .15s, box-shadow .15s',
              }}
            >
              <div className="flex items-center gap-3">
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'linear-gradient(180deg, oklch(0.22 0.005 80), oklch(0.14 0.005 80))',
                  display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0,
                }}>
                  <img
                    src={`/computers/${slug}.png`}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement
                      el.style.display = 'none'
                      const fallback = el.parentElement?.querySelector('span')
                      if (fallback) (fallback as HTMLSpanElement).style.display = 'block'
                    }}
                  />
                  <span
                    style={{
                      display: 'none',
                      color: 'oklch(0.78 0.04 130)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {slug.split('-')[0].toUpperCase().slice(0, 4)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                  </div>
                  <div className="ds-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                    Référencé · FFESSM
                  </div>
                </div>
                {sel && (
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--accent)', color: 'white',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon name="check" size={11}/>
                  </div>
                )}
              </div>
            </button>
          )
        })}

        <div
          className="flex flex-col items-center justify-center gap-2"
          style={{
            padding: 14,
            border: '1px dashed var(--line)',
            borderRadius: 10,
            color: 'var(--ink-4)',
            fontSize: 12.5,
            background: 'transparent',
          }}
        >
          <Icon name="plus" size={18}/>
          <span>Bientôt</span>
        </div>
      </div>
    </div>
  )
}
