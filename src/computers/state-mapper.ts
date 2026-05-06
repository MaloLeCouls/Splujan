import type { DiveState } from '../types'

/**
 * Canonical field values — what the display layer consumes.
 * Keys match FIELD_REGISTRY. Values are typed per value_type:
 *   number  → number | null
 *   time    → [number, number]  (e.g. [14, 27] for 14:27)
 *   string  → string
 *   bool    → boolean
 *   enum    → number | string
 */
export type CanonicalValues = Record<string, unknown>

/** Translate DiveState (engine output) → canonical field values (display input). */
export function mapStateToCanonical(state: DiveState, wallClock = new Date()): CanonicalValues {
  const ascentRateBar = computeAscentBar(state)
  const diveMin = Math.floor(state.timeSec / 60)
  const diveSec = Math.floor(state.timeSec % 60)
  const noFlyH = Math.floor(state.noFlyTimeMinutes / 60)
  const noFlyM = Math.round(state.noFlyTimeMinutes % 60)

  return {
    // Primary
    depth:       state.depth,
    max_depth:   state.maxDepth,
    dive_time:   [diveMin, diveSec],
    time:        [wallClock.getHours(), wallClock.getMinutes()],
    date:        wallClock.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase(),
    temperature: state.waterTemp,

    // Deco
    ndl:             state.ndlMinutes !== null ? Math.floor(state.ndlMinutes) : null,
    asc_time:        Math.ceil(state.totalAscentTimeSec / 60),
    ceiling:         state.ceilingDepth,
    ascent_rate_bar: ascentRateBar,

    // Post-dive / surface
    no_fly:     [noFlyH, noFlyM],
    desat_time: Math.ceil(state.desaturationTimeMinutes / 60),

    // Gas
    o2_percent:    Math.round(state.gas.o2Fraction * 100),
    tank_pressure: Math.round(state.tankPressure),

    // Indicators derived from state
    ac_indicator:   state.depth > 0.5,
    slow_indicator: state.ascentRateAlarm !== 'ok',
    stop_indicator: state.inDecompression,
    battery_icon:   3,  // no battery sensor in sim — always show full
  }
}

function computeAscentBar(state: DiveState): number {
  if (state.ascentRate >= 0) return 0
  const rate = -state.ascentRate
  if (rate < 3) return 1
  if (rate < 6) return 2
  if (rate < 9) return 3
  if (rate < 12) return 4
  return 5
}
