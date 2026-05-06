// Bühlmann ZH-L16C tissue compartment constants
// 16 tissue compartments for N2

export const N2_HALFTIMES = [
  4.0, 8.0, 12.5, 18.5, 27.0, 38.3, 54.3, 77.0,
  109.0, 146.0, 187.0, 239.0, 305.0, 390.0, 498.0, 635.0,
]

// a coefficients (bar)
export const N2_A = [
  1.2599, 1.0000, 0.8618, 0.7562, 0.6200, 0.5043, 0.4410, 0.4000,
  0.3750, 0.3500, 0.3295, 0.3065, 0.2835, 0.2610, 0.2480, 0.2327,
]

// b coefficients (dimensionless)
export const N2_B = [
  0.5050, 0.6514, 0.7222, 0.7825, 0.8126, 0.8434, 0.8693, 0.8910,
  0.9092, 0.9222, 0.9319, 0.9403, 0.9477, 0.9544, 0.9602, 0.9653,
]

// Partial pressure of water vapour in the lungs (bar)
export const PH2O = 0.0627

// 1 metre of seawater ≈ 0.1 bar (salt water, density ~1025 kg/m³)
export const WATER_DENSITY = 10

// Nitrogen fraction in air (remainder is mostly O2)
export const FN2_AIR = 0.79

// No-fly cabin pressure threshold (bar) — typical commercial aircraft pressurisation
export const CABIN_PRESSURE = 0.75

// Ascent rate thresholds (m/min)
export const ASCENT_RATE_WARNING = 10
export const ASCENT_RATE_DANGER = 18
