import type { DiveSegment } from '../../types'

type Props = {
  segments: DiveSegment[]
  onChange: (segments: DiveSegment[]) => void
}

const SEGMENT_TYPE_LABELS: Record<DiveSegment['type'], string> = {
  descent:  'Descente',
  constant: 'Fond (profondeur constante)',
  ascent:   'Remontée',
}

export default function SegmentList({ segments, onChange }: Props) {
  function update(index: number, patch: Partial<DiveSegment>) {
    const updated = segments.map((s, i) => (i === index ? { ...s, ...patch } as DiveSegment : s))
    onChange(updated)
  }

  function remove(index: number) {
    onChange(segments.filter((_, i) => i !== index))
  }

  function addSegment() {
    const last = segments[segments.length - 1]
    const lastDepth = last
      ? last.type === 'constant' ? last.depth : last.toDepth
      : 0
    const newSeg: DiveSegment = { type: 'constant', depth: lastDepth, durationSec: 5 * 60 }
    onChange([...segments, newSeg])
  }

  return (
    <div className="space-y-2">
      {segments.map((seg, i) => (
        <div key={i} className="flex flex-wrap gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
          <select
            value={seg.type}
            title="Type de phase : descente vers la profondeur cible, maintien au fond, ou remontée"
            onChange={e => {
              const type = e.target.value as DiveSegment['type']
              if (type === 'constant') {
                update(i, { type, depth: seg.type === 'constant' ? seg.depth : (seg as { toDepth: number }).toDepth } as Partial<DiveSegment>)
              } else {
                update(i, { type, toDepth: seg.type === 'constant' ? seg.depth : (seg as { toDepth: number }).toDepth } as Partial<DiveSegment>)
              }
            }}
            className="border rounded px-1 py-0.5 text-sm"
          >
            {(Object.keys(SEGMENT_TYPE_LABELS) as DiveSegment['type'][]).map(t => (
              <option key={t} value={t}>{SEGMENT_TYPE_LABELS[t]}</option>
            ))}
          </select>

          <label className="text-sm text-gray-600 flex items-center gap-1" title="Profondeur cible en mètres">
            Profondeur
            <input
              type="number"
              min={0}
              max={100}
              value={seg.type === 'constant' ? seg.depth : seg.toDepth}
              onChange={e => {
                const depth = parseFloat(e.target.value) || 0
                if (seg.type === 'constant') update(i, { depth } as Partial<DiveSegment>)
                else update(i, { toDepth: depth } as Partial<DiveSegment>)
              }}
              className="w-16 ml-1 border rounded px-1 py-0.5 text-sm"
            />
            m
          </label>

          <label className="text-sm text-gray-600 flex items-center gap-1" title="Durée de cette phase en minutes">
            Durée
            <input
              type="number"
              min={1}
              value={Math.round(seg.durationSec / 60)}
              onChange={e => update(i, { durationSec: (parseFloat(e.target.value) || 1) * 60 })}
              className="w-14 ml-1 border rounded px-1 py-0.5 text-sm"
            />
            min
          </label>

          <button
            onClick={() => remove(i)}
            className="ml-auto text-red-400 hover:text-red-600 text-sm"
            title="Supprimer ce segment"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addSegment}
        className="w-full py-1.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + Ajouter un segment
      </button>
    </div>
  )
}
