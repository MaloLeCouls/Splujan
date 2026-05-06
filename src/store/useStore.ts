import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiveProfile } from '../types'
import { loadProfiles, saveProfiles } from '../storage/localStorage'
import { PRESET_SCENARIOS } from '../scenarios/presets'
import { DEFAULT_COMPUTER_SLUG } from '../ui/computers/ui-registry'

type AppState = {
  profiles: DiveProfile[]
  activeProfileId: string | null
  isPresentationMode: boolean
  selectedComputerSlug: string

  // Actions
  setActiveProfile: (id: string | null) => void
  addProfile: (profile: DiveProfile) => void
  updateProfile: (profile: DiveProfile) => void
  deleteProfile: (id: string) => void
  importProfile: (profile: DiveProfile) => void
  togglePresentationMode: () => void
  setSelectedComputer: (slug: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: loadProfiles() ?? PRESET_SCENARIOS,
      activeProfileId: null,
      isPresentationMode: false,
      selectedComputerSlug: DEFAULT_COMPUTER_SLUG,

      setActiveProfile: (id) => set({ activeProfileId: id }),

      addProfile: (profile) => {
        const profiles = [...get().profiles, profile]
        saveProfiles(profiles)
        set({ profiles })
      },

      updateProfile: (profile) => {
        const profiles = get().profiles.map(p => (p.id === profile.id ? profile : p))
        saveProfiles(profiles)
        set({ profiles })
      },

      deleteProfile: (id) => {
        const profiles = get().profiles.filter(p => p.id !== id)
        saveProfiles(profiles)
        set({ profiles, activeProfileId: get().activeProfileId === id ? null : get().activeProfileId })
      },

      importProfile: (profile) => {
        const existing = get().profiles.find(p => p.id === profile.id)
        if (existing) {
          const copy: DiveProfile = {
            ...profile,
            id: crypto.randomUUID(),
            name: `${profile.name} (importé)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          const profiles = [...get().profiles, copy]
          saveProfiles(profiles)
          set({ profiles })
        } else {
          get().addProfile(profile)
        }
      },

      togglePresentationMode: () =>
        set(s => ({ isPresentationMode: !s.isPresentationMode })),

      setSelectedComputer: (slug) => set({ selectedComputerSlug: slug }),
    }),
    {
      name: 'divesim-store',
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        selectedComputerSlug: state.selectedComputerSlug,
      }),
    },
  ),
)

export const useActiveProfile = (): DiveProfile | null => {
  const { profiles, activeProfileId } = useStore()
  return profiles.find(p => p.id === activeProfileId) ?? null
}
