import type { DiveProfile } from '../../types'
import { getSegmentTimeline } from '../../engine/profile'

type Props = { profile: DiveProfile }

const HEIGHT = 120
const WIDTH = 400
const PADDING = { top: 10, bottom: 20, left: 30, right: 10 }

export default function ProfilePreview({ profile }: Props) {
  const timeline = getSegmentTimeline(profile)
  if (timeline.length === 0) return null

  const totalSec = timeline[timeline.length - 1].endSec
  const maxDepth = Math.max(...timeline.map(s => Math.max(s.startDepth, s.endDepth)), 1)

  const plotW = WIDTH - PADDING.left - PADDING.right
  const plotH = HEIGHT - PADDING.top - PADDING.bottom

  function xOf(sec: number) {
    return PADDING.left + (sec / totalSec) * plotW
  }
  function yOf(depth: number) {
    return PADDING.top + (depth / maxDepth) * plotH
  }

  const points = timeline
    .flatMap(s => [
      { x: xOf(s.startSec), y: yOf(s.startDepth) },
      { x: xOf(s.endSec), y: yOf(s.endDepth) },
    ])
    .filter((p, i, arr) => i === 0 || p.x !== arr[i - 1].x || p.y !== arr[i - 1].y)

  const pathData =
    `M ${points[0].x} ${points[0].y} ` +
    points
      .slice(1)
      .map(p => `L ${p.x} ${p.y}`)
      .join(' ')

  return (
    <svg width={WIDTH} height={HEIGHT} className="w-full">
      {/* Depth axis */}
      <text x={PADDING.left - 4} y={PADDING.top + 4} fontSize="8" textAnchor="end" fill="#666">
        0
      </text>
      <text x={PADDING.left - 4} y={PADDING.top + plotH} fontSize="8" textAnchor="end" fill="#666">
        {maxDepth}m
      </text>

      {/* Profile line */}
      <path d={pathData} fill="none" stroke="#2563eb" strokeWidth="2" />
      {/* Shaded area under profile */}
      <path
        d={`${pathData} L ${points[points.length - 1].x} ${PADDING.top + plotH} L ${PADDING.left} ${PADDING.top + plotH} Z`}
        fill="#2563eb"
        fillOpacity="0.1"
      />
    </svg>
  )
}
