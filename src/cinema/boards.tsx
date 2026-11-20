/* Three ways to show the 70 items instead of one long list: a cinema seat chart,
   a wall of mini posters, and bazar jhuri (baskets) per category. */
import { useEffect, useRef } from 'react'
import type { Bazar } from '@/lib/useBazar'
import { cn } from '@/lib/utils'
import { POSTER, halftone } from './common'

type Item = Bazar['board'][number]
const ROWS: { cat: string; row: string; name: string }[] = [
  { cat: 'veg', row: 'A', name: 'Sobji' }, { cat: 'leaf', row: 'B', name: 'Shak' }, { cat: 'fruit', row: 'C', name: 'Fol' }, { cat: 'spice', row: 'D', name: 'Moshla' },
]
const group = (items: Item[]) => ROWS.map((r) => ({ ...r, items: items.filter((i) => i.cat === r.cat) })).filter((r) => r.items.length)
const seatNo = (items: Item[], id: string) => { for (const r of group(items)) { const k = r.items.findIndex((i) => i.id === id); if (k >= 0) return `${r.row}-${k + 1}` } return '' }

export const BOARD_CSS = `
.seat { position: relative; display: grid; justify-items: center; width: 72px; padding-top: 6px; cursor: pointer; transition: translate 180ms var(--ease-out); }
.seat-back { position: relative; display: grid; place-items: center; width: 58px; height: 50px; border-radius: 16px 16px 6px 6px; background: linear-gradient(#D3262C, #8E1015); box-shadow: inset 0 -6px 0 rgba(0,0,0,.25), 0 4px 0 #4A070A; transition: background 200ms ease, box-shadow 200ms ease; }
.seat-back::before, .seat-back::after { content: ""; position: absolute; bottom: -4px; width: 8px; height: 26px; border-radius: 4px; background: #4A070A; }
.seat-back::before { left: -7px; } .seat-back::after { right: -7px; }
.seat[aria-pressed="true"] .seat-back { background: linear-gradient(#FFE25A, #FFB800); box-shadow: inset 0 -6px 0 rgba(0,0,0,.18), 0 4px 0 #8A5A00, 0 0 0 3px var(--ink); }
.seat.off .seat-back { background: linear-gradient(#8C8C8C, #5C5C5C); box-shadow: inset 0 -6px 0 rgba(0,0,0,.25), 0 4px 0 #333; }
.seat.off img { filter: grayscale(1) opacity(.7); }
@media (hover: hover) and (pointer: fine) { .seat:hover { translate: 0 -4px; } }
.screen { height: 14px; border-radius: 50% 50% 0 0 / 100% 100% 0 0; background: linear-gradient(#FFF8E1, #F4E3C1); box-shadow: 0 10px 40px 6px rgba(255,226,140,.45); }
.ticket { position: relative; display: grid; grid-template-columns: 1fr 74px; border-radius: 10px; background: #FFF4DC; color: #1A0B07; box-shadow: 8px 8px 0 var(--deep);
  -webkit-mask: radial-gradient(circle 11px at calc(100% - 74px) 0, transparent 10px, #000 11px) top / 100% 51% no-repeat, radial-gradient(circle 11px at calc(100% - 74px) 100%, transparent 10px, #000 11px) bottom / 100% 51% no-repeat;
          mask: radial-gradient(circle 11px at calc(100% - 74px) 0, transparent 10px, #000 11px) top / 100% 51% no-repeat, radial-gradient(circle 11px at calc(100% - 74px) 100%, transparent 10px, #000 11px) bottom / 100% 51% no-repeat; }
.ticket-stub { border-left: 2px dashed rgba(26,11,7,.35); display: grid; place-items: center; writing-mode: vertical-rl; font-family: ${POSTER}; font-size: 14px; letter-spacing: .08em; color: #C4161C; }
.barcode { height: 34px; background: repeating-linear-gradient(90deg, #1A0B07 0 2px, transparent 2px 4px, #1A0B07 4px 5px, transparent 5px 8px, #1A0B07 8px 11px, transparent 11px 13px); }

.mini { position: relative; display: flex; flex-direction: column; aspect-ratio: 3 / 4; padding: 12px; border-radius: 4px; overflow: hidden; cursor: pointer; text-align: left;
  box-shadow: inset 0 0 0 4px rgba(26,11,7,.9), inset 0 0 0 7px var(--rim, #FFD21F), 5px 6px 0 var(--deep); transition: translate 200ms var(--ease-out), rotate 200ms var(--ease-out); }
.mini:nth-child(3n) { rotate: -1.6deg; } .mini:nth-child(3n+1) { rotate: 1.2deg; }
@media (hover: hover) and (pointer: fine) { .mini:hover { rotate: 0deg; translate: 0 -5px; } }
.mini .tape { position: absolute; top: -6px; left: 50%; width: 54px; height: 18px; translate: -50% 0; rotate: -4deg; background: rgba(255,248,225,.75); box-shadow: 0 1px 2px rgba(0,0,0,.2); }
.mini.off { filter: grayscale(.85); }

.jhuri { position: relative; padding: 70px 22px 30px; border-radius: 18px 18px 46px 46px;
  background: repeating-linear-gradient(45deg, rgba(0,0,0,.14) 0 6px, transparent 6px 12px), repeating-linear-gradient(-45deg, rgba(255,255,255,.12) 0 6px, transparent 6px 12px), linear-gradient(#C9934C, #A06A2C);
  box-shadow: inset 0 14px 0 #7E4F1F, inset 0 18px 0 #5E3A16, 8px 10px 0 var(--deep); }
.jhuri-tag { position: absolute; top: -16px; left: 24px; padding: 6px 14px 6px 22px; background: #FFD21F; color: #1A0B07; font-family: ${POSTER}; border-radius: 4px; rotate: -3deg; box-shadow: 3px 3px 0 #1A0B07; }
.jhuri-tag::before { content: ""; position: absolute; left: 8px; top: 50%; width: 7px; height: 7px; translate: 0 -50%; border-radius: 50%; background: #1A0B07; }
.tok { display: grid; justify-items: center; gap: 2px; width: 84px; margin: -4px; cursor: pointer; transition: translate 180ms var(--ease-out); }
.tok:nth-child(odd) { rotate: -4deg; } .tok:nth-child(even) { rotate: 3deg; }
.tok img { filter: drop-shadow(3px 4px 0 rgba(26,11,7,.45)); }
.tok-tag { padding: 2px 6px; border-radius: 3px; background: #FFF8EA; color: #1A0B07; font-size: 12px; font-weight: 700; line-height: 1.15; text-align: center; box-shadow: 1px 2px 0 rgba(26,11,7,.5); }
.tok.off { opacity: .55; filter: grayscale(.9); }
@media (hover: hover) and (pointer: fine) { .tok:hover { translate: 0 -6px; } }

/* item dialog (modern-web-guidance: light-dismiss-a-dialog, prevent-page-scroll-under-modal-dialog, animate-to-from-top-layer) */
.idlg { margin: auto; padding: 0; border: 0; background: transparent; max-width: min(440px, calc(100vw - 24px)); width: 100%; overscroll-behavior: contain; opacity: 0;
  transition-property: opacity, transform, display, overlay; transition-duration: .28s; transition-timing-function: var(--ease-out); transition-behavior: allow-discrete; }
.idlg[open] { opacity: 1; @starting-style { opacity: 0; } }
@media (prefers-reduced-motion: no-preference) { .idlg { transform: scale(.94) rotate(-2deg); } .idlg[open] { transform: none; @starting-style { transform: scale(.94) rotate(-2deg); } } }
.idlg::backdrop { background-color: rgb(10 6 4 / 0); overflow: hidden; overscroll-behavior: contain; transition-property: background-color, display, overlay; transition-duration: .28s; transition-behavior: allow-discrete; }
.idlg[open]::backdrop { background-color: rgb(10 6 4 / .62); @starting-style { background-color: rgb(10 6 4 / 0); } }
@media (prefers-reduced-motion: reduce) { .idlg { transition-duration: .1s; } }
`

