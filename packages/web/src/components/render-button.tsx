import type { ComponentProps, SVGProps } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

const minimumLoadingDuration = 250

const RefreshIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="M20 4v5h-5M4 20v-5h5M5.1 9a8 8 0 0 1 13.2-3L20 9M4 15l1.7 3A8 8 0 0 0 18.9 15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const SpinnerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" />
    <path
      className="opacity-90"
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
)

interface RenderButtonProps extends Omit<ComponentProps<typeof Button>, 'children'> {
  readonly isLoading: boolean
  readonly label: string
  readonly loadingLabel: string
}

const RenderButton = ({
  disabled,
  isLoading,
  label,
  loadingLabel,
  ...props
}: RenderButtonProps) => {
  const loadingStartedAt = useRef<number | null>(null)
  const [isMinimumLoading, setIsMinimumLoading] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      loadingStartedAt.current ??= Date.now()
      setIsMinimumLoading(true)
      return
    }
    if (loadingStartedAt.current === null) {
      setIsMinimumLoading(false)
      return
    }

    const elapsed = Date.now() - loadingStartedAt.current
    const remaining = Math.max(0, minimumLoadingDuration - elapsed)
    const timer = window.setTimeout(() => {
      loadingStartedAt.current = null
      setIsMinimumLoading(false)
    }, remaining)

    return () => window.clearTimeout(timer)
  }, [isLoading])

  const isVisuallyLoading = isLoading || isMinimumLoading

  return (
    <Button
      aria-busy={isVisuallyLoading}
      disabled={disabled || isVisuallyLoading}
      {...props}>
      {isVisuallyLoading ? (
        <SpinnerIcon className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <RefreshIcon className="size-3.5 shrink-0" />
      )}
      {isVisuallyLoading ? loadingLabel : label}
    </Button>
  )
}

export { RenderButton }
