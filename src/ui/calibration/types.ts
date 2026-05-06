export type DisplayMode = 'surface' | 'dive-ok' | 'dive-deco' | 'post-dive'

export type FontFamily =
  | 'Iceland'
  | 'VT323'
  | 'Share Tech Mono'
  | 'DotGothic16'
  | 'monospace'

export interface FieldConfig {
  id: string
  label: string                    // human-readable name (shown in CalibrationPanel)
  modes: DisplayMode[]             // which display modes show this field
  left?: number                    // % of container (undefined = use right)
  right?: number                   // % of container
  top: number                      // % of container
  width?: number                   // % of container (undefined = auto)
  fontSizeRatio: number            // font size as fraction of container size (e.g. 0.094)
  fontFamily: FontFamily
  align: 'left' | 'center' | 'right'
  visible: boolean
}

export type FieldConfigMap = Record<string, FieldConfig>

// Only the keys the user has touched (deep-merged over defaults)
export type FieldOverrides = Record<string, Partial<Omit<FieldConfig, 'id' | 'label' | 'modes'>>>

export const FONT_FAMILIES: FontFamily[] = ['Iceland', 'VT323', 'Share Tech Mono', 'DotGothic16', 'monospace']

export const FONT_LABELS: Record<FontFamily, string> = {
  'Iceland':        'Iceland (LCD)',
  'VT323':          'VT323 (retro)',
  'Share Tech Mono':'Share Tech Mono (label)',
  'DotGothic16':    'DotGothic16 (unit)',
  'monospace':      'monospace (fallback)',
}

export const DISPLAY_MODE_LABELS: Record<DisplayMode, string> = {
  'surface':   'Surface',
  'dive-ok':   'Plongée',
  'dive-deco': 'Décompression',
  'post-dive': 'Après plongée',
}
