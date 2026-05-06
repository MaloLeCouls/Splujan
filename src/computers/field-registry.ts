/**
 * Canonical field definitions — the "rows" of the cross-computer database.
 *
 * Matrix view:
 *   Rows    = canonical field names (keys of FIELD_REGISTRY)
 *   Columns = computers (keys of COMPUTER_REGISTRY)
 *   Cell    = FieldSpec — how that field renders on that computer
 *
 * Adding a new field: append an entry here, then add it to each computer
 * spec where the watch displays it.
 */

export type ValueType = 'number' | 'time' | 'string' | 'bool' | 'enum'
export type FieldCategory =
  | 'primary'   // depth, time, dive_time, temp
  | 'deco'      // NDL, ceiling, asc_time, ascent bar
  | 'surface'   // surf_time, no_fly, desat_time
  | 'gas'       // O2%, pO2, MOD, tank pressure
  | 'mode'      // AIR/NITROX/GAUGE/FREE, dive number
  | 'indicator' // icons, arrows, bar graphs
  | 'error'     // ER lock, slow
  | 'logbook'   // log_index, log_date, log_max_depth
  | 'freedive'  // apnea-specific fields

export interface FieldDefinition {
  description: string
  value_type: ValueType
  unit?: string
  /** Inclusive [min, max] for numeric/enum fields */
  range?: readonly [number, number]
  /** printf-style or token, e.g. '%.1f', '%02d:%02d' */
  value_format?: string
  category: FieldCategory
}

