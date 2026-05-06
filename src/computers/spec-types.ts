export interface FieldLabel {
  text: string
  position: 'below' | 'above' | 'left' | 'right'
  font: FontType
  size: number
}

export interface FieldAffix {
  text: string
  size: number
  gap: number
}

export type FontType =
  | 'dseg7'       // 7-segment numerics (depth, NDL, times)
  | 'dseg14'      // 14-segment alphanumeric (labels, mode strings)
  | 'dot_matrix'  // pixel-grid small labels
  | 'segments'    // custom shaped indicators (ascent bar, battery)
  | 'icon'        // bitmap/SVG icon (AC waves, airplane, etc.)
  | 'sans_serif'  // plain text (branding, bezel labels)

export interface FieldSpec {
  /** [x, y, w, h] in screen-local pixel space (origin = top-left of screen_bbox) */
  bbox: readonly [number, number, number, number]
  font: FontType
  /** Cap height for text fonts; full height for segments/icons */
  size: number
  align: 'left' | 'right' | 'center'
  color?: string
  /** LCD label rendered on-screen near this field (NOT bezel-printed text) */
  label?: FieldLabel
  suffix?: FieldAffix
  prefix?: FieldAffix
  blink?: boolean
  confidence?: 'high' | 'medium' | 'low'
  value_type: 'number' | 'time' | 'string' | 'bool' | 'enum'
  value_format?: string
  max_chars?: number
}

export interface PresetState {
  description: string
  visible_fields: readonly string[]
  values: Record<string, unknown>
  flags?: readonly string[]
}

export interface ComputerSpec {
  model: string
  slug: string
  version: string
  /**
   * For SVG-based computers: screen viewport [w, h] in SVG units.
   * For photo-based computers: photo dimensions in px.
   * All field bboxes are in this coordinate space (screen-local, not full-watch).
   */
  image_size: readonly [number, number]
  /**
   * [x, y, w, h] of the LCD area within the full watch image.
   * For SVG computers where fields are already in screen-local coords, use [0,0,w,h].
   */
  screen_bbox: readonly [number, number, number, number]
  /** Path to background image (photo-based computers only) */
  background?: string
  fields: Record<string, FieldSpec>
  presets: Record<string, PresetState>
  notes?: string
}
