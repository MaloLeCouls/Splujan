import type { DiveState } from '../../types'

/** Common interface that every dive computer skin must implement. */
export type DiveComputerProps = {
  state: DiveState
  /** Scale factor for the SVG skin (default 1.0). */
  scale?: number
}
