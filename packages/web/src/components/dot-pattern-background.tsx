import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const DotPatternBackground = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    aria-hidden="true"
    className={cn(
      'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:16px_16px]',
      className,
    )}
    {...props}
  />
)

export { DotPatternBackground }
