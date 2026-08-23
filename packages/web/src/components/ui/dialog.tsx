import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { ComponentProps, SVGProps } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      d="M6 6l12 12M18 6 6 18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
)

const Dialog = DialogPrimitive.Root

const DialogContent = ({
  children,
  className,
  showCloseButton = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Popup> & {
  readonly showCloseButton?: boolean
}) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/60" />
    <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center">
      <DialogPrimitive.Popup
        className={cn(
          'relative flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-lg outline-none transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
          className,
        )}
        data-slot="dialog-content"
        {...props}>
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            aria-label="关闭"
            className={cn(
              buttonVariants({ size: 'icon', variant: 'ghost' }),
              'absolute top-3 right-3',
            )}>
            <CloseIcon />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Viewport>
  </DialogPrimitive.Portal>
)

const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn('text-sm font-medium', className)}
    data-slot="dialog-title"
    {...props}
  />
)

const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn('text-xs text-muted-foreground', className)}
    data-slot="dialog-description"
    {...props}
  />
)

export { Dialog, DialogContent, DialogDescription, DialogTitle }
