import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const Alert = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn(
      'grid w-full gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-amber-950 dark:text-amber-100',
      className,
    )}
    data-slot="alert"
    role="note"
    {...props}
  />
)

const AlertTitle = ({ className, ...props }: ComponentProps<'h3'>) => (
  <h3
    className={cn('text-xs font-medium', className)}
    data-slot="alert-title"
    {...props}
  />
)

const AlertDescription = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('text-xs/relaxed text-amber-900 dark:text-amber-200', className)}
    data-slot="alert-description"
    {...props}
  />
)

export { Alert, AlertDescription, AlertTitle }
