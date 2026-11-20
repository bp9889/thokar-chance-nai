/* Tar-er jongol: Dhaka's tangled electric wires beside the page, with kak and shalik by day
   and biyebari fairy lights by night. */
import type React from 'react'


export const DESH_CSS = `
.dside { position: fixed; top: 0; bottom: 0; width: var(--gut); z-index: 0; pointer-events: none; overflow: hidden; }
.dside-l { left: 0; } .dside-r { right: 0; transform: scaleX(-1); }
.day-only, .night-only { transition: opacity 900ms ease; }
.tcn[data-m="night"] .day-only { opacity: 0; } .tcn[data-m="day"] .night-only { opacity: 0; }
@media (max-width: 1339px) { .dside { display: none; } }

/* tar-er jongol */
.pole { position: absolute; left: 14%; top: 7vh; bottom: 0; width: 13px; background: linear-gradient(90deg, #6F7A80, #A9B3B8 45%, #7D878C); border-radius: 3px 3px 0 0; }
.tcn[data-m="night"] .pole { filter: brightness(.45); }
.xbar { position: absolute; left: calc(14% - 34px); width: 81px; height: 7px; background: #3B4248; border-radius: 2px; }
.xbar::before, .xbar::after { content: ""; position: absolute; top: -8px; width: 7px; height: 9px; border-radius: 3px 3px 0 0; background: #D9DEE0; }
.xbar::before { left: 4px; } .xbar::after { right: 4px; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.tcn[data-m="night"] .wires { opacity: .55; }
.bird { position: absolute; translate: -50% -100%; }
.bird svg { display: block; animation: hop var(--hp, 5s) ease-in-out var(--hd, 0s) infinite; transform-origin: 50% 100%; }
@keyframes hop { 0%, 86%, 100% { transform: translateY(0) rotate(0deg); } 90% { transform: translateY(-7px) rotate(-6deg); } 94% { transform: translateY(0) rotate(3deg); } }
.bulb { position: absolute; width: 6px; height: 6px; translate: -50% -30%; border-radius: 50%; background: var(--c); box-shadow: 0 0 6px 2px var(--c); animation: twinkle 2.6s ease-in-out var(--d) infinite; }

@media (prefers-reduced-motion: reduce) {
  .bird svg, .bulb { animation: none; }
}
`

// Quadratic wire from (x0,y0) to (x1,y1) sagging by s; coordinates in % of the side panel.
type Wire = { x0: number; y0: number; x1: number; y1: number; s: number }
const pt = (w: Wire, t: number) => {
  const cx = (w.x0 + w.x1) / 2, cy = (w.y0 + w.y1) / 2 + w.s
  const u = 1 - t
  return { x: u * u * w.x0 + 2 * u * t * cx + t * t * w.x1, y: u * u * w.y0 + 2 * u * t * cy + t * t * w.y1 }
}
const WIRES: Wire[] = [
  { x0: 8, y0: 10.5, x1: 104, y1: 15, s: 7 }, { x0: 22, y0: 10.5, x1: 104, y1: 24, s: 6 }, { x0: 8, y0: 17.5, x1: 104, y1: 31, s: 8 },
  { x0: 22, y0: 17.5, x1: 104, y1: 40, s: 5 }, { x0: 8, y0: 10.5, x1: -6, y1: 30, s: 4 }, { x0: 22, y0: 17.5, x1: 60, y1: 100, s: 2 },
]
const LIGHTS = ['#FFD21F', '#FF6B9A', '#7CFFB2', '#8FB8FF']

function Crow() {
  return (
    <svg width="34" height="28" viewBox="0 0 40 32" aria-hidden>
      <path d="M8 20 L0 26 L10 24 Z" fill="#141414" />
      <ellipse cx="18" cy="19" rx="12" ry="8" fill="#141414" />
      <ellipse cx="27" cy="14" rx="5" ry="6" fill="#4A4A4A" />
      <circle cx="30" cy="11" r="6" fill="#141414" /><circle cx="32" cy="10" r="1.3" fill="#E9E9E9" />
      <path d="M35 10 L42 12.5 L35 14 Z" fill="#2B2B2B" />
      <path d="M16 26 V31 M21 26 V31" stroke="#141414" strokeWidth="1.6" />
    </svg>
  )
}
function Shalik() {
  return (
    <svg width="28" height="25" viewBox="0 0 36 32" aria-hidden>
      <path d="M7 20 L0 25 L9 24 Z" fill="#2A1A10" />
      <ellipse cx="16" cy="19" rx="10" ry="7.5" fill="#6B3E26" />
      <ellipse cx="14" cy="19" rx="4" ry="2" fill="#F4F0E6" />
      <circle cx="26" cy="11" r="6" fill="#151515" /><circle cx="28" cy="10" r="2.4" fill="#F2C230" /><circle cx="28.4" cy="10" r="1" fill="#151515" />
      <path d="M31 10.5 L37 12 L31 13.5 Z" fill="#F2C230" />
      <path d="M14 26 V31 M18 26 V31" stroke="#E0A92B" strokeWidth="1.6" />
    </svg>
  )
}

function Tar() {
  const birds: { w: number; t: number; k: 'c' | 's'; hp: string; hd: string }[] = [
    { w: 0, t: 0.42, k: 'c', hp: '5s', hd: '-1s' }, { w: 0, t: 0.62, k: 's', hp: '4.2s', hd: '-3s' }, { w: 1, t: 0.55, k: 'c', hp: '6s', hd: '-2s' },
    { w: 2, t: 0.38, k: 's', hp: '4.6s', hd: '-.5s' }, { w: 2, t: 0.5, k: 's', hp: '5.4s', hd: '-4s' }, { w: 3, t: 0.7, k: 'c', hp: '6.4s', hd: '-1.6s' },
  ]
  return (
    <>
      <div className="pole"><span className="xbar" style={{ top: '3.5vh' }} /><span className="xbar" style={{ top: '10.5vh' }} /></div>
      <svg className="wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {WIRES.map((w, i) => <path key={i} d={`M${w.x0} ${w.y0} Q${(w.x0 + w.x1) / 2} ${(w.y0 + w.y1) / 2 + w.s * 2 - w.s} ${w.x1} ${w.y1}`} fill="none" stroke="#1B2430" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />)}
        <path d="M58 23 c4 -3 9 -1 7 3 c-2 4 -9 2 -6 -2 c3 -3 10 0 6 4 c-3 3 -8 1 -5 -2" fill="none" stroke="#1B2430" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="day-only">
        {birds.map((b, i) => { const p = pt(WIRES[b.w], b.t); return <div key={i} className="bird" style={{ left: `${p.x}%`, top: `${p.y}%`, '--hp': b.hp, '--hd': b.hd } as React.CSSProperties}>{b.k === 'c' ? <Crow /> : <Shalik />}</div> })}
      </div>
      <div className="night-only">
        {WIRES.slice(0, 4).flatMap((w, wi) => Array.from({ length: 11 }, (_, k) => { const p = pt(w, 0.08 + k * 0.085); return <i key={`${wi}-${k}`} className="bulb" style={{ left: `${p.x}%`, top: `${p.y}%`, '--c': LIGHTS[(k + wi) % 4], '--d': `${-((k * 0.37 + wi) % 2.6)}s` } as React.CSSProperties} /> }))}
      </div>
    </>
  )
}

export function DeshSides() {
  return (
    <div aria-hidden>
      <div className="dside dside-l"><Tar /></div>
      <div className="dside dside-r"><Tar /></div>
    </div>
  )
}
