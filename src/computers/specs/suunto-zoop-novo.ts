import type { ComputerSpec } from '../spec-types'

/**
 * Suunto Zoop Novo — calibration spec.
 *
 * Coordinate system: screen-local pixels [0, 0, 166, 192]
 *   (matches the SVG viewport in ZoopNovo.tsx: SCR = { w:166, h:192 })
 *
 * Fields reference the SVG layout as-built; bboxes reflect rendered glyph
 * zones rather than photo measurements. For a photo-based renderer, rescale
 * using the real watch image dimensions.
 *
 * Screen states documented from Suunto Zoop Novo manual (AIR mode):
 *   Surface → Descent → Bottom (safe) → Bottom (NDL low) → Ascent
 *   → Safety stop / Deco stop → Post-dive → ER lock
 */
export const SUUNTO_ZOOP_NOVO_SPEC: ComputerSpec = {
  model: 'Suunto Zoop Novo',
  slug: 'suunto-zoop-novo',
  version: '1.0',
  image_size: [166, 192],
  screen_bbox: [0, 0, 166, 192],
  notes: [
    'SVG renderer (ZoopNovo.tsx) uses hardcoded positions; bboxes here document the geometry.',
    'GF simplification: only GF.high (85) is used — no depth-varying interpolation.',
    'SAC is constant (no depth scaling) — V1 simplification.',
    'Pressure: P_ambient = 1 + depth/10 bar (salt water).',
  ].join(' '),

  fields: {

    // ── Row 1: dive alarm indicator | depth | battery ─────────────────────
    // Manuel p.8 icône #2 — "Alarme de plongée" (3 arcs / haut-parleur).
    // S'affiche quand la fonction alarme de plongée est active en immersion.
    // NE PAS CONFONDRE avec l'icône #6 "Contacts d'eau actifs" qui affiche "AC".

    dive_alarm_indicator: {
      bbox: [2, 2, 18, 24],
      font: 'icon',
      size: 24,
      align: 'left',
      color: '#1b2b08',
      value_type: 'bool',
      confidence: 'high',
    },

    depth: {
      bbox: [42, 2, 76, 28],
      font: 'dseg7',
      size: 27,
      align: 'right',
      color: '#1b2b08',
      suffix: { text: 'm', size: 10, gap: 4 },
      value_type: 'number',
      value_format: '%.1f',
      max_chars: 5,       // "888.8" = 5 chars max
      confidence: 'high',
    },

    battery_icon: {
      bbox: [148, 6, 18, 8],
      font: 'segments',
      size: 8,
      align: 'left',
      color: '#1b2b08',
      value_type: 'enum',
      confidence: 'high',
    },

    // ── NDL zone (dive OK mode) ────────────────────────────────────────────

    ndl: {
      bbox: [13, 36, 140, 58],
      font: 'dseg7',
      size: 54,
      align: 'center',
      color: '#1b2b08',
      label: { text: 'NO DEC TIME', position: 'below', font: 'dseg14', size: 8 },
      blink: false,       // renderer enables blink when ndl ≤ 3
      value_type: 'number',
      value_format: '%d',
      max_chars: 2,
      confidence: 'high',
    },

    // ── Ascent-rate alarm (dive OK mode) ─────────────────────────────────

    slow_indicator: {
      bbox: [20, 113, 126, 16],
      font: 'dseg14',
      size: 13,
      align: 'center',
      color: '#1b2b08',
      blink: true,
      value_type: 'bool',
      confidence: 'high',
    },

    // ── Bottom row: wall clock | dive elapsed ─────────────────────────────

    time: {
      bbox: [5, 127, 66, 22],
      font: 'dseg7',
      size: 16,
      align: 'center',
      color: '#1b2b08',
      label: { text: 'TIME', position: 'below', font: 'dseg14', size: 7 },
      value_type: 'time',
      value_format: '%02d:%02d',
      max_chars: 5,
      confidence: 'high',
    },

    dive_time: {
      bbox: [95, 127, 66, 22],
      font: 'dseg7',
      size: 16,
      align: 'center',
      color: '#1b2b08',
      label: { text: 'DIVE TIME', position: 'below', font: 'dseg14', size: 7 },
      value_type: 'time',
      value_format: '%02d:%02d',
      max_chars: 5,
      confidence: 'high',
    },

    // ── Ghost row: max depth ──────────────────────────────────────────────

    max_depth: {
      bbox: [20, 175, 126, 12],
      font: 'dseg14',
      size: 8,
      align: 'center',
      color: '#1b2b08',
      suffix: { text: 'm', size: 7, gap: 2 },
      value_type: 'number',
      value_format: '%.1f',
      confidence: 'medium',
    },

    // ── Deco / stop mode ──────────────────────────────────────────────────

    stop_indicator: {
      bbox: [4, 53, 52, 18],
      font: 'dseg14',
      size: 15,
      align: 'center',
      color: '#1b2b08',
      blink: true,
      value_type: 'bool',
      confidence: 'high',
    },

    ceiling: {
      bbox: [48, 38, 90, 40],
      font: 'dseg7',
      size: 34,
      align: 'center',
      color: '#1b2b08',
      suffix: { text: 'm', size: 11, gap: 4 },
      value_type: 'number',
      value_format: '%d',
      max_chars: 2,
      confidence: 'high',
    },

    asc_time: {
      bbox: [4, 104, 74, 32],
      font: 'dseg7',
      size: 26,
      align: 'center',
      color: '#1b2b08',
      label: { text: 'DTR MIN', position: 'below', font: 'dseg14', size: 7 },
      value_type: 'number',
      value_format: '%d',
      max_chars: 2,
      confidence: 'high',
    },

    // ── Surface mode fields ────────────────────────────────────────────────

    date: {
      bbox: [28, 75, 110, 14],
      font: 'dseg14',
      size: 9,
      align: 'center',
      color: '#1b2b08',
      value_type: 'string',
      confidence: 'medium',
    },

    temperature: {
      bbox: [5, 109, 70, 26],
      font: 'dseg7',
      size: 20,
      align: 'center',
      color: '#1b2b08',
      suffix: { text: '°C', size: 10, gap: 4 },
      label: { text: 'TEMP', position: 'below', font: 'dseg14', size: 7 },
      value_type: 'number',
      value_format: '%d',
      confidence: 'medium',
    },

    mode: {
      bbox: [90, 109, 68, 28],
      font: 'dseg14',
      size: 22,
      align: 'center',
      color: '#1b2b08',
      label: { text: 'MODE', position: 'below', font: 'dseg14', size: 7 },
      value_type: 'enum',
      confidence: 'high',
    },

    // ── Post-dive mode ─────────────────────────────────────────────────────

    no_fly: {
      bbox: [5, 139, 74, 25],
      font: 'dseg7',
      size: 18,
      align: 'center',
      color: '#1b2b08',
      label: { text: 'NO FLY', position: 'below', font: 'dseg14', size: 7 },
      value_type: 'time',
      value_format: '%02dH%02d',
      confidence: 'high',
    },

    desat_time: {
      bbox: [87, 139, 74, 25],
      font: 'dseg7',
      size: 18,
      align: 'center',
      color: '#1b2b08',
      label: { text: 'DESAT', position: 'below', font: 'dseg14', size: 7 },
      value_type: 'number',
      value_format: '%d',
      confidence: 'high',
    },

  },

  // ── Presets from Suunto Zoop Novo manual (AIR mode) ────────────────────────
  // Each preset = one named screen state the watch can display.
  // visible_fields controls what the renderer shows; values are representative.
  // The simulation interpolates numeric fields between presets at runtime.

  presets: {

    surface_ready: {
      description: 'Surface view — no recent dive. Zoop Novo shows time, date, temp, AIR mode.',
      visible_fields: ['time', 'date', 'temperature', 'mode', 'battery_icon'],
      values: {
        time: [14, 27],
        date: '06 MAI',
        temperature: 22,
        mode: 'AIR',
        battery_icon: 3,
      },
    },

    surface_post_dive: {
      description: 'Surface view immediately after a dive — shows time and dive mode.',
      visible_fields: ['time', 'date', 'temperature', 'mode', 'battery_icon'],
      values: {
        time: [16, 5],
        date: '06 MAI',
        temperature: 22,
        mode: 'AIR',
        battery_icon: 3,
      },
    },

    descent: {
      description: 'Active descent — NDL counting down, no ascent-rate bar yet.',
      visible_fields: ['dive_alarm_indicator', 'depth', 'battery_icon', 'ndl', 'time', 'dive_time'],
      values: {
        depth: 12.0,
        ndl: 85,
        time: [14, 30],
        dive_time: [2, 30],
        dive_alarm_indicator: true,
        battery_icon: 3,
      },
    },

    bottom_safe: {
      description: 'At depth, well within NDL — typical recreational dive at 25 m.',
      visible_fields: ['dive_alarm_indicator', 'depth', 'battery_icon', 'ndl', 'time', 'dive_time', 'max_depth'],
      values: {
        depth: 25.0,
        ndl: 45,
        time: [14, 45],
        dive_time: [18, 0],
        dive_alarm_indicator: true,
        battery_icon: 3,
        max_depth: 25.0,
      },
    },

    bottom_ndl_low: {
      description: 'NDL ≤ 3 min — ndl display blinks, time to ascend.',
      visible_fields: ['dive_alarm_indicator', 'depth', 'battery_icon', 'ndl', 'time', 'dive_time', 'max_depth'],
      values: {
        depth: 25.0,
        ndl: 3,
        time: [15, 0],
        dive_time: [30, 0],
        dive_alarm_indicator: true,
        battery_icon: 3,
        max_depth: 25.0,
      },
      flags: ['ndl_blinking'],
    },

    ascending: {
      description: 'Controlled ascent within NDL — normal ascent rate.',
      visible_fields: ['dive_alarm_indicator', 'depth', 'battery_icon', 'ndl', 'time', 'dive_time', 'max_depth'],
      values: {
        depth: 18.0,
        ndl: 12,
        time: [15, 5],
        dive_time: [35, 0],
        dive_alarm_indicator: true,
        battery_icon: 3,
        max_depth: 25.0,
        ascent_rate_bar: 2,
      },
    },

    ascending_too_fast: {
      description: 'Ascent rate exceeds limit — SLOW blinks in alarm colour.',
      visible_fields: ['dive_alarm_indicator', 'depth', 'battery_icon', 'ndl', 'slow_indicator', 'time', 'dive_time'],
      values: {
        depth: 20.0,
        ndl: 8,
        slow_indicator: true,
        time: [15, 6],
        dive_time: [36, 0],
        dive_alarm_indicator: true,
        battery_icon: 3,
        ascent_rate_bar: 4,
      },
      flags: ['slow_blinking'],
    },

    safety_stop: {
      description: 'Safety stop at 5 m — STOP displayed (non-mandatory, 3 min recommended).',
      visible_fields: ['dive_alarm_indicator', 'depth', 'battery_icon', 'stop_indicator', 'ndl', 'time', 'dive_time'],
      values: {
        depth: 5.0,
        ndl: 0,
        stop_indicator: true,
        time: [15, 8],
        dive_time: [38, 0],
        dive_alarm_indicator: true,
        battery_icon: 3,
      },
      flags: ['stop_blinking'],
    },

    deco_required: {
      description: 'Decompression required — STOP blinks, ceiling and DTR displayed.',
      visible_fields: [
        'dive_alarm_indicator', 'depth', 'battery_icon',
        'stop_indicator', 'ceiling', 'asc_time', 'dive_time',
      ],
      values: {
        depth: 35.0,
        stop_indicator: true,
        ceiling: 3,
        asc_time: 12,
        dive_time: [45, 0],
        dive_alarm_indicator: true,
        battery_icon: 3,
      },
      flags: ['stop_blinking', 'alarm_active'],
    },

    deco_at_stop: {
      description: 'Executing a deco stop — diver at ceiling depth.',
      visible_fields: [
        'dive_alarm_indicator', 'depth', 'battery_icon',
        'stop_indicator', 'ceiling', 'asc_time', 'dive_time',
      ],
      values: {
        depth: 3.0,
        stop_indicator: true,
        ceiling: 3,
        asc_time: 5,
        dive_time: [50, 0],
        dive_alarm_indicator: true,
        battery_icon: 3,
      },
      flags: ['stop_blinking'],
    },

    post_dive: {
      description: 'Post-dive screen — duration, max depth, temp, no-fly, desat.',
      visible_fields: ['dive_time', 'max_depth', 'temperature', 'no_fly', 'desat_time'],
      values: {
        dive_time: [42, 15],
        max_depth: 25.0,
        temperature: 22,
        no_fly: [14, 30],
        desat_time: 4,
      },
    },

    er_lock: {
      description: 'Algorithm lock (ER) — diver skipped a mandatory deco stop.',
      visible_fields: ['depth', 'battery_icon'],
      values: {
        depth: 0.0,
        battery_icon: 3,
      },
      flags: ['er_lock_active', 'er_displayed'],
    },

    battery_low: {
      description: 'Low battery warning — battery icon changes, dive continues.',
      visible_fields: ['dive_alarm_indicator', 'depth', 'battery_icon', 'ndl', 'time', 'dive_time'],
      values: {
        depth: 15.0,
        ndl: 30,
        time: [14, 40],
        dive_time: [10, 0],
        dive_alarm_indicator: true,
        battery_icon: 0,
      },
      flags: ['battery_low'],
    },

  },
}
