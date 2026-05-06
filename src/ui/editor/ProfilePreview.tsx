import type { DiveProfile } from '../../types'
import { getSegmentTimeline } from '../../engine/profile'

type Props = {
  profile: DiveProfile
  height?: number
  compact?: boolean
}

const PADDING = { top: 6, bottom: 14, left: 4, right: 4 }
const WIDTH = 320

export default function ProfilePreview({ profile, height = 120, compact = false }: Props) {
  const timeline = getSegmentTimeline(profile)
  if (timeline.length === 0) return null

  const totalSec = timeline[timeline.length - 1].endSec
  const maxDepth = Math.max(...timeline.map(s => Math.max(s.startDepth, s.endDepth)), 1)

  const plotW = WIDTH - PADDING.left - PADDING.right
  const plotH = height - PADDING.top - PADDING.bottom

  function xOf(sec: number) { return PADDING.left + (sec / totalSec) * plotW }
  function yOf(depth: number) { return PADDING.top + (depth / maxDepth) * plotH }

  const points = timeline
    .flatMap(s => [
      { x: xOf(s.startSec), y: yOf(s.startDepth) },
      { x: xOf(s.endSec), y: yOf(s.endDepth) },
    ])
    .filter((p, i, arr) => i === 0 || p.x !== arr[i - 1].x || p.y !== arr[i - 1].y)

  const pathData =
    `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} ` +
    points.slice(1).map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  const areaData = `${pathData} L ${points[points.length - 1].x.toFixed(1)} ${PADDING.top + plotH} L ${PADDING.left} ${PADDING.top + plotH} Z`

  const totalMin = Math.round(totalSec / 60)

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block' }}
    >
      <line
        x1={PADDING.left} x2={WIDTH - PADDING.right}
        y1={PADDING.top} y2={PADDING.top}
        stroke="var(--line)" strokeDasharray="2 3"
      />
      <path d={areaData} fill="var(--accent)" fillOpacity="0.07"/>
      <path d={pathData} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>

      <text x={WIDTH - PADDING.right} y={height - 3} textAnchor="end"
            fontSize="9" fill="var(--ink-3)" fontFamily="var(--font-mono)">
        {totalMin}min
      </text>
      <text x={PADDING.left} y={height - 3} textAnchor="start"
            fontSize="9" fill="var(--ink-3)" fontFamily="var(--font-mono)">
        −{maxDepth}m
      </text>

      {!compact && (
        <text x={PADDING.left} y={PADDING.top - 2} fontSize="9" fill="var(--ink-4)" fontFamily="var(--font-mono)">
          0m
        </text>
      )}
    </svg>
  )
}
