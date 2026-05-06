import type { DiveEvent } from '../types'

/** Mutable simulation context that events can modify. */
export type SimContext = {
  effectiveSac: number
  tankPressure: number
  forcedAscentRate: number | null
}

/**
 * Apply any events firing at the given timeSec, mutating ctx.
 * Returns the list of event types that fired this tick (for state flags).
 */
export function applyEvents(
  ctx: SimContext,
  events: DiveEvent[],
  timeSec: number,
): string[] {
  const fired: string[] = []

  for (const ev of events) {
    if (ev.triggerAtSec !== timeSec) continue

    fired.push(ev.type)

    switch (ev.type) {
      case 'sac_change':
        if (typeof ev.params?.newSac === 'number') {
          ctx.effectiveSac = ev.params.newSac as number
        }
        break

      case 'panic':
        // Panic → double the SAC (breathing very fast)
        ctx.effectiveSac = ctx.effectiveSac * 2
        break

      case 'ooa':
        ctx.tankPressure = 0
        break

      case 'rapid_ascent':
        // Force a fast ascent rate from this point (18 m/min — alarm threshold)
        ctx.forcedAscentRate = 18
        break

      case 'skip_stop':
        // Handled by the profile segments directly; no sim-context change needed
        break
    }
  }

  return fired
}
