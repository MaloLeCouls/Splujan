import { useRef } from 'react'
import type { DiveProfile } from '../../types'
import { getSegmentTimeline } from '../../engine/profile'

type Props = {
  profile: DiveProfile
  tSec: number
  onScrub: (t: number) => void
}

const HEIGHT = 64
const PAD = 8

export default function TimelineMini({ profile, tSec, onScrub }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const timeline = getSegmentTimeline(profile)
  if (timeline.length === 0) return null

  const totalSec = timeline[timeline.length - 1].endSec
  const maxDepth = Math.max(...timeline.map(s => Math.max(s.startDepth, s.endDepth)), 1)

  const points: { x: number; y: number }[] = []
  for (const seg of timeline) {
    points.push({ x: (seg.startSec / totalSec) * 100, y: (seg.startDepth / maxDepth) * 100 })
    points.push({ x: (seg.endSec / totalSec) * 100, y: (seg.endDepth / maxDepth) * 100 })
  }

  const pathData = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} ` +
    points.slice(1).map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')

  const areaData = `${pathData} L 100 100 L 0 100 Z`
  const cursorX = totalSec > 0 ? (tSec / totalSec) * 100 : 0

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onScrub(ratio * totalSec)
  }

  return (
    <div
      ref={ref}
      onMouseDown={handleScrub}
      onMouseMove={e => { if (e.buttons === 1) handleScrub(e) }}
      style={{
        position: 'relative',
        height: HEIGHT,
        padding: `${PAD}px 24px ${PAD}px`,
        cursor: 'crosshair',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <line x1="0" y1="0" x2="100" y2="0" stroke="var(--line)" strokeDasharray="0.5 1"/>
        <path d={areaData} fill="var(--accent)" fillOpacity="0.08" vectorEffect="non-scaling-stroke"/>
        <path d={pathData} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>

        <line
          x1={cursorX} x2={cursorX} y1={-4} y2={104}
          stroke="var(--ink)" strokeWidth="1" vectorEffect="non-scaling-stroke"
        />
        <circle cx={cursorX} cy="0" r="3" fill="var(--ink)" vectorEffect="non-scaling-stroke"/>
      </svg>
    </div>
  )
}
