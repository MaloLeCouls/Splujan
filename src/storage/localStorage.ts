import type { DiveProfile } from '../types'

const STORAGE_KEY = 'divesim:profiles'

export function loadProfiles(): DiveProfile[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DiveProfile[]
  } catch {
    return null
  }
}

export function saveProfiles(profiles: DiveProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch {
    // Storage quota exceeded or not available — fail silently
  }
}

export function clearProfiles(): void {
  localStorage.removeItem(STORAGE_KEY)
}
