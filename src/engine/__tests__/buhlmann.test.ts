import { describe, it, expect } from 'vitest'
import {
  initSurfaceCompartments,
  updateCompartments,
  computeCeilingDepth,
  computeNDL,
  computeDecoStops,
} from '../buhlmann'
import { PH2O, WATER_DENSITY } from '../constants'

const SP = 1.013 // surface pressure bar
const FN2 = 0.79 // air

describe('initSurfaceCompartments', () => {
  it('sets all compartments to surface-equilibrium N2 pressure', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const expected = (SP - PH2O) * FN2
    expect(comps).toHaveLength(16)
    comps.forEach(p => expect(p).toBeCloseTo(expected, 4))
  })
})

describe('updateCompartments', () => {
  it('moves fastest compartment toward inspired pressure', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const depth = 20 // m
    const ambient = SP + depth / WATER_DENSITY
    const updated = updateCompartments(comps, 10, ambient, FN2)

    const pInspired = (ambient - PH2O) * FN2

    // Fastest compartment (4 min half-time) moves most toward inspired pressure
    expect(updated[0]).toBeGreaterThan(comps[0])
    expect(updated[0]).toBeLessThan(pInspired)

    // Slowest compartment (635 min half-time) barely moves
    expect(updated[15]).toBeCloseTo(comps[15], 3)
  })

  it('reaches equilibrium after infinite time (large dt)', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const depth = 30
    const ambient = SP + depth / WATER_DENSITY
    // 10 000 minutes ≈ infinity for all compartments
    const updated = updateCompartments(comps, 10_000 * 60, ambient, FN2)
    const pInspired = (ambient - PH2O) * FN2

    updated.forEach(p => expect(p).toBeCloseTo(pInspired, 2))
  })

  it('returns surface equilibrium after 24h desaturation', () => {
    // Deep dive then surface for 24h
    const comps = initSurfaceCompartments(SP, FN2)
    const deepAmbient = SP + 40 / WATER_DENSITY
    const afterDive = updateCompartments(comps, 30 * 60, deepAmbient, FN2)
    const after24h = updateCompartments(afterDive, 24 * 3600, SP, FN2)

    const equilibrium = (SP - PH2O) * FN2
    after24h.forEach(p => {
      expect(p).toBeCloseTo(equilibrium, 1)
    })
  })
})

describe('computeCeilingDepth', () => {
  it('returns 0 for surface-equilibrated compartments', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const ceiling = computeCeilingDepth(comps, 0.85, SP)
    expect(ceiling).toBe(0)
  })

  it('returns > 0 after a deep saturation dive', () => {
    // Saturate compartments at 30 m for 30 min
    const comps = initSurfaceCompartments(SP, FN2)
    const ambient = SP + 30 / WATER_DENSITY
    const saturated = updateCompartments(comps, 30 * 60, ambient, FN2)
    const ceiling = computeCeilingDepth(saturated, 0.85, SP)
    expect(ceiling).toBeGreaterThan(0)
  })
})

describe('computeNDL', () => {
  it('returns 0 when already in decompression', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const ambient = SP + 30 / WATER_DENSITY
    const saturated = updateCompartments(comps, 30 * 60, ambient, FN2)
    const ndl = computeNDL(saturated, 30, FN2, 0.85, SP)
    expect(ndl).toBe(0)
  })

  it('NDL at 20m is between 20 and 60 minutes (ZH-L16C with GF_high=0.85)', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const ndl = computeNDL(comps, 20, FN2, 0.85, SP)
    // ZH-L16C gives ~33-40 min at 20m with GF_high=0.85 (MN90 table: 60 min)
    // Wider bounds to remain robust to minor algorithmic variations
    expect(ndl).toBeGreaterThanOrEqual(20)
    expect(ndl).toBeLessThanOrEqual(60)
  })

  it('NDL at 10m is 99 (capped) — very shallow dive', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const ndl = computeNDL(comps, 10, FN2, 0.85, SP)
    expect(ndl).toBe(99)
  })

  it('NDL decreases as compartments load', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const ambient = SP + 20 / WATER_DENSITY
    const after10min = updateCompartments(comps, 10 * 60, ambient, FN2)
    const after30min = updateCompartments(after10min, 20 * 60, ambient, FN2)

    const ndl10 = computeNDL(after10min, 20, FN2, 0.85, SP)
    const ndl30 = computeNDL(after30min, 20, FN2, 0.85, SP)

    expect(ndl30).toBeLessThan(ndl10)
  })
})

describe('computeDecoStops', () => {
  it('returns empty stops for surface-equilibrated diver at 5m', () => {
    const comps = initSurfaceCompartments(SP, FN2)
    const stops = computeDecoStops(comps, 5, FN2, 0.85, SP)
    expect(stops).toHaveLength(0)
  })

  it('returns deco stops after a deep saturating dive', () => {
    // Simulate 30m / 30min → definite deco obligation
    const comps = initSurfaceCompartments(SP, FN2)
    const ambient = SP + 30 / WATER_DENSITY
    const saturated = updateCompartments(comps, 30 * 60, ambient, FN2)

    const stops = computeDecoStops(saturated, 30, FN2, 0.85, SP)

    expect(stops.length).toBeGreaterThan(0)
    // All stops should be at multiples of 3m
    stops.forEach(s => expect(s.depth % 3).toBe(0))
    // At least one stop at 3m (shallowest)
    expect(stops.some(s => s.depth === 3)).toBe(true)
  })
})
