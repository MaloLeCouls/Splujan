import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiveProfile } from '../types'
import { loadProfiles, saveProfiles } from '../storage/localStorage'
import { PRESET_SCENARIOS } from '../scenarios/presets'

type AppState = {
  profiles: DiveProfile[]
  activeProfileId: string | null
  isPresentationMode: boolean

  // Actions
  setActiveProfile: (id: string | null) => void
  addProfile: (profile: DiveProfile) => void
  updateProfile: (profile: DiveProfile) => void
  deleteProfile: (id: string) => void
  importProfile: (profile: DiveProfile) => void
  togglePresentationMode: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: loadProfiles() ?? PRESET_SCENARIOS,
      activeProfileId: null,
      isPresentationMode: false,

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
          // Import as a new copy with a fresh ID
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
    }),
    {
      name: 'divesim-store',
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
    },
  ),
)

export const useActiveProfile = (): DiveProfile | null => {
  const { profiles, activeProfileId } = useStore()
  return profiles.find(p => p.id === activeProfileId) ?? null
}
