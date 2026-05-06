import { useRef, useCallback } from 'react'
import type { FieldConfig } from './types'
import { useCalibrationStore } from './useCalibrationStore'

interface FieldHandleProps {
  config: FieldConfig
  computerSlug: string
  containerRef: React.RefObject<HTMLDivElement>
  isSelected: boolean
}

export default function FieldHandle({ config, computerSlug, containerRef, isSelected }: FieldHandleProps) {
  const { selectField, updateField } = useCalibrationStore()
  const startRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    selectField(config.id)

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const left = config.left ?? 0
    startRef.current = { x: e.clientX, y: e.clientY, left, top: config.top }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }, [config, containerRef, selectField])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const dx = ((e.clientX - startRef.current.x) / rect.width) * 100
    const dy = ((e.clientY - startRef.current.y) / rect.height) * 100

    updateField(computerSlug, config.id, {
      left: Math.max(0, Math.min(95, startRef.current.left + dx)),
      top: Math.max(0, Math.min(95, startRef.current.top + dy)),
      right: undefined,
    })
  }, [computerSlug, config.id, containerRef, updateField])

  const onPointerUp = useCallback(() => {
    startRef.current = null
  }, [])

  const style: React.CSSProperties = {
    position: 'absolute',
    left: config.left !== undefined ? `${config.left}%` : undefined,
    right: config.right !== undefined ? `${config.right}%` : undefined,
    top: `${config.top}%`,
    width: config.width !== undefined ? `${config.width}%` : '8%',
    minHeight: '4%',
    cursor: 'move',
    boxSizing: 'border-box',
    border: isSelected
      ? '2px solid #3b82f6'
      : '1px dashed rgba(59,130,246,0.55)',
    borderRadius: 3,
    background: isSelected
      ? 'rgba(59,130,246,0.18)'
      : 'rgba(59,130,246,0.06)',
    zIndex: 20,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    touchAction: 'none',
  }

  return (
    <div
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {isSelected && (
        <span
          style={{
            fontSize: 8,
            background: '#3b82f6',
            color: '#fff',
            padding: '1px 3px',
            borderRadius: 2,
            lineHeight: 1,
            userSelect: 'none',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {config.label}
        </span>
      )}
    </div>
  )
}
