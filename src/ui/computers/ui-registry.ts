import type { ComponentType } from 'react'
import type { DiveComputerProps } from './types'
import ZoopNovo from './ZoopNovo/ZoopNovo'

export interface UIComputerEntry {
  slug: string
  label: string
  Component: ComponentType<DiveComputerProps>
}

/**
 * UI computer registry — maps computer slugs to React render components.
 *
 * Kept separate from the data registry (src/computers/computer-registry.ts)
 * so the data layer stays pure TypeScript with no React dependency.
 *
 * To add a new computer:
 *   1. Create its spec in src/computers/specs/<slug>.ts
 *   2. Build its renderer component in src/ui/computers/<Slug>/
 *   3. Add an entry below
 */
export const UI_COMPUTER_REGISTRY: Record<string, UIComputerEntry> = {
  'suunto-zoop-novo': {
    slug: 'suunto-zoop-novo',
    label: 'Suunto Zoop Novo',
    Component: ZoopNovo,
  },
  // 'aqualung-i200': {
  //   slug: 'aqualung-i200',
  //   label: 'Aqualung i200',
  //   Component: AqualungI200,
  // },
}

export const DEFAULT_COMPUTER_SLUG = 'suunto-zoop-novo'

export function getComputerEntry(slug: string): UIComputerEntry | undefined {
  return UI_COMPUTER_REGISTRY[slug]
}

export function listUIComputers(): UIComputerEntry[] {
  return Object.values(UI_COMPUTER_REGISTRY)
}
