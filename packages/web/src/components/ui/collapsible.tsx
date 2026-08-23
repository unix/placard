import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

import { cn } from '@/lib/utils'

const Collapsible = ({ className, ...props }: CollapsiblePrimitive.Root.Props) => (
  <CollapsiblePrimitive.Root
    className={cn(className)}
    data-slot="collapsible"
    {...props}
  />
)

const CollapsibleTrigger = ({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props) => (
  <CollapsiblePrimitive.Trigger
    className={cn(className)}
    data-slot="collapsible-trigger"
    {...props}
  />
)

const CollapsibleContent = ({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) => (
  <CollapsiblePrimitive.Panel
    className={cn(
      'h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0',
      className,
    )}
    data-slot="collapsible-content"
    {...props}
  />
)

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
