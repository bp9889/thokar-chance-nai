import * as React from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('flex flex-col gap-6 rounded-[calc(var(--radius)*2)] bg-card text-card-foreground', className)} {...props} />
}
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('grid auto-rows-min gap-1.5 px-6', className)} {...props} />
}
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('leading-tight font-semibold', className)} {...props} />
}
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
}
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />
}
/** Double-bezel shell: outer tray + inner core with concentric radius. */
function Bezel({ className, coreClassName, children, ...props }: React.ComponentProps<'div'> & { coreClassName?: string }) {
  return (
    <div data-slot="bezel" className={cn('rounded-[2rem] p-1.5 bg-foreground/[0.04] ring-1 ring-foreground/[0.06]', className)} {...props}>
      <div className={cn('h-full rounded-[calc(2rem-0.375rem)] bg-card text-card-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]', coreClassName)}>{children}</div>
    </div>
  )
}
export { Card, CardHeader, CardTitle, CardDescription, CardContent, Bezel }
