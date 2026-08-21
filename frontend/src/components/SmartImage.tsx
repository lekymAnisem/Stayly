import { useState } from 'react'
import type { ImgHTMLAttributes } from 'react'
import { ImageOff } from 'lucide-react'

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  alt: string
}

/**
 * Image with a graceful placeholder fallback so the layout
 * still holds up if a remote image fails to load.
 */
export default function SmartImage({ alt, className, ...rest }: SmartImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-ink-200 to-ink-100 ${className ?? ''}`}
      >
        <div className="flex flex-col items-center gap-1.5 text-ink-400">
          <ImageOff className="h-6 w-6" aria-hidden="true" />
          <span className="px-3 text-center text-xs">{alt}</span>
        </div>
      </div>
    )
  }

  return (
    <img
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  )
}