import type { DiveProfile } from '../types'

export function exportProfileAsJSON(profile: DiveProfile): void {
  const json = JSON.stringify(profile, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(profile.name)}.divesim.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importProfileFromFile(file: File): Promise<DiveProfile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw = e.target?.result
        if (typeof raw !== 'string') throw new Error('Lecture échouée')
        const profile = JSON.parse(raw) as DiveProfile
        if (!isValidProfile(profile)) throw new Error('Format invalide')
        resolve(profile)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsText(file)
  })
}

function isValidProfile(obj: unknown): obj is DiveProfile {
  if (typeof obj !== 'object' || obj === null) return false
  const p = obj as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    Array.isArray(p.segments) &&
    Array.isArray(p.events)
  )
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-. ]/g, '_').trim() || 'profil'
}
