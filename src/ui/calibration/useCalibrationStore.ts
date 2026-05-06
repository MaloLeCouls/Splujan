import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DisplayMode, FieldConfig, FieldOverrides } from './types'

interface CalibrationState {
  isCalibrating: boolean
  selectedFieldId: string | null
  panelMode: DisplayMode | null        // mode currently browsed in the panel (null = follow real mode)
  overrides: Record<string, FieldOverrides>   // keyed by computer slug

  toggleCalibration: () => void
  selectField: (id: string | null) => void
  setPanelMode: (mode: DisplayMode | null) => void
  updateField: (slug: string, id: string, patch: Partial<Omit<FieldConfig, 'id' | 'label' | 'modes'>>) => void
  resetField: (slug: string, id: string) => void
  resetAll: (slug: string) => void
}

export const useCalibrationStore = create<CalibrationState>()(
  persist(
    (set) => ({
      isCalibrating: false,
      selectedFieldId: null,
      panelMode: null,
      overrides: {},

      toggleCalibration: () =>
        set(s => ({ isCalibrating: !s.isCalibrating, selectedFieldId: null, panelMode: null })),

      setPanelMode: (mode) => set({ panelMode: mode, selectedFieldId: null }),

      selectField: (id) => set({ selectedFieldId: id }),

      updateField: (slug, id, patch) =>
        set(s => ({
          overrides: {
            ...s.overrides,
            [slug]: {
              ...s.overrides[slug],
              [id]: { ...s.overrides[slug]?.[id], ...patch },
            },
          },
        })),

      resetField: (slug, id) =>
        set(s => {
          const slugOverrides = { ...s.overrides[slug] }
          delete slugOverrides[id]
          return { overrides: { ...s.overrides, [slug]: slugOverrides } }
        }),

      resetAll: (slug) =>
        set(s => {
          const overrides = { ...s.overrides }
          delete overrides[slug]
          return { overrides }
        }),
    }),
    { name: 'divesim-calibration' },
  ),
)