/** The big red "Now showing" poster used inside the dialog. */
export function BigPoster({ i, b, seat }: { i: Item; b: Bazar; seat?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[6px] p-7 text-[#FFF1D6]" style={{ background: i.available ? '#C4161C' : '#3A3A3A' }}>
      <div aria-hidden className="absolute inset-0" style={halftone} />
      <p className="relative" style={{ fontFamily: POSTER, color: '#FFD21F' }}>{i.available ? 'Now showing' : 'Coming soon'}{seat && ` · Seat ${seat}`}</p>
      <img src={i.img} alt="" className={cn('relative mx-auto my-3 size-44 -rotate-6 drop-shadow-[8px_10px_0_rgba(26,11,7,.8)]', !i.available && 'grayscale')} />
      <p id="idlg-title" className="relative text-4xl leading-none" style={{ fontFamily: POSTER }}>{i.local}</p>
      <p className="relative mt-1 text-lg">{i.name} · {i.bn}</p>
      <p className="relative mt-4 text-[2.6rem] leading-none font-extrabold text-[#FFD21F]" style={{ fontVariationSettings: '"wdth" 75', WebkitTextStroke: '1.5px #1A0B07' }}>{i.available ? i.price : 'Ekhon season na'}</p>
      <p className="relative">{i.per}{i.available && ` · ${i.fresh.label}`}</p>
      {i.available && <button type="button" onClick={() => b.add(i.id)} className="kc-press relative mt-5 h-12 w-full cursor-pointer rounded-[4px] bg-[#FFD21F] px-5 text-lg font-bold text-[#1A0B07] shadow-[3px_3px_0_#1A0B07]">{i.inList ? 'In list, aro din' : '+ Add to list'}</button>}
    </div>
  )
}

export function ItemDialog({ i, b, seat, onClose }: { i: Item | null; b: Bazar; seat?: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (i && !d.open) d.showModal()
    if (!i && d.open) d.close()
  }, [i])
  useEffect(() => {
    const d = ref.current
    if (!d || 'closedBy' in HTMLDialogElement.prototype) return
    const f = (e: MouseEvent) => { // light-dismiss fallback (Safari)
      if (e.target !== d) return
      const r = d.getBoundingClientRect()
      if (r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right) return
      d.close()
    }
    d.addEventListener('click', f)
    return () => d.removeEventListener('click', f)
  }, [])
  return (
    <dialog ref={ref} className="idlg" {...({ closedby: 'any' } as object)} aria-labelledby="idlg-title" onClose={onClose}>
      {i && <BigPoster i={i} b={b} seat={seat} />}
      <form method="dialog" className="mt-3 text-center"><button className="kc-press h-11 cursor-pointer rounded-full bg-[#1A0B07] px-6 font-bold text-[#F4E3C1]">Bondho korun</button></form>
    </dialog>
  )
}

