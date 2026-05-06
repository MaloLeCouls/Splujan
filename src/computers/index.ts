// Types
export type { ComputerSpec, FieldSpec, PresetState, FontType } from './spec-types'
export type { FieldDefinition, FieldCategory, ValueType, CanonicalFieldName } from './field-registry'
export type { CanonicalValues } from './state-mapper'
export type { ComputerSlug } from './computer-registry'

// Field registry (the "rows" of the cross-computer DB)
export { FIELD_REGISTRY, getFieldsByCategory } from './field-registry'

// State mapping
export { mapStateToCanonical } from './state-mapper'

// Computer registry (the "columns" of the cross-computer DB)
export {
  COMPUTER_REGISTRY,
  getComputerSpec,
  listComputers,
  getFieldMatrix,
  getPresetFields,
} from './computer-registry'

// Individual specs (for direct import when needed)
export { SUUNTO_ZOOP_NOVO_SPEC } from './specs/suunto-zoop-novo'
