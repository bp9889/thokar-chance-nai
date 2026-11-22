import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { DESH_CSS, DeshSides } from './desh'

export type Mode = 'day' | 'night'

/** Day/night: follows the system until the visitor picks, then remembers the pick. */
export function useMode() {
  const sys = (): Mode => (matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day')
  const [mode, setMode] = useState<Mode>(() => { try { return (localStorage.getItem('tcn-mode') as Mode) || sys() } catch { return sys() } })
  // The whole page changes colour at once, so let the browser cross-fade two snapshots (smooth on phones)
  // instead of animating colours on every element. Browsers without View Transitions just switch.
  const toggle = () => {
    const n: Mode = mode === 'day' ? 'night' : 'day'
    try { localStorage.setItem('tcn-mode', n) } catch { /* private mode */ }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) doc.startViewTransition(() => flushSync(() => setMode(n)))
    else setMode(n)
  }
  useEffect(() => { document.documentElement.style.colorScheme = mode === 'night' ? 'dark' : 'light' }, [mode])
  return { mode, toggle }
}

/* Page tokens per mode. The poster, chat and list cards keep their printed colours. */
export const THEME_CSS = DESH_CSS + `
::view-transition-old(root), ::view-transition-new(root) { animation-duration: 320ms; animation-timing-function: ease; }
.tcn { --gut: max(0px, calc((100vw - 1180px) / 2)); background-color: var(--pg); color: var(--ink); }
.tcn[data-m="night"] { --pg:#0D1233; --ink:#F4E3C1; --soft:#C9C6E6; --deep:#05071A; --chip:#222A5C; --chip-ink:#F4E3C1; --line:rgba(244,227,193,.15); --hover:rgba(255,255,255,.08); --hi:#FFD21F; --brand:#FFD21F; }
.tcn[data-m="day"]   { --pg:#BFE6F5; --ink:#10233A; --soft:#2E4C68; --deep:#10233A; --chip:#10233A; --chip-ink:#F4E3C1; --line:rgba(16,35,58,.16); --hover:rgba(16,35,58,.07); --hi:#C4161C; --brand:#C4161C; }
/* ---------- akash ---------- */
.sky { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.sky-day, .sky-night { position: absolute; inset: 0; }
.sky-day { background: linear-gradient(#86CDEE, #BFE6F5 55%, #F6EBCB); }
.sky-night { background: linear-gradient(#070A22, #121845 60%, #2A1D45); opacity: 0; }
.tcn[data-m="night"] .sky-night { opacity: 1; } .tcn[data-m="night"] .sky-day { opacity: 0; }
.sky-sun { position: absolute; top: 90px; left: calc(var(--gut) / 2); width: 110px; height: 110px; translate: -50% 0; border-radius: 50%; background: #FFD21F; box-shadow: 0 0 0 14px rgba(255,210,31,.25), 0 0 0 30px rgba(255,210,31,.12); }
.sky-moon { position: absolute; top: 90px; right: calc(var(--gut) / 2); width: 92px; height: 92px; translate: 50% 0; border-radius: 50%; box-shadow: -22px 10px 0 0 #F6EBC4; rotate: 20deg; }
.tcn[data-m="night"] .sky-sun { opacity: 0; translate: -50% 140px; } .tcn[data-m="day"] .sky-moon { opacity: 0; translate: 50% 140px; }
.sky-star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #FFF6D8; opacity: 0; }
.tcn[data-m="night"] .sky-star { opacity: .9; animation: twinkle 3.2s ease-in-out infinite; }
@keyframes twinkle { 50% { opacity: .25; } }
.cloud { position: absolute; height: 34px; border-radius: 40px; background: #fff; opacity: .85; animation: drift 70s linear infinite; }
.cloud::before, .cloud::after { content: ""; position: absolute; bottom: 12px; border-radius: 50%; background: inherit; }
.cloud::before { left: 18%; width: 46%; aspect-ratio: 1; } .cloud::after { right: 16%; width: 34%; aspect-ratio: 1; }
.tcn[data-m="night"] .cloud { opacity: .07; }
@keyframes drift { from { transform: translateX(-30vw); } to { transform: translateX(130vw); } }
.fanush { position: fixed; bottom: -90px; z-index: 0; pointer-events: none; width: 30px; height: 40px; opacity: 0;
  border-radius: 46% 46% 22% 22% / 55% 55% 18% 18%; background: radial-gradient(circle at 50% 78%, #FFF1B8, #FFB13D 42%, #E0601E 80%); box-shadow: 0 0 22px 6px rgba(255,150,40,.42), 0 0 60px 10px rgba(255,120,30,.16); }
.fanush::after { content: ""; position: absolute; bottom: -5px; left: 50%; width: 7px; height: 9px; translate: -50% 0; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: #FFF6C8; box-shadow: 0 0 8px 3px rgba(255,220,120,.9); }
.tcn[data-m="night"] .fanush { opacity: 1; }
@media (prefers-reduced-motion: no-preference) { .fanush { animation: rise var(--t) linear var(--dl) infinite; } }
@media (prefers-reduced-motion: reduce) { .fanush { transform: translateY(calc(var(--ry) * -1)); } }
@keyframes rise { 0% { transform: translate(0, 0) rotate(-3deg); } 50% { transform: translate(calc(var(--dx) * .5), -62vh) rotate(3deg); } 100% { transform: translate(var(--dx), -125vh) rotate(-2deg); } }
@media (prefers-reduced-motion: reduce) { .cloud, .tcn[data-m="night"] .sky-star { animation: none; } }

/* sun/moon dial */
.dial { position: relative; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; box-shadow: 3px 3px 0 #1A0B07, inset 0 0 0 2px #1A0B07; transition: background-color 500ms ease; background: #86CDEE; }
.dial[aria-checked="true"] { background: #121845; }
.dial-wheel { position: absolute; inset: 0; transition: rotate 600ms var(--ease-in-out); }
.dial[aria-checked="true"] .dial-wheel { rotate: 180deg; }
.dial-sun, .dial-moon { position: absolute; left: 50%; width: 18px; height: 18px; translate: -50% 0; border-radius: 50%; }
.dial-sun { top: 9px; background: #FFD21F; box-shadow: 0 0 0 3px rgba(255,210,31,.35); }
.dial-moon { bottom: 9px; rotate: 180deg; box-shadow: -5px 3px 0 0 #F6EBC4; }
.dial::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 11px; background: #1F7A3A; box-shadow: 0 -2px 0 #1A0B07; }

@media (max-width: 1339px) { .fanush { display: none; } }
@media (max-width: 1199px) { .sky-sun, .sky-moon { display: none; } }
`