function Ticket({ i, b, seat }: { i: Item; b: Bazar; seat: string }) {
  return (
    <div key={i.id} className="ticket pw-slap" style={{ animationDuration: '380ms' }}>
      <div className="p-5">
        <p className="text-xs font-bold tracking-wide text-[#C4161C]" style={{ fontFamily: POSTER }}>THOKAR চান্স NAI · ADMIT ONE</p>
        <div className="mt-3 flex items-center gap-3">
          <img src={i.img} alt="" className={cn('size-20 -rotate-6', !i.available && 'grayscale')} />
          <div className="min-w-0"><p className="text-3xl leading-none" style={{ fontFamily: POSTER }}>{i.local}</p><p className="mt-1 text-sm opacity-75">{i.name} · {i.bn}</p></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 border-y-2 border-dashed border-[#1A0B07]/25 py-3 text-sm">
          <span className="opacity-60">Seat</span><span className="font-bold">{seat}</span>
          <span className="opacity-60">Dam</span><span className="font-bold">{i.available ? i.price : 'Off season'}</span>
          <span className="opacity-60">Hishab</span><span>{i.per}</span>
          <span className="opacity-60">Update</span><span>{i.available ? i.fresh.label : '—'}</span>
        </div>
        <div className="barcode mt-4" aria-hidden />
        {i.available && <button type="button" onClick={() => b.add(i.id)} className="kc-press mt-4 h-12 w-full cursor-pointer rounded-[4px] bg-[#C4161C] text-lg font-bold text-[#FFD21F] shadow-[3px_3px_0_#1A0B07]">{i.inList ? 'In list, aro din' : '+ Add to list'}</button>}
      </div>
      <div className="ticket-stub" aria-hidden>{seat} · {i.available ? 'NOW' : 'SOON'}</div>
    </div>
  )
}

export function SeatBoard({ b, sel, setSel, open }: { b: Bazar; sel: string; setSel: (id: string) => void; open: (id: string) => void }) {
  const cur = b.board.find((i) => i.id === sel) ?? b.board[0]
  if (!cur) return null
  return (
    <div className="mt-10 grid gap-8 md:grid-cols-[1fr_340px]">
      <div>
        <div className="mx-auto w-[86%]"><div className="screen" /><p className="mt-3 text-center text-sm text-[var(--soft)]">Porda eidike. Seat e tap korle ticket kete dibo.</p></div>
        <div className="mt-8 space-y-6" style={{ transform: 'perspective(1400px) rotateX(5deg)', transformOrigin: '50% 0' }}>
          {group(b.board).map((r) => (
            <div key={r.row} className="grid grid-cols-[44px_1fr] gap-3">
              <div className="pt-4 text-center"><p className="text-2xl leading-none" style={{ fontFamily: POSTER, color: 'var(--hi)' }}>{r.row}</p><p className="text-xs text-[var(--soft)]">{r.name}</p></div>
              <div className="flex flex-wrap gap-x-1.5 gap-y-3">
                {r.items.map((i, k) => (
                  <button key={i.id} type="button" aria-pressed={cur.id === i.id} aria-label={`${i.local}, ${i.available ? i.price : 'off season'}`}
                    onClick={() => { setSel(i.id); if (!matchMedia('(min-width: 768px)').matches) open(i.id) }} onMouseEnter={() => setSel(i.id)} onFocus={() => setSel(i.id)}
                    className={cn('seat', !i.available && 'off')}>
                    <span className="seat-back"><img src={i.img} alt="" className="size-8" /></span>
                    <span className="mt-2 w-full truncate text-center text-[11px] leading-tight font-semibold">{r.row}{k + 1} · {i.local}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:block"><div className="sticky top-6"><Ticket i={cur} b={b} seat={seatNo(b.board, cur.id)} /></div></div>
    </div>
  )
}

const RIMS: [string, string, string][] = [['#C4161C', '#FFF1D6', '#FFD21F'], ['#0B4F55', '#F4E3C1', '#FFD21F'], ['#FFD21F', '#1A0B07', '#C4161C'], ['#5B2A86', '#FFF1D6', '#FFD21F'], ['#1F7A3A', '#FFF1D6', '#FFD21F'], ['#E8641A', '#1A0B07', '#1A0B07']]
export function PosterWall({ b, open }: { b: Bazar; open: (id: string) => void }) {
  return (
    <ul className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-5 gap-y-7" aria-label="Today's items">
      {b.board.map((i, k) => {
        const [bg, fg, rim] = RIMS[k % RIMS.length]
        return (
          <li key={i.id} className="contents">
            <button type="button" onClick={() => open(i.id)} className={cn('mini kc-row', !i.available && 'off')} style={{ background: bg, color: fg, '--rim': rim, animationDelay: `${Math.min(k, 18) * 30}ms` } as React.CSSProperties}>
              <span className="tape" aria-hidden />
              <span aria-hidden className="absolute inset-0" style={halftone} />
              <span className="relative text-[10px] leading-none" style={{ fontFamily: POSTER }}>{i.available ? 'Now showing' : 'Coming soon'}</span>
              <img src={i.img} alt="" className="relative mx-auto my-auto size-[58%] -rotate-6 drop-shadow-[5px_6px_0_rgba(26,11,7,.7)]" />
              <span className="relative text-lg leading-none" style={{ fontFamily: POSTER }}>{i.local}</span>
              <span className="relative -mx-3 -mb-3 mt-2 bg-[#1A0B07] px-3 py-1.5 text-sm font-bold text-[#FFD21F] tabular-nums">{i.available ? i.price : `Asbe ${i.off}`}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function JhuriBoard({ b, open }: { b: Bazar; open: (id: string) => void }) {
  return (
    <div className="mt-12 grid gap-x-8 gap-y-14 lg:grid-cols-2">
      {group(b.board).map((r) => (
        <section key={r.row} className={cn('jhuri rv rv-slap', (r.cat === 'veg' || r.cat === 'fruit') && 'lg:col-span-2', { veg: 'order-1', leaf: 'order-2', spice: 'order-3', fruit: 'order-4' }[r.cat])} aria-label={r.name}>
          <span className="jhuri-tag">{r.name.toUpperCase()} · {r.items.length}</span>
          <ul className="flex flex-wrap justify-center gap-y-3">
            {r.items.map((i) => (
              <li key={i.id} className="contents">
                <button type="button" onClick={() => open(i.id)} className={cn('tok', !i.available && 'off')} aria-label={`${i.local}, ${i.available ? i.price : 'off season'}`}>
                  <img src={i.img} alt="" className="size-14" />
                  <span className="tok-tag">{i.local}<br /><span className="text-[#C4161C]">{i.available ? i.price.replace('Tk ', '৳') : 'Off'}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export { seatNo }
