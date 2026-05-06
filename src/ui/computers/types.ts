import type { DiveState } from '../../types'

/** Common interface that every dive computer skin must implement. */
export type DiveComputerProps = {
  state: DiveState
  /** Scale factor for the SVG skin (default 1.0). */
  scale?: number
  /** Called when a physical button is pressed. */
  onButtonPress?: (button: 'select' | 'down' | 'mode' | 'up') => void
}
