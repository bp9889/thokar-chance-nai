import { useEffect, useState } from 'react'
import { IMG, ITEMS, tk, UNIT, freshness } from '@/lib/data'
import { cn } from '@/lib/utils'
import { POSTER } from './common'

export type Mode = 'day' | 'night'
export type Demo = 1 | 2 | 3

/** Day/night: follows the system until the visitor picks, then remembers the pick. */
export function useMode() {
  const sys = (): Mode => (matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day')
  const [mode, setMode] = useState<Mode>(() => { try { return (localStorage.getItem('tcn-mode') as Mode) || sys() } catch { return sys() } })
  const toggle = () => setMode((m) => { const n = m === 'day' ? 'night' : 'day'; try { localStorage.setItem('tcn-mode', n) } catch { /* private mode */ } return n })
  useEffect(() => { document.documentElement.style.colorScheme = mode === 'night' ? 'dark' : 'light' }, [mode])
  return { mode, toggle }
}

/* Page tokens per demo and mode. The poster, chat and list cards keep their printed colours. */
export const THEME_CSS = `
.tcn { --gut: max(0px, calc((100vw - 1180px) / 2)); background-color: var(--pg); color: var(--ink); transition: background-color 600ms ease, color 400ms ease; }
.tcn[data-d="1"][data-m="night"] { --pg:#150A0B; --ink:#F4E3C1; --soft:#D8C3AA; --deep:#000; --chip:#2B1214; --chip-ink:#F4E3C1; --line:rgba(244,227,193,.16); --hover:rgba(255,255,255,.08); --hi:#FFD21F; --brand:#FFD21F; }
.tcn[data-d="1"][data-m="day"]   { --pg:#F7E2C0; --ink:#2A0E0A; --soft:#6E3B28; --deep:#7A1013; --chip:#2A0E0A; --chip-ink:#F7E2C0; --line:rgba(42,14,10,.16); --hover:rgba(42,14,10,.07); --hi:#C4161C; --brand:#C4161C; }
.tcn[data-d="2"][data-m="night"] { --pg:#06191B; --ink:#F4E3C1; --soft:#BFDCD8; --deep:#000; --chip:#0D3236; --chip-ink:#F4E3C1; --line:rgba(244,227,193,.15); --hover:rgba(255,255,255,.08); --hi:#FFB23E; --brand:#FFB23E; }
.tcn[data-d="2"][data-m="day"]   { --pg:#D7ECE6; --ink:#0C2C2E; --soft:#3A5E60; --deep:#0B4F55; --chip:#0B4F55; --chip-ink:#F4E3C1; --line:rgba(12,44,46,.16); --hover:rgba(12,44,46,.07); --hi:#C4161C; --brand:#C4161C; }
.tcn[data-d="3"][data-m="night"] { --pg:#0D1233; --ink:#F4E3C1; --soft:#C9C6E6; --deep:#05071A; --chip:#222A5C; --chip-ink:#F4E3C1; --line:rgba(244,227,193,.15); --hover:rgba(255,255,255,.08); --hi:#FFD21F; --brand:#FFD21F; }
.tcn[data-d="3"][data-m="day"]   { --pg:#BFE6F5; --ink:#10233A; --soft:#2E4C68; --deep:#10233A; --chip:#10233A; --chip-ink:#F4E3C1; --line:rgba(16,35,58,.16); --hover:rgba(16,35,58,.07); --hi:#C4161C; --brand:#C4161C; }

/* ---------- Demo 1: hall-er porda ---------- */
.cur { position: fixed; top: 0; bottom: 0; width: 50vw; z-index: 0; pointer-events: none; transition: filter 600ms ease; }
.cur-l { left: 0; transform: translateX(calc(-50vw + var(--gut))); }
.cur-r { right: 0; transform: translateX(calc(50vw - var(--gut))); }
.cur-cloth { position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.25), transparent 22%, transparent 78%, rgba(0,0,0,.4)),
              repeating-linear-gradient(90deg, #5A080C 0 4px, #9C1218 18px, #D0262C 27px, #9C1218 36px, #5A080C 50px); }
.cur-l .cur-cloth { clip-path: polygon(0 0, 100% 0, calc(100% - 6px) 22%, calc(100% - 24px) 46%, calc(100% - 44px) 63%, calc(100% - 26px) 76%, calc(100% - 12px) 100%, 0 100%); }
.cur-r .cur-cloth { clip-path: polygon(0 0, 100% 0, 100% 100%, 12px 100%, 26px 76%, 44px 63%, 24px 46%, 6px 22%); }
.cur-tie { position: absolute; top: 61%; width: 70px; height: 18px; border-radius: 9px; background: repeating-linear-gradient(60deg, #B8860B 0 6px, #FFD21F 6px 12px); box-shadow: 0 4px 0 rgba(0,0,0,.35); }
.cur-tie::after { content: ""; position: absolute; top: 14px; left: 50%; width: 16px; height: 46px; translate: -50% 0; border-radius: 4px 4px 8px 8px; background: repeating-linear-gradient(90deg, #B8860B 0 3px, #FFD21F 3px 6px); }
.cur-l .cur-tie { right: 18px; } .cur-r .cur-tie { left: 18px; }
.cur-val { position: absolute; top: 0; left: 0; right: 0; height: 74px; background: #1A0B07;
  -webkit-mask: radial-gradient(circle 22px at 22px 100%, transparent 21px, #000 22px) 0 0 / 44px 100% repeat-x; mask: radial-gradient(circle 22px at 22px 100%, transparent 21px, #000 22px) 0 0 / 44px 100% repeat-x; }
.cur-bulbs { position: absolute; top: 18px; left: 0; right: 0; display: flex; justify-content: space-around; padding-inline: 10px; }
.cur-bulb { width: 12px; height: 12px; border-radius: 50%; background: #6B5A2A; transition: background-color 500ms ease, box-shadow 500ms ease; }
.tcn[data-m="night"] .cur-bulb { background: #FFE27A; box-shadow: 0 0 6px 2px rgba(255,210,31,.75), 0 0 18px 4px rgba(255,160,30,.35); animation: cur-chase 2.4s linear infinite; }
.tcn[data-m="day"] .cur { filter: saturate(1.05) brightness(1.08); }
.tcn[data-m="night"] .cur { filter: brightness(.82); }
.cur-spot { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0; transition: opacity 700ms ease; background: radial-gradient(48% 38% at 50% -6%, rgba(255,210,31,.16), transparent 70%); }
.tcn[data-m="night"] .cur-spot { opacity: 1; }
@keyframes cur-chase { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
@keyframes cur-open-l { from { transform: translateX(0); } }
@keyframes cur-open-r { from { transform: translateX(0); } }
@media (prefers-reduced-motion: no-preference) {
  .cur-l { animation: cur-open-l 1300ms var(--ease-in-out) 150ms both; }
  .cur-r { animation: cur-open-r 1300ms var(--ease-in-out) 150ms both; }
}
@media (prefers-reduced-motion: reduce) { .tcn[data-m="night"] .cur-bulb { animation: none; } }

/* ticket switch */
.tk-sw { display: inline-flex; height: 44px; border-radius: 4px; overflow: hidden; background: #F4E3C1; color: #1A0B07; box-shadow: 3px 3px 0 #1A0B07; font-family: ${POSTER.replace(/"/g, "'")}; font-size: 12px; }
.tk-sw span { display: grid; place-items: center; padding: 0 10px; transition: background-color 250ms ease, color 250ms ease; }
.tk-sw span + span { border-left: 2px dashed rgba(26,11,7,.45); }
.tk-sw[aria-checked="false"] span:first-child, .tk-sw[aria-checked="true"] span:last-child { background: #C4161C; color: #FFD21F; }

/* ---------- Demo 2: daamer tag ---------- */
.tags { position: fixed; top: 0; bottom: 0; z-index: 0; width: clamp(64px, calc(var(--gut) - 36px), 176px); container-type: inline-size;
  -webkit-mask: linear-gradient(transparent, #000 14%, #000 86%, transparent); mask: linear-gradient(transparent, #000 14%, #000 86%, transparent); }
.tags-l { left: calc(var(--gut) / 2); translate: -50% 0; }
.tags-r { right: calc(var(--gut) / 2); translate: 50% 0; }
.tags-track { display: flex; flex-direction: column; gap: 18px; padding: 10px 6px; }
@media (prefers-reduced-motion: no-preference) {
  .tags-track { animation: tags-up var(--dur, 90s) linear infinite; }
  .tags-r .tags-track { animation-direction: reverse; }
  @media (hover: hover) and (pointer: fine) { .tags:hover .tags-track { animation-play-state: paused; } }
}
@keyframes tags-up { to { transform: translateY(-50%); } }
.tag { position: relative; display: block; width: 100%; padding: 22px 10px 12px; border-radius: 6px 6px 10px 10px; text-align: left; cursor: pointer; transition: background-color 500ms ease, color 500ms ease, box-shadow 500ms ease, translate 200ms var(--ease-out); }
.tag::before { content: ""; position: absolute; top: 8px; left: 50%; width: 9px; height: 9px; translate: -50% 0; border-radius: 50%; box-shadow: inset 0 0 0 2px currentColor; opacity: .5; }
.tag:nth-child(odd) { rotate: -2deg; } .tag:nth-child(even) { rotate: 1.5deg; }
@media (hover: hover) and (pointer: fine) { .tag:hover { translate: 0 -3px; } }
.tcn[data-m="day"] .tag { background: #FFF8EA; color: #1A0B07; box-shadow: 3px 3px 0 var(--deep); }
.tcn[data-m="day"] .tag-price { color: #C4161C; }
.tcn[data-m="night"] .tag { background: #0A2427; color: #FFC65A; box-shadow: 0 0 0 1.5px rgba(255,178,62,.75), 0 0 18px -2px rgba(255,150,40,.45); }
.tcn[data-m="night"] .tag-price, .tcn[data-m="night"] .tag-name { text-shadow: 0 0 8px rgba(255,170,50,.8); }
.tag-name { font-family: ${POSTER.replace(/"/g, "'")}; font-size: 13px; line-height: 1; }
.tag-price { font-weight: 800; font-size: 17px; line-height: 1.1; font-variant-numeric: tabular-nums; }
.tag-meta { font-size: 11px; opacity: .65; }
@container (width < 120px) { .tag-name, .tag-meta { display: none; } .tag-price { font-size: 13px; } .tag img { margin-inline: auto; } .tag { text-align: center; } }

/* wall switch */
.wsw { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 8px; background: #F7F4EC; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15), 3px 3px 0 #1A0B07; }
.wsw-rock { width: 18px; height: 28px; border-radius: 4px; background: linear-gradient(#fff, #E6E0D2); box-shadow: inset 0 0 0 1px rgba(0,0,0,.2); position: relative; }
.wsw-rock::after { content: ""; position: absolute; left: 3px; right: 3px; height: 10px; border-radius: 2px; transition: top 220ms var(--ease-out), background-color 220ms ease; top: 3px; background: #C4161C; }
.wsw[aria-checked="true"] .wsw-rock::after { top: 15px; background: #1A0B07; }

/* ---------- Demo 3: akash ---------- */
.sky { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.sky-day, .sky-night { position: absolute; inset: 0; transition: opacity 900ms ease; }
.sky-day { background: linear-gradient(#86CDEE, #BFE6F5 55%, #F6EBCB); }
.sky-night { background: linear-gradient(#070A22, #121845 60%, #2A1D45); opacity: 0; }
.tcn[data-m="night"] .sky-night { opacity: 1; } .tcn[data-m="night"] .sky-day { opacity: 0; }
.sky-sun { position: absolute; top: 90px; left: calc(var(--gut) / 2); width: 110px; height: 110px; translate: -50% 0; border-radius: 50%; background: #FFD21F; box-shadow: 0 0 0 14px rgba(255,210,31,.25), 0 0 0 30px rgba(255,210,31,.12); transition: opacity 700ms ease, translate 900ms var(--ease-in-out); }
.sky-moon { position: absolute; top: 90px; right: calc(var(--gut) / 2); width: 92px; height: 92px; translate: 50% 0; border-radius: 50%; box-shadow: -22px 10px 0 0 #F6EBC4; rotate: 20deg; transition: opacity 700ms ease, translate 900ms var(--ease-in-out); }
.tcn[data-m="night"] .sky-sun { opacity: 0; translate: -50% 140px; } .tcn[data-m="day"] .sky-moon { opacity: 0; translate: 50% 140px; }
.sky-star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #FFF6D8; opacity: 0; transition: opacity 900ms ease; }
.tcn[data-m="night"] .sky-star { opacity: .9; animation: twinkle 3.2s ease-in-out infinite; }
@keyframes twinkle { 50% { opacity: .25; } }
.cloud { position: absolute; height: 34px; border-radius: 40px; background: #fff; opacity: .85; transition: opacity 900ms ease; animation: drift 70s linear infinite; }
.cloud::before, .cloud::after { content: ""; position: absolute; bottom: 12px; border-radius: 50%; background: inherit; }
.cloud::before { left: 18%; width: 46%; aspect-ratio: 1; } .cloud::after { right: 16%; width: 34%; aspect-ratio: 1; }
.tcn[data-m="night"] .cloud { opacity: .07; }
@keyframes drift { from { transform: translateX(-30vw); } to { transform: translateX(130vw); } }
.ghuri { position: fixed; z-index: 0; pointer-events: none; transition: opacity 800ms ease; }
.ghuri svg { display: block; overflow: visible; transform-origin: 50% 28%; animation: sway var(--sw, 6s) ease-in-out infinite; }
@keyframes sway { 0%, 100% { transform: rotate(-7deg) translate(0, 0); } 50% { transform: rotate(6deg) translate(8px, -14px); } }
.tcn[data-m="night"] .ghuri { opacity: 0; }
@supports (animation-timeline: scroll()) { @media (prefers-reduced-motion: no-preference) {
  .ghuri { animation: para linear both; animation-timeline: scroll(root); }
  @keyframes para { to { transform: translateY(var(--py)); } }
} }
.fanush { position: fixed; bottom: -90px; z-index: 0; pointer-events: none; width: 30px; height: 40px; opacity: 0; transition: opacity 900ms ease;
  border-radius: 46% 46% 22% 22% / 55% 55% 18% 18%; background: radial-gradient(circle at 50% 78%, #FFF1B8, #FFB13D 42%, #E0601E 80%); box-shadow: 0 0 22px 6px rgba(255,150,40,.42), 0 0 60px 10px rgba(255,120,30,.16); }
.fanush::after { content: ""; position: absolute; bottom: -5px; left: 50%; width: 7px; height: 9px; translate: -50% 0; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: #FFF6C8; box-shadow: 0 0 8px 3px rgba(255,220,120,.9); }
.tcn[data-m="night"] .fanush { opacity: 1; }
@media (prefers-reduced-motion: no-preference) { .fanush { animation: rise var(--t) linear var(--dl) infinite; } }
@media (prefers-reduced-motion: reduce) { .fanush { transform: translateY(calc(var(--ry) * -1)); } }
@keyframes rise { 0% { transform: translate(0, 0) rotate(-3deg); } 50% { transform: translate(calc(var(--dx) * .5), -62vh) rotate(3deg); } 100% { transform: translate(var(--dx), -125vh) rotate(-2deg); } }
.flock { position: absolute; display: flex; gap: 14px; transition: opacity 900ms ease; animation: fly var(--t) linear var(--dl) infinite; }
.flock i { display: block; width: 22px; height: 10px; animation: flap .5s ease-in-out infinite alternate; background: no-repeat center / contain url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 10'%3E%3Cpath d='M1 7Q6 0 12 7Q18 0 23 7' fill='none' stroke='%2310233A' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E"); }
.flock i:nth-child(2) { margin-top: 10px; animation-delay: .15s; } .flock i:nth-child(3) { margin-top: -6px; animation-delay: .3s; }
.tcn[data-m="night"] .flock { opacity: 0; }
@keyframes fly { from { transform: translateX(-12vw); } to { transform: translateX(112vw); } }
@keyframes flap { to { transform: scaleY(.35); } }
@media (prefers-reduced-motion: reduce) { .cloud, .flock, .flock i, .ghuri svg, .tcn[data-m="night"] .sky-star { animation: none; } .flock { left: 30vw; } }

/* sun/moon dial */
.dial { position: relative; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; box-shadow: 3px 3px 0 #1A0B07, inset 0 0 0 2px #1A0B07; transition: background-color 500ms ease; background: #86CDEE; }
.dial[aria-checked="true"] { background: #121845; }
.dial-wheel { position: absolute; inset: 0; transition: rotate 600ms var(--ease-in-out); }
.dial[aria-checked="true"] .dial-wheel { rotate: 180deg; }
.dial-sun, .dial-moon { position: absolute; left: 50%; width: 18px; height: 18px; translate: -50% 0; border-radius: 50%; }
.dial-sun { top: 9px; background: #FFD21F; box-shadow: 0 0 0 3px rgba(255,210,31,.35); }
.dial-moon { bottom: 9px; rotate: 180deg; box-shadow: -5px 3px 0 0 #F6EBC4; }
.dial::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 11px; background: #1F7A3A; box-shadow: 0 -2px 0 #1A0B07; }

/* sides only where there's room */
@media (max-width: 1339px) { .tags, .ghuri, .fanush { display: none; } }
@media (max-width: 1199px) { .sky-sun, .sky-moon { display: none; } }
`

/** The day/night control, drawn differently per demo. */
export function ModeSwitch({ demo, mode, toggle }: { demo: Demo; mode: Mode; toggle: () => void }) {
  const night = mode === 'night'
  const label = night ? 'Night mode on. Switch to day' : 'Day mode on. Switch to night'
  if (demo === 1) return (
    <button type="button" role="switch" aria-checked={night} aria-label={label} onClick={toggle} className="tk-sw kc-press cursor-pointer">
      <span>MATINEE</span><span>NIGHT SHOW</span>
    </button>
  )
  if (demo === 2) return (
    <button type="button" role="switch" aria-checked={night} aria-label={label} onClick={toggle} className="kc-press flex cursor-pointer items-center gap-2">
      <span className="wsw"><span className="wsw-rock" /></span>
      <span className="text-sm leading-none font-bold">{night ? 'Raat' : 'Din'}</span>
    </button>
  )
  return (
    <button type="button" role="switch" aria-checked={night} aria-label={label} onClick={toggle} className="dial kc-press cursor-pointer">
      <span className="dial-wheel"><span className="dial-sun" /><span className="dial-moon" /></span>
    </button>
  )
}

function Curtains() {
  const Side = ({ side }: { side: 'l' | 'r' }) => (
    <div className={`cur cur-${side}`}>
      <div className="cur-cloth" /><div className="cur-tie" />
      <div className="cur-val" /><div className="cur-bulbs">{Array.from({ length: 16 }, (_, k) => <i key={k} className="cur-bulb" style={{ animationDelay: `${(k % 4) * -0.6}s` }} />)}</div>
    </div>
  )
  return <div aria-hidden><div className="cur-spot" /><Side side="l" /><Side side="r" /></div>
}

function Tags({ ver, onPick }: { ver: number; onPick: (id: string) => void }) {
  void ver // re-render when live prices land
  const live = ITEMS.filter((i) => !i.off)
  const half = Math.ceil(live.length / 2)
  const Col = ({ items, side }: { items: typeof live; side: 'l' | 'r' }) => (
    <nav aria-label={side === 'l' ? 'Price tags' : undefined} aria-hidden={side === 'r' || undefined} className={`tags tags-${side}`}>
      <div className="tags-track" style={{ '--dur': `${items.length * 3.2}s` } as React.CSSProperties}>
        {[...items, ...items].map((i, k) => {
          const dup = k >= items.length
          return (
            <button key={k} type="button" tabIndex={dup || side === 'r' ? -1 : 0} aria-hidden={dup || undefined} onClick={() => onPick(i.id)} className="tag">
              <img src={IMG[i.id]} alt="" className="mb-1.5 size-9" />
              <span className="tag-name block">{i.local}</span>
              <span className="tag-price block">{tk(i.min, i.max)}</span>
              <span className="tag-meta block">{UNIT[i.unit]} · {freshness(i.date).label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
  return <><Col items={live.slice(0, half)} side="l" /><Col items={live.slice(half)} side="r" /></>
}

const STARS = Array.from({ length: 46 }, (_, k) => ({ x: (k * 37.7) % 100, y: (k * 23.3) % 92, d: (k % 7) * 0.45 }))
/* Ghuri (kites, Shakrain-style) by day; fanush (sky lanterns) by night. */
const KITES: { side: 'l' | 'r'; top: string; w: number; a: string; c: string; py: string; sw: string; lean: number }[] = [
  { side: 'l', top: '22%', w: 92, a: '#C4161C', c: '#FFD21F', py: '-160px', sw: '5.5s', lean: -14 },
  { side: 'l', top: '58%', w: 70, a: '#1F7A3A', c: '#F4E3C1', py: '-300px', sw: '7s', lean: 10 },
  { side: 'r', top: '30%', w: 84, a: '#2C5BD6', c: '#FF9F1A', py: '-240px', sw: '6.2s', lean: 12 },
  { side: 'r', top: '66%', w: 64, a: '#7A2BB5', c: '#FFD21F', py: '-120px', sw: '5s', lean: -10 },
]
function Kite({ a, c, lean }: { a: string; c: string; lean: number }) {
  return (
    <svg viewBox="0 0 100 200" style={{ rotate: `${lean}deg` }}>
      <path d={`M50 64 L${lean < 0 ? -260 : 360} 1400`} stroke="rgba(16,35,58,.35)" strokeWidth="1.2" fill="none" />
      <path d="M50 108 q-14 18 0 34 t0 34 t0 22" stroke={a} strokeWidth="3" fill="none" strokeLinecap="round" />
      {[128, 158, 186].map((y) => <path key={y} d={`M42 ${y - 6} L58 ${y + 6} M58 ${y - 6} L42 ${y + 6}`} stroke={c} strokeWidth="4" strokeLinecap="round" />)}
      <path d="M50 0 L90 50 L50 110 Z" fill={c} /><path d="M50 0 L10 50 L50 110 Z" fill={a} />
      <path d="M50 0 L90 50 L50 110 L10 50 Z" fill="none" stroke="#10233A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 2 V108 M12 50 Q50 34 88 50" stroke="#10233A" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="9" fill={a === '#C4161C' ? '#1F7A3A' : '#C4161C'} stroke="#10233A" strokeWidth="2" />
    </svg>
  )
}
const FANUSH = Array.from({ length: 12 }, (_, k) => ({ side: k % 2 ? 'r' : 'l', off: ((k * 29) % 70) + 15, t: 26 + ((k * 7) % 14), dl: -((k * 4.3) % 34), dx: ((k * 13) % 50) - 25, ry: 15 + ((k * 23) % 70), s: 0.7 + ((k * 3) % 5) / 10 }))
function Sky() {
  return (
    <div aria-hidden>
      <div className="sky">
        <div className="sky-day" /><div className="sky-night" />
        {STARS.map((s, k) => <i key={k} className="sky-star" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />)}
        <div className="sky-sun" /><div className="sky-moon" />
        <div className="cloud" style={{ top: '9%', width: 150, animationDelay: '-10s' }} />
        <div className="cloud" style={{ top: '38%', width: 110, animationDelay: '-42s', animationDuration: '95s' }} />
        <div className="cloud" style={{ top: '70%', width: 170, animationDelay: '-25s', animationDuration: '120s' }} />
        <div className="flock" style={{ top: '17%', '--t': '46s', '--dl': '-8s' } as React.CSSProperties}><i /><i /><i /></div>
        <div className="flock" style={{ top: '48%', '--t': '64s', '--dl': '-40s' } as React.CSSProperties}><i /><i /></div>
      </div>
      {KITES.map((k, i) => (
        <div key={i} className="ghuri" style={{ top: k.top, width: k.w, [k.side === 'l' ? 'left' : 'right']: `calc(var(--gut) / 2 - ${k.w / 2}px)`, '--py': k.py } as React.CSSProperties}>
          <div style={{ '--sw': k.sw } as React.CSSProperties}><Kite a={k.a} c={k.c} lean={k.lean} /></div>
        </div>
      ))}
      {FANUSH.map((f, i) => (
        <i key={i} className="fanush" style={{ [f.side === 'l' ? 'left' : 'right']: `calc(var(--gut) * ${f.off / 100})`, scale: f.s, '--t': `${f.t}s`, '--dl': `${f.dl}s`, '--dx': `${f.dx}px`, '--ry': `${f.ry}vh` } as React.CSSProperties} />
      ))}
    </div>
  )
}

export function Sides({ demo, ver, onPick }: { demo: Demo; ver: number; onPick: (id: string) => void }) {
  if (demo === 1) return <Curtains />
  if (demo === 2) return <Tags ver={ver} onPick={onPick} />
  return <Sky />
}

/** Demo picker, only in demo builds. */
export function DemoPicker({ demo, set }: { demo: Demo; set: (d: Demo) => void }) {
  return (
    <div role="group" aria-label="Demo" className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full bg-[#1A0B07] p-1 text-[#F4E3C1] shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)]">
      {([1, 2, 3] as Demo[]).map((d) => (
        <button key={d} type="button" aria-pressed={demo === d} onClick={() => set(d)}
          className={cn('h-10 cursor-pointer rounded-full px-3 text-sm font-bold whitespace-nowrap sm:px-4 transition-colors duration-200', demo === d ? 'bg-[#FFD21F] text-[#1A0B07]' : 'hover:bg-white/10')}>
          {d === 1 ? 'Hall-er porda' : d === 2 ? 'Damer tag' : 'Akash'}
        </button>
      ))}
    </div>
  )
}
