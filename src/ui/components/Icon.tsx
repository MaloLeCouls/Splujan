import React from 'react'

type IconName =
  | 'play' | 'pause' | 'rewind' | 'plus' | 'edit' | 'download' | 'upload'
  | 'trash' | 'x' | 'check' | 'arrow-left' | 'arrow-right' | 'chevron-down' | 'chevron-right'
  | 'alert' | 'info' | 'depth' | 'clock' | 'layers' | 'presentation' | 'settings' | 'grid'

type Props = React.SVGProps<SVGSVGElement> & { name: IconName; size?: number }

export default function Icon({ name, size = 16, ...rest }: Props) {
  const common = {
    width: size, height: size, fill: 'none' as const,
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    ...rest,
  }
  switch (name) {
    case 'play':         return <svg viewBox="0 0 24 24" {...common}><path d="M7 5l12 7-12 7V5z" fill="currentColor" stroke="none"/></svg>
    case 'pause':        return <svg viewBox="0 0 24 24" {...common}><rect x="7" y="5" width="3.5" height="14" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" fill="currentColor" stroke="none"/></svg>
    case 'rewind':       return <svg viewBox="0 0 24 24" {...common}><path d="M5 5v14M19 5l-9 7 9 7V5z" fill="currentColor"/></svg>
    case 'plus':         return <svg viewBox="0 0 24 24" {...common}><path d="M12 5v14M5 12h14"/></svg>
    case 'edit':         return <svg viewBox="0 0 24 24" {...common}><path d="M16.5 4.5l3 3L8 19H5v-3L16.5 4.5z"/></svg>
    case 'download':     return <svg viewBox="0 0 24 24" {...common}><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 19h14"/></svg>
    case 'upload':       return <svg viewBox="0 0 24 24" {...common}><path d="M12 16V4m0 0l-4 4m4-4l4 4M5 19h14"/></svg>
    case 'trash':        return <svg viewBox="0 0 24 24" {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
    case 'x':            return <svg viewBox="0 0 24 24" {...common}><path d="M6 6l12 12M6 18L18 6"/></svg>
    case 'check':        return <svg viewBox="0 0 24 24" {...common}><path d="M5 12l5 5 9-11"/></svg>
    case 'arrow-left':   return <svg viewBox="0 0 24 24" {...common}><path d="M15 5l-7 7 7 7M8 12h13"/></svg>
    case 'arrow-right':  return <svg viewBox="0 0 24 24" {...common}><path d="M9 5l7 7-7 7M16 12H3"/></svg>
    case 'chevron-down': return <svg viewBox="0 0 24 24" {...common}><path d="M6 9l6 6 6-6"/></svg>
    case 'chevron-right':return <svg viewBox="0 0 24 24" {...common}><path d="M9 6l6 6-6 6"/></svg>
    case 'alert':        return <svg viewBox="0 0 24 24" {...common}><path d="M12 4l10 17H2L12 4zM12 10v5M12 18v.5"/></svg>
    case 'info':         return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11v6"/></svg>
    case 'depth':        return <svg viewBox="0 0 24 24" {...common}><path d="M3 7c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 13c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 19c3 0 3 2 6 2s3-2 6-2 3 2 6 2"/></svg>
    case 'clock':        return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'layers':       return <svg viewBox="0 0 24 24" {...common}><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5"/></svg>
    case 'presentation': return <svg viewBox="0 0 24 24" {...common}><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20l4-4 4 4M12 16v4"/></svg>
    case 'settings':     return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    case 'grid':         return <svg viewBox="0 0 24 24" {...common}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    default: return null
  }
}
