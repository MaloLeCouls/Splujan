import { N2_HALFTIMES, N2_A, N2_B, PH2O, WATER_DENSITY, CABIN_PRESSURE } from './constants'

/** Initialise compartments to surface-equilibrium values for the given gas mix. */
export function initSurfaceCompartments(surfacePressure: number, fN2: number): number[] {
  const pN2 = (surfacePressure - PH2O) * fN2
  return N2_HALFTIMES.map(() => pN2)
}

/**
 * Advance compartment tensions by deltaTimeSec seconds at constant ambientPressure.
 * Uses the exact Haldane formula (valid for any dt, not just small steps).
 */
export function updateCompartments(
  compartments: number[],
  deltaTimeSec: number,
  ambientPressure: number,
  fN2: number,
): number[] {
  const pInspired = (ambientPressure - PH2O) * fN2
  return compartments.map((pOld, i) => {
    const k = Math.LN2 / N2_HALFTIMES[i] // per minute
    return pInspired + (pOld - pInspired) * Math.exp((-k * deltaTimeSec) / 60)
  })
}

/**
 * Ceiling pressure for a single compartment using the GF-adjusted M-value.
 * Returns pressure in bar; may be below surfacePressure (no stop needed).
 */
function compartmentCeilingPressure(pComp: number, a: number, b: number, gf: number): number {
  // Derived from: pComp = pCeiling * (1 - gf + gf/b) + gf * a
  return (pComp - gf * a) / (1 - gf + gf / b)
}

/**
 * Compute the minimum depth (m) the diver must stay at or shallower ascent to.
 * Returns 0 when no decompression obligation exists.
 */
export function computeCeilingDepth(
  compartments: number[],
  gf: number,
  surfacePressure: number,
): number {
  let maxCeilingPressure = surfacePressure
  for (let i = 0; i < compartments.length; i++) {
    const cp = compartmentCeilingPressure(compartments[i], N2_A[i], N2_B[i], gf)
    if (cp > maxCeilingPressure) maxCeilingPressure = cp
  }
  return Math.max(0, (maxCeilingPressure - surfacePressure) * WATER_DENSITY)
}

/**
 * No-decompression limit in minutes at the given depth.
 * Returns 0 if already in decompression; capped at 99 min.
 * Uses 1-minute resolution (matches dive-table display granularity).
 */
export function computeNDL(
  compartments: number[],
  depth: number,
  fN2: number,
  gf: number,
  surfacePressure: number,
): number {
  if (computeCeilingDepth(compartments, gf, surfacePressure) > 0) return 0

  const ambientPressure = surfacePressure + depth / WATER_DENSITY
  let simComp = [...compartments]

  for (let min = 0; min < 99; min++) {
    // Advance 1 minute at constant depth — exact with Haldane (dt=60s)
    simComp = updateCompartments(simComp, 60, ambientPressure, fN2)
    if (computeCeilingDepth(simComp, gf, surfacePressure) > 0) return min
  }
  return 99
}

/**
 * Simulate an ascent from currentDepth and return the list of required deco stops.
 * Uses a 1-second step ascent at ascentRateMetersPerMin; honours ceiling at each step.
 * Stops are rounded to the nearest 3 m multiple (min 3 m), deepest first.
 * Capped at 4 hours of simulated deco to prevent runaway calculation.
 */
export function computeDecoStops(
  compartments: number[],
  currentDepth: number,
  fN2: number,
  gf: number,
  surfacePressure: number,
  ascentRateMetersPerMin = 9,
): { depth: number; durationSec: number }[] {
  if (currentDepth < 0.1) return []

  const stopMap = new Map<number, number>()
  let comp = [...compartments]
  let depth = currentDepth
  const ascentPerSec = ascentRateMetersPerMin / 60
  const maxIterations = 4 * 3600

  for (let i = 0; i < maxIterations; i++) {
    if (depth < 0.1) break

    const ceiling = computeCeilingDepth(comp, gf, surfacePressure)
    const nextDepth = Math.max(0, depth - ascentPerSec)

    if (ceiling <= nextDepth) {
      // Safe to ascend
      const nextAmbient = surfacePressure + nextDepth / WATER_DENSITY
      comp = updateCompartments(comp, 1, nextAmbient, fN2)
      depth = nextDepth
    } else {
      // Must hold — snap to nearest 3 m stop (minimum 3 m)
      const stopDepth = Math.max(3, Math.ceil(ceiling / 3) * 3)
      if (depth < stopDepth) depth = stopDepth
      const stopAmbient = surfacePressure + depth / WATER_DENSITY
      comp = updateCompartments(comp, 1, stopAmbient, fN2)
      stopMap.set(depth, (stopMap.get(depth) ?? 0) + 1)
    }
  }

  return [...stopMap.entries()]
    .map(([d, dur]) => ({ depth: d, durationSec: dur }))
    .sort((a, b) => b.depth - a.depth)
}

/**
 * Compute how many minutes before all compartments fall within the GF_high M-value
 * at the given target pressure (default: no-fly cabin pressure).
 * Uses 5-minute resolution; capped at 48 hours.
 */
export function computeForwardClearanceMinutes(
  compartments: number[],
  fN2: number,
  surfacePressure: number,
  targetPressure = CABIN_PRESSURE,
  gf = 1.0,
): number {
  let comp = [...compartments]
  // Quickly check if already clear
  if (computeCeilingDepth(comp, gf, targetPressure) <= 0) return 0

  for (let min = 5; min <= 48 * 60; min += 5) {
    comp = updateCompartments(comp, 5 * 60, surfacePressure, fN2)
    if (computeCeilingDepth(comp, gf, targetPressure) <= 0) return min
  }
  return 48 * 60
}

/**
 * Compute desaturation time in minutes (all tissues back to ≤105% of surface equilibrium).
 * Uses 5-minute resolution; capped at 48 hours.
 */
export function computeDesaturationMinutes(
  compartments: number[],
  fN2: number,
  surfacePressure: number,
): number {
  const equilibrium = (surfacePressure - PH2O) * fN2
  const threshold = equilibrium * 1.05
  let comp = [...compartments]

  if (comp.every(p => p <= threshold)) return 0

  for (let min = 5; min <= 48 * 60; min += 5) {
    comp = updateCompartments(comp, 5 * 60, surfacePressure, fN2)
    if (comp.every(p => p <= threshold)) return min
  }
  return 48 * 60
}
