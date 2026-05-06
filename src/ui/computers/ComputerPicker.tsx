import { useNavigate } from 'react-router-dom'
import { listUIComputers } from './ui-registry'
import { useStore } from '../../store/useStore'

export default function ComputerPicker() {
  const navigate = useNavigate()
  const { selectedComputerSlug, setSelectedComputer } = useStore()
  const computers = listUIComputers()

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Ordinateur de plongée
        </h2>
        <button
          onClick={() => navigate('/calibration')}
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
          title="Ajuster la position et la taille des champs affichés sur l'écran de la montre"
        >
          🔧 Calibrer l'affichage
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {computers.map(({ slug, label }) => {
          const selected = slug === selectedComputerSlug
          return (
            <button
              key={slug}
              onClick={() => setSelectedComputer(slug)}
              className={[
                'group relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                selected
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm',
              ].join(' ')}
            >
              {/* Watch thumbnail */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={`/computers/${slug}.png`}
                  alt={label}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                {selected && (
                  <div className="absolute inset-0 bg-blue-600/10 flex items-end justify-center pb-1">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SÉLECTIONNÉ
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span className={`text-xs font-semibold text-center leading-tight max-w-[7rem] ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
                {label}
              </span>
            </button>
          )
        })}

        {/* Placeholder for future computers */}
        <div className="flex flex-col items-center justify-center gap-2 p-3 w-[7.5rem] rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-xs text-center">
          <span className="text-2xl">+</span>
          <span>Bientôt…</span>
        </div>
      </div>
    </section>
  )
}
