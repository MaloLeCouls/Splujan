import type { DiveProfile, DiveSegment } from '../types'

/** Total planned dive duration from the profile segments (excludes computed deco). */
export function getTotalDurationSec(profile: DiveProfile): number {
  return profile.segments.reduce((sum, s) => sum + s.durationSec, 0)
}

/** Maximum planned depth from profile segments. */
export function getProfileMaxDepth(profile: DiveProfile): number {
  let max = 0
  for (const seg of profile.segments) {
    const d = seg.type === 'constant' ? seg.depth : seg.toDepth
    if (d > max) max = d
  }
  return max
}

/**
 * Depth at a given time in seconds, interpolated linearly across segments.
 * Returns 0 after the last segment (surface).
 */
export function getDepthAtTime(profile: DiveProfile, timeSec: number): number {
  let elapsed = 0
  let prevDepth = 0

  for (const segment of profile.segments) {
    const segStart = elapsed
    const segEnd = elapsed + segment.durationSec

    if (timeSec <= segEnd) {
      const t = timeSec - segStart
      return interpolateSegmentDepth(segment, prevDepth, t)
    }

    prevDepth = segmentEndDepth(segment, prevDepth)
    elapsed = segEnd
  }

  return 0
}

function interpolateSegmentDepth(
  seg: DiveSegment,
  startDepth: number,
  elapsedWithinSeg: number,
): number {
  const progress = elapsedWithinSeg / seg.durationSec

  if (seg.type === 'constant') {
    return seg.depth
  }

  // descent or ascent: linear interpolation
  const endDepth = seg.toDepth
  return startDepth + (endDepth - startDepth) * progress
}

function segmentEndDepth(seg: DiveSegment, prevDepth: number): number {
  if (seg.type === 'constant') return seg.depth
  if (seg.type === 'descent' || seg.type === 'ascent') return seg.toDepth
  return prevDepth
}

/**
 * Returns the ordered list of (startTime, endTime, startDepth, endDepth) per segment.
 * Useful for rendering the profile chart.
 */
export function getSegmentTimeline(
  profile: DiveProfile,
): { startSec: number; endSec: number; startDepth: number; endDepth: number }[] {
  const result = []
  let elapsed = 0
  let prevDepth = 0

  for (const seg of profile.segments) {
    const start = elapsed
    const end = elapsed + seg.durationSec
    const endDepth = segmentEndDepth(seg, prevDepth)
    const startDepth = seg.type === 'constant' ? seg.depth : prevDepth

    result.push({ startSec: start, endSec: end, startDepth, endDepth })
    prevDepth = endDepth
    elapsed = end
  }

  return result
}
