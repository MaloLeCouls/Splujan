import type { DiveProfile, DiveState } from '../types'
import {
  initSurfaceCompartments,
  updateCompartments,
  computeCeilingDepth,
  computeNDL,
  computeDecoStops,
  computeForwardClearanceMinutes,
  computeDesaturationMinutes,
} from './buhlmann'
import { getTotalDurationSec, getDepthAtTime } from './profile'
import { applyEvents, type SimContext } from './events'
import { WATER_DENSITY, ASCENT_RATE_WARNING, ASCENT_RATE_DANGER } from './constants'

const WATER_TEMP_DEFAULT = 15 // °C, constant in V1

export class Simulator {
  private readonly states: DiveState[]
  readonly totalDurationSec: number

  constructor(profile: DiveProfile) {
    this.states = this.precompute(profile)
    this.totalDurationSec = this.states.length - 1
  }

  getStateAt(timeSec: number): DiveState {
    const idx = Math.min(Math.max(0, Math.floor(timeSec)), this.states.length - 1)
    return this.states[idx]
  }

  private precompute(profile: DiveProfile): DiveState[] {
    const totalSec = getTotalDurationSec(profile)
    const fN2 = 1 - profile.gas.o2Fraction
    const { high: gfHigh } = profile.gradientFactors

    // Initialise compartments
    let compartments = initSurfaceCompartments(profile.surfacePressure, fN2)

    // Apply previous dive surface interval if specified
    if (profile.previousDive) {
      compartments = profile.previousDive.finalCompartments.slice()
      compartments = updateCompartments(
        compartments,
        profile.previousDive.surfaceIntervalMinutes * 60,
        profile.surfacePressure,
        fN2,
      )
    }

    const ctx: SimContext = {
      effectiveSac: profile.sac,
      tankPressure: profile.startingTankPressure,
      forcedAscentRate: null,
    }

    const sortedEvents = [...profile.events].sort((a, b) => a.triggerAtSec - b.triggerAtSec)

    let maxDepth = 0
    const states: DiveState[] = []

    for (let t = 0; t <= totalSec; t++) {
      // Apply events for this tick
      applyEvents(ctx, sortedEvents, t)

      const depth = getDepthAtTime(profile, t)
      const prevDepth = t > 0 ? getDepthAtTime(profile, t - 1) : 0

      if (depth > maxDepth) maxDepth = depth

      const ambientPressure = profile.surfacePressure + depth / WATER_DENSITY

      // Update compartments (skip t=0 — start at initial state)
      if (t > 0) {
        compartments = updateCompartments(compartments, 1, ambientPressure, fN2)

        // Tank pressure: constant SAC (V1 simplification — no depth scaling)
        if (depth > 0 && ctx.tankPressure > 0) {
          ctx.tankPressure = Math.max(
            0,
            ctx.tankPressure - ctx.effectiveSac / (profile.tankVolume * 60),
          )
        }
      }

      // Ascent rate: positive = ascending, negative = descending (per spec)
      const ascentRate = (prevDepth - depth) * 60

      // Decompression status
      const ceilingDepth = computeCeilingDepth(compartments, gfHigh, profile.surfacePressure)
      const inDecompression = ceilingDepth > 0.1

      // NDL (only meaningful when at depth and not already in deco)
      let ndlMinutes: number | null = null
      if (!inDecompression && depth > 1) {
        ndlMinutes = computeNDL(compartments, depth, fN2, gfHigh, profile.surfacePressure)
      }

      // Deco stops schedule (only when in deco or still at depth)
      let decoStops: { depth: number; durationSec: number }[] = []
      let totalAscentTimeSec = 0
      if (depth > 0.1) {
        decoStops = computeDecoStops(
          compartments,
          depth,
          fN2,
          gfHigh,
          profile.surfacePressure,
        )
        // Ascent time: direct ascent at 9 m/min + all deco stop durations
        const directAscentSec = Math.round((depth / 9) * 60)
        const decoSec = decoStops.reduce((sum, s) => sum + s.durationSec, 0)
        totalAscentTimeSec = directAscentSec + decoSec
      }

      // Ascent rate alarm
      let ascentRateAlarm: 'ok' | 'warning' | 'danger' = 'ok'
      if (ascentRate > ASCENT_RATE_DANGER) ascentRateAlarm = 'danger'
      else if (ascentRate > ASCENT_RATE_WARNING) ascentRateAlarm = 'warning'

      const isPostDive = depth < 0.1 && maxDepth > 1 && t > 0

      states.push({
        timeSec: t,
        depth,
        maxDepth,
        ascentRate,
        tankPressure: ctx.tankPressure,
        waterTemp: WATER_TEMP_DEFAULT,
        gas: { o2Fraction: profile.gas.o2Fraction },
        compartments: [...compartments],
        ndlMinutes,
        ceilingDepth,
        decoStops,
        totalAscentTimeSec,
        inDecompression,
        ascentRateAlarm,
        isPostDive,
        noFlyTimeMinutes: 0,
        desaturationTimeMinutes: 0,
      })
    }

    // Back-fill noFlyTime and desatTime for post-dive states
    // Compute once at the transition to post-dive
    let postDiveComputed = false
    let noFlyTimeMinutes = 0
    let desaturationTimeMinutes = 0

    for (let i = states.length - 1; i >= 0; i--) {
      const s = states[i]
      if (s.isPostDive && !postDiveComputed) {
        noFlyTimeMinutes = computeForwardClearanceMinutes(
          s.compartments,
          fN2,
          profile.surfacePressure,
        )
        desaturationTimeMinutes = computeDesaturationMinutes(
          s.compartments,
          fN2,
          profile.surfacePressure,
        )
        postDiveComputed = true
      }
      if (s.isPostDive) {
        states[i] = { ...s, noFlyTimeMinutes, desaturationTimeMinutes }
      }
    }

    return states
  }
}
