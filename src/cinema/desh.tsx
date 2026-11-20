/* Deshi day skies for the Akash theme: tangled wires with kak/shalik, Puran Dhaka rooftops with
   pigeons, or a river with nouka and narikel gach. Each keeps the night sky (moon, stars, fanush). */
import type React from 'react'

export type DayV = 'tar' | 'chhad' | 'nodi'

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

/* chhad-er kobutor */
.bld { position: absolute; bottom: 0; --b: var(--bg); background-color: var(--b); border-top: 6px solid rgba(0,0,0,.2);
  background-image: linear-gradient(var(--b) 0 14px, transparent 14px), linear-gradient(90deg, var(--b) 0 12px, var(--win) 12px 26px, var(--b) 26px);
  background-size: 38px 44px; background-position: 4px 6px; transition: background-color 900ms ease; }
.tcn[data-m="day"] .bld { --win: rgba(30,52,70,.5); }
.tcn[data-m="night"] .bld { --win: #FFD979; --b: color-mix(in oklab, var(--bg) 30%, #0B1030); }
.tank { position: absolute; width: 30px; height: 36px; border-radius: 6px 6px 3px 3px; background: repeating-linear-gradient(#1C1C1C 0 7px, #2C2C2C 7px 9px); }
.tank::before { content: ""; position: absolute; top: -5px; left: 7px; width: 16px; height: 6px; border-radius: 3px 3px 0 0; background: #1C1C1C; }
.coop { position: absolute; width: 44px; height: 30px; background: #8A5A2E; border-radius: 3px; background-image: radial-gradient(circle at 25% 55%, #2A160A 4px, transparent 4.5px), radial-gradient(circle at 75% 55%, #2A160A 4px, transparent 4.5px); }
.coop::before { content: ""; position: absolute; top: -10px; left: -4px; right: -4px; height: 12px; background: #5E3A1A; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.line { position: absolute; height: 22px; border-top: 1.5px solid #2B2B2B; border-radius: 0 0 50% 50% / 0 0 30% 30%; }
.cloth { position: absolute; top: 0; width: 18px; height: 22px; transform-origin: 50% 0; animation: flutter 3s ease-in-out infinite; }
@keyframes flutter { 50% { transform: skewX(6deg) scaleY(.94); } }
.orbit { position: absolute; width: 190px; height: 190px; animation: orbit 16s linear infinite; }
.orbit-wrap { position: absolute; transform: scaleY(.42); }
.pigeon { position: absolute; left: 50%; top: 0; width: 34px; height: 16px; translate: -50% -50%; }
.pigeon i { position: absolute; top: 0; width: 17px; height: 12px; border-radius: 100% 0 0 0; background: #F7F7F4; box-shadow: inset 0 -3px 0 #7D8A94, 0 0 0 1px rgba(16,35,58,.35); animation: wing .42s ease-in-out infinite alternate; transform-origin: 100% 100%; }
.pigeon i + i { left: 16px; border-radius: 0 100% 0 0; transform-origin: 0 100%; }
@keyframes wing { to { transform: scaleY(-.6); } }
@keyframes orbit { to { rotate: 360deg; } }

/* nodi ar narikel gach */
.river { position: absolute; left: 0; right: 0; bottom: 0; height: 17vh; background: linear-gradient(#3E9BB2, #2A6F86); transition: filter 900ms ease; }
.river::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(255,255,255,.55) 0 18px, transparent 18px 46px) 0 22% / 100% 2px no-repeat, repeating-linear-gradient(90deg, rgba(255,255,255,.4) 0 12px, transparent 12px 60px) 20px 58% / 100% 2px no-repeat; animation: waves 6s linear infinite; }
@keyframes waves { to { background-position: 46px 22%, 80px 58%; } }
.tcn[data-m="night"] .river { filter: brightness(.38) saturate(.8); }
.bank { position: absolute; left: 0; right: 0; bottom: 17vh; height: 26px; background: #6BA34A; border-radius: 0 60% 0 0 / 0 100% 0 0; transition: filter 900ms ease; }
.tcn[data-m="night"] .bank, .tcn[data-m="night"] .palm { filter: brightness(.32) saturate(.6); }
.palm { position: absolute; bottom: 15vh; height: 64vh; transition: filter 900ms ease; }
.palm svg { height: 100%; overflow: visible; }
.crown { transform-box: view-box; transform-origin: 112px 118px; animation: crown 5s ease-in-out infinite; }
@keyframes crown { 50% { transform: rotate(4deg); } }
.nouka { position: absolute; bottom: 6vh; width: 110px; animation: row var(--rt, 34s) ease-in-out infinite alternate; }
.nouka svg { display: block; animation: bob 3.2s ease-in-out infinite; }
@keyframes row { from { left: 6%; } to { left: calc(100% - 120px); } }
.lamp { opacity: 0; transition: opacity 900ms ease; }
.tcn[data-m="night"] .lamp { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .bird svg, .bulb, .cloth, .orbit, .pigeon i, .river::before, .crown, .nouka, .nouka svg { animation: none; }
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

const CLOTHES = ['repeating-linear-gradient(90deg,#C4161C 0 4px,#F4E3C1 4px 8px)', 'repeating-linear-gradient(0deg,#1F4FA8 0 5px,#9FC1F2 5px 8px)', '#1F7A3A', 'repeating-linear-gradient(45deg,#F2C230 0 4px,#C4161C 4px 8px)']
function Chhad() {
  return (
    <>
      <div className="orbit-wrap day-only" style={{ left: '22%', top: '34vh' }}>
        <div className="orbit">{[0, 70, 140, 215, 290].map((a) => <span key={a} className="pigeon" style={{ rotate: `${a}deg`, transformOrigin: '50% 95px', top: 0 }}><i /><i /></span>)}</div>
      </div>
      <div className="bld" style={{ left: '-4%', width: '46%', height: '36vh', '--bg': '#E9B8A8' } as React.CSSProperties}>
        <span className="tank" style={{ top: -42, left: 14 }} /><span className="coop" style={{ top: -30, left: 54 }} />
      </div>
      <div className="bld" style={{ left: '36%', width: '38%', height: '27vh', '--bg': '#A8D5C4' } as React.CSSProperties}>
        <span className="line" style={{ top: -30, left: 8, width: '78%' }}>
          {CLOTHES.map((c, k) => <i key={k} className="cloth" style={{ left: `${10 + k * 22}%`, background: c, animationDelay: `${-k * 0.7}s`, height: k === 1 ? 30 : 22 }} />)}
        </span>
      </div>
      <div className="bld" style={{ left: '68%', width: '40%', height: '44vh', '--bg': '#F1D88C' } as React.CSSProperties}>
        <span className="tank" style={{ top: -42, left: 20 }} /><span className="tank" style={{ top: -42, left: 56 }} />
      </div>
    </>
  )
}

function Palm() {
  const fronds = [-168, -140, -112, -80, -48, -18, 14, 168]
  return (
    <svg viewBox="0 0 220 600" aria-hidden>
      <path d="M58 600 C72 420 70 260 112 118" fill="none" stroke="#8B5A2B" strokeWidth="20" strokeLinecap="round" />
      <path d="M58 600 C72 420 70 260 112 118" fill="none" stroke="#5E3A1A" strokeWidth="20" strokeDasharray="3 15" />
      <g className="crown">
        {fronds.map((a) => (
          <g key={a} transform={`translate(112 118) rotate(${a})`}>
            <path d="M0 0 Q48 -26 104 14 Q52 -6 0 7 Z" fill="#2F8F3A" stroke="#1E5E26" strokeWidth="2" />
            <path d="M8 2 Q50 -12 98 12" fill="none" stroke="#1E5E26" strokeWidth="1.5" strokeDasharray="2 6" />
          </g>
        ))}
        <circle cx="104" cy="128" r="9" fill="#6E4A1E" /><circle cx="119" cy="131" r="9" fill="#5C3D17" /><circle cx="111" cy="140" r="8" fill="#6E4A1E" />
      </g>
    </svg>
  )
}
function Nouka() {
  return (
    <svg viewBox="0 0 120 92" aria-hidden>
      <line x1="58" y1="66" x2="58" y2="6" stroke="#3B2414" strokeWidth="3" />
      <path d="M60 8 L104 18 L98 60 L60 58 Z" fill="#F4E3C1" stroke="#3B2414" strokeWidth="2" />
      <rect x="70" y="24" width="12" height="10" fill="#C4161C" /><rect x="84" y="40" width="10" height="9" fill="#1F7A3A" /><rect x="66" y="44" width="9" height="8" fill="#F2C230" />
      <path d="M4 62 Q60 80 116 62 L106 72 Q60 92 14 72 Z" fill="#3B2414" />
      <path d="M12 66 Q60 80 108 66" fill="none" stroke="#7A4A22" strokeWidth="2" />
      <g className="lamp"><circle cx="20" cy="58" r="10" fill="rgba(255,190,80,.35)" /><circle cx="20" cy="58" r="3.5" fill="#FFE7A0" /></g>
    </svg>
  )
}
function Nodi({ side }: { side: 'l' | 'r' }) {
  return (
    <>
      <div className="palm" style={{ left: '-6%' }}><Palm /></div>
      {side === 'l' && <div className="palm" style={{ left: '38%', height: '46vh' }}><Palm /></div>}
      <div className="bank" />
      <div className="river" />
      <div className="nouka" style={{ '--rt': side === 'l' ? '34s' : '42s' } as React.CSSProperties}><Nouka /></div>
    </>
  )
}

export function DeshSides({ v }: { v: DayV }) {
  const body = (side: 'l' | 'r') => (v === 'tar' ? <Tar /> : v === 'chhad' ? <Chhad /> : <Nodi side={side} />)
  return (
    <div aria-hidden>
      <div className="dside dside-l">{body('l')}</div>
      <div className="dside dside-r">{body('r')}</div>
    </div>
  )
}