export const FIELD_REGISTRY = {
  // ── Primary dive data ─────────────────────────────────────────────────────
  depth: {
    description: 'Current depth',
    value_type: 'number', unit: 'm', range: [0, 330] as const,
    value_format: '%.1f', category: 'primary',
  },
  max_depth: {
    description: 'Maximum depth this dive',
    value_type: 'number', unit: 'm', range: [0, 330] as const,
    value_format: '%.1f', category: 'primary',
  },
  avg_depth: {
    description: 'Average depth this dive',
    value_type: 'number', unit: 'm',
    value_format: '%.1f', category: 'primary',
  },
  dive_time: {
    description: 'Elapsed dive time [min, sec]',
    value_type: 'time', value_format: '%02d:%02d', category: 'primary',
  },
  time: {
    description: 'Wall clock time [hour, min]',
    value_type: 'time', value_format: '%02d:%02d', category: 'primary',
  },
  date: {
    description: 'Calendar date string',
    value_type: 'string', category: 'primary',
  },
  temperature: {
    description: 'Water temperature',
    value_type: 'number', unit: '°C',
    value_format: '%d', category: 'primary',
  },

  // ── Decompression / ascent ────────────────────────────────────────────────
  ndl: {
    description: 'No-decompression limit remaining',
    value_type: 'number', unit: 'min', range: [0, 99] as const,
    value_format: '%d', category: 'deco',
  },
  asc_time: {
    description: 'Total ascent time required (deco mode)',
    value_type: 'number', unit: 'min',
    value_format: '%d', category: 'deco',
  },
  ceiling: {
    description: 'Decompression ceiling depth (first stop)',
    value_type: 'number', unit: 'm',
    value_format: '%d', category: 'deco',
  },
  floor: {
    description: 'Decompression floor depth',
    value_type: 'number', unit: 'm',
    value_format: '%d', category: 'deco',
  },
  safety_stop_time: {
    description: 'Safety stop countdown',
    value_type: 'number', unit: 'min',
    value_format: '%d', category: 'deco',
  },
  deep_stop_time: {
    description: 'Deep stop countdown',
    value_type: 'number', unit: 'min',
    value_format: '%d', category: 'deco',
  },
  ascent_rate_bar: {
    description: 'Visual ascent-rate indicator — 0=stationary, 5=fastest',
    value_type: 'enum', range: [0, 5] as const, category: 'deco',
  },
  tts: {
    description: 'Time to surface (total, Shearwater-style)',
    value_type: 'number', unit: 'min',
    value_format: '%d', category: 'deco',
  },

  // ── Surface interval / post-dive ──────────────────────────────────────────
  surf_time: {
    description: 'Surface interval time since last dive',
    value_type: 'time', value_format: '%02d:%02d', category: 'surface',
  },
  no_fly: {
    description: 'No-fly countdown [hour, min]',
    value_type: 'time', value_format: '%02dH%02d', category: 'surface',
  },
  desat_time: {
    description: 'Desaturation time remaining',
    value_type: 'number', unit: 'h',
    value_format: '%d', category: 'surface',
  },

  // ── Gas / Nitrox ──────────────────────────────────────────────────────────
  o2_percent: {
    description: 'O2 percentage in mix',
    value_type: 'number', unit: '%', range: [21, 100] as const,
    value_format: '%d', category: 'gas',
  },
  po2: {
    description: 'Partial pressure of O2',
    value_type: 'number', unit: 'bar',
    value_format: '%.2f', category: 'gas',
  },
  mod: {
    description: 'Maximum operating depth for current mix',
    value_type: 'number', unit: 'm',
    value_format: '%d', category: 'gas',
  },
  olf_percent: {
    description: 'Oxygen limit fraction',
    value_type: 'number', unit: '%', range: [0, 200] as const,
    value_format: '%d', category: 'gas',
  },
  gas_index: {
    description: 'Active gas slot number (multi-gas computers)',
    value_type: 'number', range: [1, 8] as const,
    value_format: '%d', category: 'gas',
  },
  tank_pressure: {
    description: 'Tank pressure (air-integrated computers only)',
    value_type: 'number', unit: 'bar', range: [0, 300] as const,
    value_format: '%d', category: 'gas',
  },

  // ── Mode / status ─────────────────────────────────────────────────────────
  mode: {
    description: 'Current mode string: AIR / NITROX / GAUGE / FREE',
    value_type: 'enum', category: 'mode',
  },
  dive_number: {
    description: 'Sequential dive number in the series',
    value_type: 'number',
    value_format: '%d', category: 'mode',
  },
  altitude_setting: {
    description: 'Altitude adjustment level (0–2)',
    value_type: 'number', range: [0, 2] as const, category: 'mode',
  },
  personal_setting: {
    description: 'Personal/conservatism setting (0–2)',
    value_type: 'number', range: [0, 2] as const, category: 'mode',
  },

  // ── Indicators / icons ────────────────────────────────────────────────────
  ac_indicator: {
    description: 'Wet contacts active / dive mode triggered (AC waves icon)',
    value_type: 'bool', category: 'indicator',
  },
  battery_icon: {
    description: 'Battery level indicator (0=empty … 3=full)',
    value_type: 'enum', range: [0, 3] as const, category: 'indicator',
  },
  battery_low: {
    description: 'Low battery warning flag',
    value_type: 'bool', category: 'indicator',
  },
  alarm_icon: {
    description: 'Generic warning / alarm triangle',
    value_type: 'bool', category: 'indicator',
  },
  stop_indicator: {
    description: 'STOP indicator — deco or safety stop required',
    value_type: 'bool', category: 'indicator',
  },
  slow_indicator: {
    description: 'SLOW warning — ascent rate exceeds limit',
    value_type: 'bool', category: 'error',
  },
  bookmark_icon: {
    description: 'Bookmark set during dive',
    value_type: 'bool', category: 'indicator',
  },
  up_arrow: {
    description: 'Ascend instruction arrow',
    value_type: 'bool', category: 'indicator',
  },
  down_arrow: {
    description: 'Descend instruction arrow',
    value_type: 'bool', category: 'indicator',
  },
  airplane_no: {
    description: '"No fly" airplane-with-cross icon',
    value_type: 'bool', category: 'indicator',
  },
  tissue_bar: {
    description: 'Tissue saturation bar graph (0–100%)',
    value_type: 'number', unit: '%', range: [0, 100] as const, category: 'indicator',
  },
  n2_bar: {
    description: 'Nitrogen loading bar',
    value_type: 'number', unit: '%', range: [0, 100] as const, category: 'indicator',
  },
  o2_bar: {
    description: 'Oxygen loading bar (OTU)',
    value_type: 'number', unit: '%', range: [0, 100] as const, category: 'indicator',
  },

  // ── Error / status ────────────────────────────────────────────────────────
  error_code: {
    description: 'Algorithm lock error code (ER)',
    value_type: 'string', category: 'error',
  },

  // ── Free-dive specific ────────────────────────────────────────────────────
  apnea_timer: {
    description: 'Apnea cycle countdown',
    value_type: 'number', unit: 's', category: 'freedive',
  },
  vent_time: {
    description: 'Ventilation time between apnea dives',
    value_type: 'number', unit: 's', category: 'freedive',
  },
  surface_countdown: {
    description: 'Surface interval countdown for next apnea dive',
    value_type: 'number', unit: 's', category: 'freedive',
  },
  apnea_depth_alarm: {
    description: 'Depth notification threshold for apnea',
    value_type: 'number', unit: 'm', category: 'freedive',
  },

  // ── Logbook / memory views ────────────────────────────────────────────────
  log_index: {
    description: 'Log entry number',
    value_type: 'number', value_format: '%d', category: 'logbook',
  },
  log_date: {
    description: 'Date of logged dive',
    value_type: 'string', category: 'logbook',
  },
  log_max_depth: {
    description: 'Max depth of logged dive',
    value_type: 'number', unit: 'm', value_format: '%.1f', category: 'logbook',
  },
  log_dive_time: {
    description: 'Duration of logged dive',
    value_type: 'number', unit: 'min', value_format: '%d', category: 'logbook',
  },
} as const satisfies Record<string, FieldDefinition>

export type CanonicalFieldName = keyof typeof FIELD_REGISTRY

/** All canonical field names grouped by category */
export function getFieldsByCategory(category: FieldCategory): CanonicalFieldName[] {
  return (Object.entries(FIELD_REGISTRY) as [CanonicalFieldName, FieldDefinition][])
    .filter(([, def]) => def.category === category)
    .map(([name]) => name)
}
