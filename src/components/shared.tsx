import * as React from 'react'
import { useEffect } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Fallback for scroll entry effects when view() timelines are unsupported. */
export function useRevealFallback(dep: unknown) {
  useEffect(() => {
    const supported = CSS.supports('(animation-timeline: view()) and (animation-range: entry)')
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (supported || !matchMedia('(prefers-reduced-motion: no-preference)').matches) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { threshold: 0.12 })
    els.forEach((el) => { el.classList.add('reveal-io'); io.observe(el) })
    return () => io.disconnect()
  }, [dep])
}

export function GuessRange({ value, onChange, id, className }: { value: number; onChange: (v: number) => void; id: string; className?: string }) {
  return (
    <input id={id} type="range" min={0} max={200} step={1} value={value} aria-valuetext={`Tk ${value}`}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn('guess-range', className)}
      style={{ ['--control-value' as string]: value, ['--attr-min' as string]: 0, ['--attr-max' as string]: 200 }} />
  )
}

/** Pill CTA with the nested "button-in-button" icon island. */
export function IslandButton({ children, className, iconClassName, icon, ...props }: React.ComponentProps<typeof Button> & { iconClassName?: string; icon?: React.ReactNode }) {
  return (
    <Button size="lg" className={cn('pr-2 pl-6', className)} {...props}>
      <span>{children}</span>
      <span className={cn('grid size-10 place-items-center rounded-full bg-primary-foreground/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/button:translate-x-0.5 group-hover/button:-translate-y-px group-hover/button:scale-105', iconClassName)}>
        {icon ?? <ArrowUpRight size={18} weight="light" />}
      </span>
    </Button>
  )
}

export const srOnly = 'absolute w-px h-px overflow-hidden [clip:rect(0_0_0_0)] whitespace-nowrap'
