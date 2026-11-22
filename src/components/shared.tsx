import { cn } from '@/lib/utils'

export function GuessRange({ value, onChange, id, className }: { value: number; onChange: (v: number) => void; id: string; className?: string }) {
  return (
    <input id={id} type="range" min={0} max={200} step={1} value={value} aria-valuetext={`Tk ${value}`}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn('guess-range', className)}
      style={{ ['--control-value' as string]: value, ['--attr-min' as string]: 0, ['--attr-max' as string]: 200 }} />
  )
}
