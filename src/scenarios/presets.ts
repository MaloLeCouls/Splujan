import type { DiveProfile } from '../types'

function makeProfile(overrides: Partial<DiveProfile> & Pick<DiveProfile, 'id' | 'name' | 'segments'>): DiveProfile {
  return {
    description: '',
    createdAt: 0,
    updatedAt: 0,
    gas: { o2Fraction: 0.21 },
    surfacePressure: 1.013,
    startingTankPressure: 200,
    tankVolume: 12,
    sac: 20,
    events: [],
    gradientFactors: { low: 30, high: 85 },
    ...overrides,
  }
}

/**
 * 1 — Plongée N2 standard (20 m / 30 min)
 * Aucun palier obligatoire. Idéal pour montrer la lecture normale.
 */
const STANDARD_N2: DiveProfile = makeProfile({
  id: 'preset-standard-n2',
  name: 'Plongée N2 standard',
  description: 'Descente à 20 m en 2 min, fond 30 min, remontée 9 m/min avec palier de sécurité 3 min à 3 m. Aucun palier obligatoire.',
  segments: [
    { type: 'descent', toDepth: 20, durationSec: 2 * 60 },
    { type: 'constant', depth: 20, durationSec: 30 * 60 },
    { type: 'ascent', toDepth: 3, durationSec: Math.round((20 - 3) / 9 * 60) },
    { type: 'constant', depth: 3, durationSec: 3 * 60 },
    { type: 'ascent', toDepth: 0, durationSec: Math.round(3 / 9 * 60) },
  ],
})

/**
 * 2 — Première plongée à la limite (25 m / 35 min)
 * Frôle la fin de courbe, NDL qui descend, palier de sécurité conseillé.
 */
const LIMIT_DIVE: DiveProfile = makeProfile({
  id: 'preset-limit',
  name: 'Première plongée à la limite',
  description: 'Descente à 25 m en 2 min, fond 35 min. Frôle la limite NDL. Montre le NDL qui descend vers zéro.',
  segments: [
    { type: 'descent', toDepth: 25, durationSec: 2 * 60 },
    { type: 'constant', depth: 25, durationSec: 35 * 60 },
    { type: 'ascent', toDepth: 3, durationSec: Math.round((25 - 3) / 9 * 60) },
    { type: 'constant', depth: 3, durationSec: 3 * 60 },
    { type: 'ascent', toDepth: 0, durationSec: Math.round(3 / 9 * 60) },
  ],
})

/**
 * 3 — Plongée avec palier obligatoire (30 m / 30 min)
 * Sort de la courbe. Montre l'apparition du "STOP" et des paliers.
 */
const DECO_DIVE: DiveProfile = makeProfile({
  id: 'preset-deco',
  name: 'Plongée avec palier obligatoire',
  description: 'Descente à 30 m en 3 min, fond 30 min. Sort de la courbe NDL. Palier obligatoire à 3 m. Montre le mode "STOP".',
  segments: [
    { type: 'descent', toDepth: 30, durationSec: 3 * 60 },
    { type: 'constant', depth: 30, durationSec: 30 * 60 },
    { type: 'ascent', toDepth: 3, durationSec: Math.round((30 - 3) / 9 * 60) },
    { type: 'constant', depth: 3, durationSec: 15 * 60 }, // palier obligatoire ~15 min
    { type: 'ascent', toDepth: 0, durationSec: Math.round(3 / 9 * 60) },
  ],
})

/**
 * 4 — Remontée rapide (20 m / 25 min + événement remontée rapide)
 * Montre l'alarme vitesse de remontée.
 */
const RAPID_ASCENT: DiveProfile = makeProfile({
  id: 'preset-rapid-ascent',
  name: 'Remontée rapide',
  description: 'Profil normal 20 m / 25 min, puis remontée rapide à 25 m/min. Déclenche l\'alarme SLOW.',
  segments: [
    { type: 'descent', toDepth: 20, durationSec: 2 * 60 },
    { type: 'constant', depth: 20, durationSec: 25 * 60 },
    // Fast ascent: 20m in 48 seconds ≈ 25 m/min
    { type: 'ascent', toDepth: 0, durationSec: 48 },
  ],
  events: [
    {
      id: 'evt-rapid-ascent',
      triggerAtSec: (2 + 25) * 60,
      type: 'rapid_ascent',
    },
  ],
})

/**
 * 5 — Plongée successive (après 1h30 de surface)
 * Compartiments chargés depuis plongée précédente. Montre l'impact de l'azote résiduel.
 * Note: finalCompartments are approximate values after a 20m/30min dive.
 */
const SUCCESSIVE_DIVE: DiveProfile = makeProfile({
  id: 'preset-successive',
  name: 'Plongée successive',
  description: 'Replongée à 18 m avec 1h30 d\'intervalle de surface après une plongée à 20 m / 30 min. Montre l\'impact de l\'azote résiduel sur le NDL.',
  previousDive: {
    surfaceIntervalMinutes: 90,
    // Approximate compartment tensions after 20m/30min dive (bar N2)
    // Faster compartments more saturated, slower ones near surface equilibrium
    finalCompartments: [
      0.85, 1.10, 1.30, 1.45, 1.50, 1.48, 1.42, 1.35,
      1.25, 1.15, 1.05, 0.98, 0.90, 0.85, 0.82, 0.80,
    ],
  },
  segments: [
    { type: 'descent', toDepth: 18, durationSec: 2 * 60 },
    { type: 'constant', depth: 18, durationSec: 25 * 60 },
    { type: 'ascent', toDepth: 3, durationSec: Math.round((18 - 3) / 9 * 60) },
    { type: 'constant', depth: 3, durationSec: 3 * 60 },
    { type: 'ascent', toDepth: 0, durationSec: Math.round(3 / 9 * 60) },
  ],
})

export const PRESET_SCENARIOS: DiveProfile[] = [
  STANDARD_N2,
  LIMIT_DIVE,
  DECO_DIVE,
  RAPID_ASCENT,
  SUCCESSIVE_DIVE,
]
