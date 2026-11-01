import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const skeletonRows = Array.from({ length: 6 }, (_, index) => index)

interface TemplateListSkeletonProps {
  readonly compact?: boolean
}

export const TemplateListSkeleton = ({
  compact = false,
}: TemplateListSkeletonProps) => {
  if (compact)
    return (
      <div
        aria-hidden="true"
        className="flex h-11 w-full items-center gap-2 rounded-md border p-1.5">
        <Skeleton className="aspect-video h-full shrink-0 rounded-sm" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
    )

  return (
    <div aria-hidden="true" className="flex flex-col gap-1">
      {skeletonRows.map(row => (
        <div className="flex h-16 items-center gap-2 rounded-md p-2" key={row}>
          <Skeleton className="aspect-video h-10 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-2.5 w-28 max-w-full" />
            <Skeleton className="h-2 w-20 max-w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface TemplateThumbnailProps {
  readonly alt: string
  readonly className?: string
  readonly fallbackLabel: string
  readonly loading?: ComponentProps<'img'>['loading']
  readonly src: string
}

type ThumbnailStatus = 'error' | 'loaded' | 'loading'

export const TemplateThumbnail = ({
  alt,
  className,
  fallbackLabel,
  loading,
  src,
}: TemplateThumbnailProps) => {
  const [status, setStatus] = useState<ThumbnailStatus>('loading')

  useEffect(() => setStatus('loading'), [src])

  return (
    <span
      aria-busy={status === 'loading'}
      className={cn(
        'relative flex items-center justify-center overflow-hidden border bg-muted',
        className,
      )}>
      {status === 'loading' ? (
        <Skeleton className="absolute inset-0 rounded-none" />
      ) : null}
      {status === 'error' ? (
        <span className="px-2 text-center text-xs font-normal text-muted-foreground">
          {fallbackLabel}
        </span>
      ) : (
        <img
          alt={alt}
          className={cn(
            'h-full w-full object-cover transition-opacity',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
          loading={loading}
          onError={() => setStatus('error')}
          onLoad={() => setStatus('loaded')}
          src={src}
        />
      )}
    </span>
  )
}
