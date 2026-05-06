import type { ComponentType } from 'react'
import type { DiveComputerProps } from './types'
import ZoopNovoPhoto from './ZoopNovoPhoto/ZoopNovoPhoto'

export interface UIComputerEntry {
  slug: string
  label: string
  brand: string
  Component: ComponentType<DiveComputerProps>
}

/**
 * UI computer registry — maps computer slugs to React render components.
 *
 * To add a new computer:
 *   1. Create its spec in src/computers/specs/<slug>.ts
 *   2. Build its renderer in src/ui/computers/<Name>/<Name>.tsx
 *   3. Add an entry below (slug must match the image at public/computers/<slug>.png)
 */
export const UI_COMPUTER_REGISTRY: Record<string, UIComputerEntry> = {
  'suunto-zoop-novo': {
    slug: 'suunto-zoop-novo',
    label: 'Suunto Zoop Novo',
    brand: 'Suunto',
    Component: ZoopNovoPhoto,
  },
  // 'aqualung-i200': {
  //   slug: 'aqualung-i200',
  //   label: 'Aqualung i200',
  //   brand: 'Aqualung',
  //   Component: AqualungI200Photo,
  // },
}

export const DEFAULT_COMPUTER_SLUG = 'suunto-zoop-novo'

export function getComputerEntry(slug: string): UIComputerEntry | undefined {
  return UI_COMPUTER_REGISTRY[slug]
}

export function listUIComputers(): UIComputerEntry[] {
  return Object.values(UI_COMPUTER_REGISTRY)
}
