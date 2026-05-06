const SPEEDS = [1, 10, 60, 300] as const
type Speed = (typeof SPEEDS)[number]

type Props = {
  speed: Speed
  onChange: (speed: Speed) => void
}

export default function SpeedSelector({ speed, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-2 py-1 rounded text-sm font-mono border transition-colors
            ${speed === s
              ? 'bg-blue-600 border-blue-700 text-white'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
            }`}
        >
          ×{s}
        </button>
      ))}
    </div>
  )
}

export type { Speed }
