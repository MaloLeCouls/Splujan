export type DiveProfile = {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number

  gas: { o2Fraction: number }
  surfacePressure: number
  startingTankPressure: number
  tankVolume: number
  sac: number

  previousDive?: {
    surfaceIntervalMinutes: number
    finalCompartments: number[]
  }

  segments: DiveSegment[]
  events: DiveEvent[]

  gradientFactors: { low: number; high: number }
}

export type DiveSegment =
  | { type: 'descent'; toDepth: number; durationSec: number }
  | { type: 'constant'; depth: number; durationSec: number }
  | { type: 'ascent'; toDepth: number; durationSec: number }

export type DiveEvent = {
  id: string
  triggerAtSec: number
  type: 'panic' | 'ooa' | 'rapid_ascent' | 'skip_stop' | 'sac_change'
  params?: Record<string, unknown>
}

export type DiveState = {
  timeSec: number
  depth: number
  maxDepth: number
  ascentRate: number
  tankPressure: number
  waterTemp: number
  gas: { o2Fraction: number }

  compartments: number[]
  ndlMinutes: number | null
  ceilingDepth: number
  decoStops: { depth: number; durationSec: number }[]
  totalAscentTimeSec: number

  inDecompression: boolean
  ascentRateAlarm: 'ok' | 'warning' | 'danger'
  isPostDive: boolean
  noFlyTimeMinutes: number
  desaturationTimeMinutes: number

  gpsLetter?: string
}
