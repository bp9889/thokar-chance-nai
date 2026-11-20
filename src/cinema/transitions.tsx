import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { BN, POSTER, extrude, halftone } from './common'

export type Fx = 'shutter' | 'slats' | 'countdown'
export const FX_MS: Record<Fx, [number, number]> = { shutter: [620, 680], slats: [720, 720], countdown: [1050, 420] }
type Phase = 'idle' | 'out' | 'in'

const CSS = `
@keyframes fx-down{from{translate:0 -100%}to{translate:0 0}}
@keyframes fx-up{from{translate:0 0}to{translate:0 -100%}}
@keyframes fx-settle{0%{translate:0 0}55%{translate:0 -10px}100%{translate:0 0}}
@keyframes fx-face{from{rotate:y -90deg}to{rotate:y 0deg}}
@keyframes fx-away{from{rotate:y 0deg}to{rotate:y 90deg}}
@keyframes fx-in-fade{from{opacity:0}to{opacity:1}}
@keyframes fx-out-fade{from{opacity:1;scale:1}to{opacity:0;scale:1.08}}
@keyframes fx-sweep{from{--fx-a:0deg}to{--fx-a:360deg}}
@property --fx-a{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes fx-num{from{scale:1.25;opacity:0}to{scale:1;opacity:1}}
.fx-shutter-out{animation:fx-down 620ms var(--ease-in-out) both}
.fx-shutter-in{animation:fx-up 680ms var(--ease-in-out) both}
.fx-slat-out{animation:fx-face 440ms var(--ease-out) both}
.fx-slat-in{animation:fx-away 440ms var(--ease-in-out) both}
.fx-cd-out{animation:fx-in-fade 140ms ease both}
.fx-cd-in{animation:fx-out-fade 420ms var(--ease-out) both}
.fx-sweep{animation:fx-sweep 330ms linear infinite}
.fx-num{animation:fx-num 260ms var(--ease-out) both}
`

/** Dokan shutter: a corrugated steel shutter rolls down, then back up. */
function Shutter({ phase }: { phase: Phase }) {
  return (
    <div className={cn('absolute inset-0', phase === 'out' ? 'fx-shutter-out' : 'fx-shutter-in')}>
      <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(180deg, #9BA2A7 0 6px, #C9CED1 6px 9px, #7D858B 9px 22px, #5F676D 22px 26px)' }} />
      <div className="absolute inset-x-0 top-[34%] grid place-items-center">
        <div className="-rotate-2 bg-[#C4161C] px-8 py-4 text-center shadow-[6px_6px_0_rgba(0,0,0,.35)]">
          <p className="text-[clamp(2rem,6vw,4.4rem)] leading-none" style={{ fontFamily: POSTER, color: '#FFD21F' }}>THOKAR <span style={{ fontFamily: BN, fontWeight: 800 }}>চান্স</span> NAI</p>
          <p className="mt-1 text-xl font-bold text-[#FFF1D6]" style={{ fontFamily: BN }}>Ektu daran, dokan khulche…</p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-7 bg-[#3B4246]">
        <div className="mx-auto mt-1.5 h-4 w-24 rounded-full bg-[#1F2427]" />
      </div>
    </div>
  )
}

/** Billboard slats: a tri-vision board turns its slats to show a new poster. */
function Slats({ phase }: { phase: Phase }) {
  const N = 9
  return (
    <div className="absolute inset-0 flex" style={{ perspective: '1400px' }}>
      {Array.from({ length: N }, (_, k) => (
        <div key={k} className={cn('relative h-full flex-1 overflow-hidden', phase === 'out' ? 'fx-slat-out' : 'fx-slat-in')}
          style={{ animationDelay: `${(phase === 'out' ? k : N - 1 - k) * 32}ms`, transformOrigin: 'center', backfaceVisibility: 'hidden' }}>
          <div className="absolute top-0 h-full w-[100vw]" style={{ left: `calc(${-k} * 100vw / ${N})` }}>
            <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(from 0deg at 50% 50%, #FFD21F 0deg 8deg, #FF9F1A 8deg 16deg)' }} />
            <div className="absolute inset-0" style={halftone} />
            <p className="absolute inset-0 grid place-items-center" style={extrude('clamp(5rem,16vw,12rem)', '#C4161C', '#1A0B07')}>দাম</p>
          </div>
          <span aria-hidden className="absolute inset-y-0 right-0 w-[3px] bg-[#1A0B07]/70" />
        </div>
      ))}
    </div>
  )
}

/** Film leader countdown: 3, 2, 1 with a sweeping hand. */
function Countdown({ phase }: { phase: Phase }) {
  const [n, setN] = useState(3)
  useEffect(() => {
    if (phase !== 'out') return
    setN(3)
    const a = setTimeout(() => setN(2), 330), b2 = setTimeout(() => setN(1), 660)
    return () => { clearTimeout(a); clearTimeout(b2) }
  }, [phase])
  return (
    <div className={cn('absolute inset-0 grid place-items-center bg-[#2A2622]', phase === 'out' ? 'fx-cd-out' : 'fx-cd-in')}>
      <div aria-hidden className="absolute inset-y-0 left-0 w-10 bg-[#0E0C0A]" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 18px, #D9D2C3 18px 34px, transparent 34px 52px)', backgroundSize: '14px 52px', backgroundRepeat: 'repeat-y', backgroundPosition: 'center' }} />
      <div aria-hidden className="absolute inset-y-0 right-0 w-10 bg-[#0E0C0A]" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 18px, #D9D2C3 18px 34px, transparent 34px 52px)', backgroundSize: '14px 52px', backgroundRepeat: 'repeat-y', backgroundPosition: 'center' }} />
      <div aria-hidden className="absolute inset-0 opacity-30" style={halftone} />
      <div className="relative grid size-[min(70vw,460px)] place-items-center rounded-full">
        <div className="fx-sweep absolute inset-0 rounded-full" style={{ background: 'conic-gradient(rgba(255,210,31,.55) var(--fx-a), transparent var(--fx-a))' }} />
        <div className="absolute inset-[6%] rounded-full border-[6px] border-[#F4E3C1]" />
        <div className="absolute inset-[16%] rounded-full border-[3px] border-[#F4E3C1]/70" />
        <span className="absolute inset-x-0 top-1/2 h-[3px] bg-[#F4E3C1]/70" />
        <span className="absolute inset-y-0 left-1/2 w-[3px] bg-[#F4E3C1]/70" />
        <span key={n} className="fx-num relative text-[clamp(7rem,22vw,14rem)] leading-none text-[#F4E3C1]" style={{ fontFamily: POSTER }}>{phase === 'out' ? n : 1}</span>
      </div>
      <p className="absolute bottom-[10%] text-2xl font-bold text-[#FFD21F]" style={{ fontFamily: BN }}>Next show শুরু হচ্ছে…</p>
    </div>
  )
}

export function PageFx({ fx, phase }: { fx: Fx; phase: Phase }) {
  if (phase === 'idle') return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{CSS}</style>
      {fx === 'shutter' && <Shutter phase={phase} />}
      {fx === 'slats' && <Slats phase={phase} />}
      {fx === 'countdown' && <Countdown phase={phase} />}
    </div>
  )
}
