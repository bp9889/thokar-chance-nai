import * as React from 'react'
import { cn } from '@/lib/utils'
function Table({ className, label, ...props }: React.ComponentProps<'table'> & { label: string }) {
  return (
    <div data-slot="table-container" tabIndex={0} role="region" aria-label={label} className="relative w-full overflow-auto max-h-[640px] [container-type:inline-size] rounded-[inherit]">
      <table data-slot="table" className={cn('w-full caption-bottom text-sm border-separate border-spacing-0', className)} {...props} />
    </div>
  )
}
function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('sticky top-0 z-[1] bg-card', className)} {...props} />
}
function TableBody(props: React.ComponentProps<'tbody'>) { return <tbody data-slot="table-body" {...props} /> }
function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr data-slot="table-row" className={cn('transition-colors hover:bg-foreground/[0.03]', className)} {...props} />
}
function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return <th data-slot="table-head" className={cn('h-11 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap border-b border-border', className)} {...props} />
}
function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('p-3 align-middle whitespace-nowrap border-b border-border/60', className)} {...props} />
}
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
