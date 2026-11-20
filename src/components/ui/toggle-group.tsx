import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn('flex flex-wrap items-center gap-1.5', className)} {...props} />
}
function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return <ToggleGroupPrimitive.Item data-slot="toggle-group-item" className={cn('inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium whitespace-nowrap ring-1 ring-border transition-[background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none hover:bg-foreground/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:ring-primary cursor-pointer', className)} {...props} />
}
export { ToggleGroup, ToggleGroupItem }
