import type { ComponentProps } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const FieldGroup = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('flex w-full flex-col gap-4', className)}
    data-slot="field-group"
    {...props}
  />
)

const Field = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('flex w-full flex-col gap-2', className)}
    data-slot="field"
    role="group"
    {...props}
  />
)

const FieldLabel = ({ className, ...props }: ComponentProps<typeof Label>) => (
  <Label
    className={cn('w-fit leading-snug', className)}
    data-slot="field-label"
    {...props}
  />
)

const FieldDescription = ({ className, ...props }: ComponentProps<'p'>) => (
  <p
    className={cn(
      'text-left text-xs/relaxed leading-normal font-normal text-muted-foreground',
      className,
    )}
    data-slot="field-description"
    {...props}
  />
)

export { Field, FieldDescription, FieldGroup, FieldLabel }
