import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

interface DynamicHeightProps extends ComponentProps<'div'> {
  readonly contentClassName?: string
  readonly open: boolean
}

const DynamicHeight = ({
  children,
  className,
  contentClassName,
  open,
  ...props
}: DynamicHeightProps) => (
  <div
    className={cn(
      'grid min-h-0 transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none',
      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      className,
    )}
    {...props}>
    <div
      aria-hidden={!open}
      className={cn('min-h-0 overflow-hidden', contentClassName)}
      inert={!open}>
      {children}
    </div>
  </div>
)

export { DynamicHeight }
