import type { ComputerSpec, FieldSpec } from './spec-types'
import { SUUNTO_ZOOP_NOVO_SPEC } from './specs/suunto-zoop-novo'

/**
 * Computer registry — the "columns" of the cross-computer database.
 *
 * To add a new computer:
 *   1. Create src/computers/specs/<slug>.ts
 *   2. Import and add it below
 *   3. Add its React component to src/ui/computers/ui-registry.ts
 */
export const COMPUTER_REGISTRY: Record<string, ComputerSpec> = {
  'suunto-zoop-novo': SUUNTO_ZOOP_NOVO_SPEC,
  // 'aqualung-i200':  AQUALUNG_I200_SPEC,
  // 'shearwater-peregrine': SHEARWATER_PEREGRINE_SPEC,
}

export type ComputerSlug = keyof typeof COMPUTER_REGISTRY

export function getComputerSpec(slug: string): ComputerSpec | undefined {
  return COMPUTER_REGISTRY[slug]
}

export function listComputers(): ComputerSpec[] {
  return Object.values(COMPUTER_REGISTRY)
}

/**
 * Cross-computer view: for a given canonical field name, return how
 * each registered computer renders it.
 *
 * Example:
 *   getFieldMatrix('depth')
 *   // { 'suunto-zoop-novo': { bbox:[42,2,76,28], font:'dseg7', ... } }
 */
export function getFieldMatrix(fieldName: string): Record<string, FieldSpec | undefined> {
  return Object.fromEntries(
    Object.entries(COMPUTER_REGISTRY).map(([slug, spec]) => [slug, spec.fields[fieldName]])
  )
}

/**
 * For a given computer and preset name, return the list of visible fields.
 * Useful for building a "what does this screen show?" lookup.
 */
export function getPresetFields(slug: string, presetName: string): readonly string[] {
  const spec = COMPUTER_REGISTRY[slug]
  return spec?.presets[presetName]?.visible_fields ?? []
}
