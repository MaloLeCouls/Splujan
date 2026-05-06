import type { FieldConfig, FieldConfigMap } from './types'

export const ZOOP_NOVO_DEFAULTS: FieldConfigMap = {

  // ── SURFACE ───────────────────────────────────────────────────────────────
  surf_clock: {
    id: 'surf_clock', label: 'Heure (surface)', modes: ['surface'],
    left: 27, top: 42, width: 46,
    fontSizeRatio: 60 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  surf_date: {
    id: 'surf_date', label: 'Date', modes: ['surface'],
    left: 30, top: 53, width: 40,
    fontSizeRatio: 21 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  surf_temp_val: {
    id: 'surf_temp_val', label: 'Température valeur', modes: ['surface'],
    left: 31, top: 60,
    fontSizeRatio: 30 / 640, fontFamily: 'Iceland', align: 'left', visible: true,
  },
  surf_temp_lbl: {
    id: 'surf_temp_lbl', label: 'Label TEMP', modes: ['surface'],
    left: 31, top: 67,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  surf_mode_val: {
    id: 'surf_mode_val', label: 'Mode gaz valeur', modes: ['surface'],
    left: 55, top: 60,
    fontSizeRatio: 30 / 640, fontFamily: 'Iceland', align: 'left', visible: true,
  },
  surf_mode_lbl: {
    id: 'surf_mode_lbl', label: 'Label MODE', modes: ['surface'],
    left: 55, top: 67,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'left', visible: true,
  },

  // ── DIVE (shared: dive-ok + dive-deco) ───────────────────────────────────
  depth: {
    id: 'depth', label: 'Profondeur', modes: ['dive-ok', 'dive-deco'],
    left: 38, top: 27, width: 24,
    fontSizeRatio: 60 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  depth_unit: {
    id: 'depth_unit', label: 'Unité profondeur (m)', modes: ['dive-ok', 'dive-deco'],
    left: 62.5, top: 34,
    fontSizeRatio: 16 / 640, fontFamily: 'DotGothic16', align: 'left', visible: true,
  },

  // ── DIVE OK ───────────────────────────────────────────────────────────────
  dok_speaker: {
    id: 'dok_speaker', label: 'Capteur eau / haut-parleur', modes: ['dive-ok'],
    left: 32, top: 30,
    fontSizeRatio: 22 / 640, fontFamily: 'VT323', align: 'left', visible: true,
  },
  dok_ac_lbl: {
    id: 'dok_ac_lbl', label: 'Label AC', modes: ['dive-ok'],
    left: 62.5, top: 29,
    fontSizeRatio: 14 / 640, fontFamily: 'DotGothic16', align: 'left', visible: true,
  },
  ndl: {
    id: 'ndl', label: 'NDL (limite sans déco)', modes: ['dive-ok'],
    left: 48, top: 43, width: 16,
    fontSizeRatio: 52 / 640, fontFamily: 'VT323', align: 'center', visible: true,
  },
  ndl_lbl: {
    id: 'ndl_lbl', label: 'Label NO DEC TIME', modes: ['dive-ok'],
    left: 51, top: 53,
    fontSizeRatio: 12 / 640, fontFamily: 'Share Tech Mono', align: 'left', visible: true,
  },
  slow_alarm: {
    id: 'slow_alarm', label: 'Alarme remontée SLOW', modes: ['dive-ok'],
    left: 33, top: 57, width: 34,
    fontSizeRatio: 13.2 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  dok_clock: {
    id: 'dok_clock', label: 'Heure (plongée)', modes: ['dive-ok'],
    left: 33, top: 60, width: 16,
    fontSizeRatio: 30 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  dok_divetime: {
    id: 'dok_divetime', label: 'Durée plongée', modes: ['dive-ok'],
    left: 54, top: 60, width: 12,
    fontSizeRatio: 30 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  dok_clock_lbl: {
    id: 'dok_clock_lbl', label: 'Label TIME', modes: ['dive-ok'],
    left: 33, top: 67, width: 16,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  dok_divetime_lbl: {
    id: 'dok_divetime_lbl', label: 'Label DIVE TIME', modes: ['dive-ok'],
    left: 54, top: 67, width: 12,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  dok_maxdepth: {
    id: 'dok_maxdepth', label: 'Prof. max (fantôme)', modes: ['dive-ok'],
    left: 35, top: 72, width: 30,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },

  // ── DIVE DECO ─────────────────────────────────────────────────────────────
  dec_stop_lbl: {
    id: 'dec_stop_lbl', label: 'Alarme STOP', modes: ['dive-deco'],
    left: 31, top: 38,
    fontSizeRatio: 13 / 640, fontFamily: 'Share Tech Mono', align: 'left', visible: true,
  },
  dec_ceiling: {
    id: 'dec_ceiling', label: 'Palier plafond', modes: ['dive-deco'],
    left: 43, top: 38, width: 22,
    fontSizeRatio: 50 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  dec_ceiling_unit: {
    id: 'dec_ceiling_unit', label: 'Unité palier (m)', modes: ['dive-deco'],
    left: 65, top: 40,
    fontSizeRatio: 16 / 640, fontFamily: 'DotGothic16', align: 'left', visible: true,
  },
  dec_dtr: {
    id: 'dec_dtr', label: 'DTR valeur', modes: ['dive-deco'],
    left: 31, top: 56, width: 16,
    fontSizeRatio: 28 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  dec_dtr_lbl: {
    id: 'dec_dtr_lbl', label: 'Label DTR MIN', modes: ['dive-deco'],
    left: 31, top: 63, width: 16,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  dec_divetime: {
    id: 'dec_divetime', label: 'Durée plongée (déco)', modes: ['dive-deco'],
    left: 52, top: 56, width: 16,
    fontSizeRatio: 30 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  dec_divetime_lbl: {
    id: 'dec_divetime_lbl', label: 'Label DIVE TIME (déco)', modes: ['dive-deco'],
    left: 52, top: 63, width: 16,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },

  // ── POST-DIVE ─────────────────────────────────────────────────────────────
  post_header: {
    id: 'post_header', label: 'En-tête fin plongée', modes: ['post-dive'],
    left: 31, top: 28, width: 38,
    fontSizeRatio: 13 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  post_duration: {
    id: 'post_duration', label: 'Durée plongée (post)', modes: ['post-dive'],
    left: 31, top: 36, width: 38,
    fontSizeRatio: 30 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  post_duration_lbl: {
    id: 'post_duration_lbl', label: 'Label DURÉE PLONGÉE', modes: ['post-dive'],
    left: 31, top: 46, width: 38,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  post_maxdepth: {
    id: 'post_maxdepth', label: 'Prof. max valeur (post)', modes: ['post-dive'],
    left: 31, top: 53, width: 16,
    fontSizeRatio: 24 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  post_maxdepth_unit: {
    id: 'post_maxdepth_unit', label: 'Unité prof max (m)', modes: ['post-dive'],
    left: 47, top: 54,
    fontSizeRatio: 14.4 / 640, fontFamily: 'DotGothic16', align: 'left', visible: true,
  },
  post_maxdepth_lbl: {
    id: 'post_maxdepth_lbl', label: 'Label PROF MAX', modes: ['post-dive'],
    left: 31, top: 60, width: 16,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  post_temp: {
    id: 'post_temp', label: 'Température (post)', modes: ['post-dive'],
    left: 56, top: 53, width: 13,
    fontSizeRatio: 24 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  post_temp_unit: {
    id: 'post_temp_unit', label: 'Unité température (°C)', modes: ['post-dive'],
    left: 69, top: 54,
    fontSizeRatio: 14.4 / 640, fontFamily: 'DotGothic16', align: 'left', visible: true,
  },
  post_temp_lbl: {
    id: 'post_temp_lbl', label: 'Label TEMP EAU', modes: ['post-dive'],
    left: 56, top: 60, width: 13,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  post_nofly: {
    id: 'post_nofly', label: 'No-fly valeur', modes: ['post-dive'],
    left: 31, top: 65, width: 16,
    fontSizeRatio: 18 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  post_nofly_lbl: {
    id: 'post_nofly_lbl', label: 'Label NO FLY', modes: ['post-dive'],
    left: 31, top: 71, width: 16,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
  post_desat: {
    id: 'post_desat', label: 'Désaturation valeur', modes: ['post-dive'],
    left: 56, top: 65, width: 13,
    fontSizeRatio: 18 / 640, fontFamily: 'Iceland', align: 'center', visible: true,
  },
  post_desat_lbl: {
    id: 'post_desat_lbl', label: 'Label DÉSAT', modes: ['post-dive'],
    left: 56, top: 71, width: 13,
    fontSizeRatio: 11 / 640, fontFamily: 'Share Tech Mono', align: 'center', visible: true,
  },
}

export function mergeConfigs(
  defaults: typeof ZOOP_NOVO_DEFAULTS,
  overrides: Record<string, Partial<Omit<FieldConfig, 'id' | 'label' | 'modes'>>>,
): typeof ZOOP_NOVO_DEFAULTS {
  const result = { ...defaults }
  for (const [id, patch] of Object.entries(overrides)) {
    if (result[id]) result[id] = { ...result[id], ...patch }
  }
  return result
}