/** The day/night control: a sun-and-moon dial. */
export function ModeSwitch({ mode, toggle }: { mode: Mode; toggle: () => void }) {
  const night = mode === 'night'
  return (
    <button type="button" role="switch" aria-checked={night} aria-label={night ? 'Night mode on. Switch to day' : 'Day mode on. Switch to night'} onClick={toggle} className="dial kc-press cursor-pointer">
      <span className="dial-wheel"><span className="dial-sun" /><span className="dial-moon" /></span>
    </button>
  )
}

const rnd = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x) }
const STARS = Array.from({ length: 46 }, (_, k) => ({ x: rnd(k + 1) * 100, y: rnd(k + 101) * 92, d: rnd(k + 201) * 3 }))
/* Fanush (sky lanterns) rise at night. */
const FANUSH = Array.from({ length: 12 }, (_, k) => ({ side: k % 2 ? 'r' : 'l', off: ((k * 29) % 70) + 15, t: 26 + ((k * 7) % 14), dl: -((k * 4.3) % 34), dx: ((k * 13) % 50) - 25, ry: 15 + ((k * 23) % 70), s: 0.7 + ((k * 3) % 5) / 10 }))
/** Fixed sky behind the page: sun, clouds and Dhaka wires with kak/shalik by day; moon, stars, fairy lights and fanush by night. */
export function Sky() {
  return (
    <div aria-hidden>
      <div className="sky">
        <div className="sky-day" /><div className="sky-night" />
        {STARS.map((s, k) => <i key={k} className="sky-star" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />)}
        <div className="sky-sun" /><div className="sky-moon" />
        <div className="cloud" style={{ top: '9%', width: 150, animationDelay: '-10s' }} />
        <div className="cloud" style={{ top: '38%', width: 110, animationDelay: '-42s', animationDuration: '95s' }} />
        <div className="cloud" style={{ top: '70%', width: 170, animationDelay: '-25s', animationDuration: '120s' }} />
      </div>
      <DeshSides />
      {FANUSH.map((f, i) => (
        <i key={i} className="fanush" style={{ [f.side === 'l' ? 'left' : 'right']: `calc(var(--gut) * ${f.off / 100})`, scale: f.s, '--t': `${f.t}s`, '--dl': `${f.dl}s`, '--dx': `${f.dx}px`, '--ry': `${f.ry}vh` } as React.CSSProperties} />
      ))}
    </div>
  )
}

