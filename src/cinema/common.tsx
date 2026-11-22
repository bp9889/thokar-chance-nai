import { useEffect, useRef, useState } from 'react'
import type { Bazar } from '@/lib/useBazar'
import { GuessRange } from '@/components/shared'
import { cn } from '@/lib/utils'

export const BN = "'Anek Bangla Variable', sans-serif"
export const POSTER = "'Bungee', sans-serif"
export const NEON = "'Tilt Neon Variable', sans-serif"
export const halftone: React.CSSProperties = { backgroundImage: 'radial-gradient(rgba(26,11,7,.16) 1.2px, transparent 1.6px)', backgroundSize: '7px 7px' }
export const star = 'polygon(50% 0%,61% 14%,79% 9%,79% 28%,96% 35%,85% 50%,96% 65%,79% 72%,79% 91%,61% 86%,50% 100%,39% 86%,21% 91%,21% 72%,4% 65%,15% 50%,4% 35%,21% 28%,21% 9%,39% 14%)'
/** A solid outline made of text-shadows. -webkit-text-stroke draws the inner overlap lines of these fonts, so it is not used. */
export const outline = (w: string, color = '#1A0B07', steps = 16) =>
  Array.from({ length: steps }, (_, k) => { const a = (k / steps) * Math.PI * 2; return `calc(${w} * ${Math.cos(a).toFixed(3)}) calc(${w} * ${Math.sin(a).toFixed(3)}) 0 ${color}` }).join(',')
export const extrude = (size: string, fill = '#FFD21F', shadow = '#C4161C'): React.CSSProperties => ({
  fontFamily: BN, fontWeight: 800, fontVariationSettings: '"wdth" 75', fontSize: size, lineHeight: 0.9, color: fill,
  textShadow: outline('0.035em') + ',' + Array.from({ length: 7 }, (_, k) => `calc(0.035em + ${k + 1}px) calc(0.035em + ${k + 1}px) 0 ${shadow}`).join(',') + ', calc(0.035em + 9px) calc(0.035em + 10px) 0 #1A0B07',
})

export type Variant = 'projector' | 'poster' | 'neon'
export type Page = 'home' | 'list'

/** Two pages per demo with an out/in transition the variant draws. */
export function usePages(n: number, outMs = 650, inMs = 650) {
  const read = (): Page => (location.hash === `#d${n}-list` ? 'list' : 'home')
  const [page, setPage] = useState<Page>(read)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const go = (p: Page) => {
    if (p === page || phase !== 'idle') return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const swap = () => { setPage(p); history.replaceState(null, '', p === 'list' ? `#d${n}-list` : `#d${n}`); scrollTo({ top: 0 }) }
    if (reduce) { swap(); return }
    setPhase('out')
    setTimeout(() => { swap(); setPhase('in'); setTimeout(() => setPhase('idle'), inMs) }, outMs)
  }
  useEffect(() => { const f = () => setPage(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return { page, phase, go }
}

/** Counts a number up when it changes (occasional, so a short tween is fine). */
export function useCountUp(target: number, ms = 600) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return }
    const start = performance.now(), a = from.current
    let raf = 0
    const tick = (t: number) => { const k = Math.min(1, (t - start) / ms); const e = 1 - Math.pow(1 - k, 3); setV(Math.round(a + (target - a) * e)); if (k < 1) raf = requestAnimationFrame(tick); else from.current = target }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return v
}

export const ASK: Record<string, string> = { potato: 'Adha kilo alu', cauliflower: 'Ekta fulkopi', chili: '250 gram kacha morich', tomato: 'Adha kilo tomato', lalshak: 'Ek aati lal shak' }
export function replyLine(g: Bazar['game']) {
  if (g.direction === 'in') return `Thik dam bolsen! Apni to pakka bazari. Ajke ${g.real}.`
  if (g.direction === 'over') return g.guess - g.hi > 40 ? `Arre bhai, eto dite hobe na! Ajke matro ${g.real}.` : `Ektu beshi bollen. Usual price ${g.real}.`
  return g.lo - g.guess > 20 ? `Eto kom e? Bhai, amar o to songshar ache! Dam ${g.real}.` : `Ektu kom hoye gelo. Usual price ${g.real}.`
}
export const stampOf = (g: Bazar['game']) => (g.acc >= 100 ? { t: 'HOUSEFULL!', c: '#1F7A3A' } : g.acc >= 70 ? { t: 'ALMOST HIT', c: '#B8520F' } : { t: 'FLOP!', c: '#C4161C' })

export type ChatSkin = {
  wrap: string; seller: string; me: string; avatar: string; accent: string; slider: string; btn: string; ghost: string; muted: string; inCls: string; font?: string
}

/** Dor-দাম with Kashem bhai: a bargaining chat with typing indicators. */
export function KashemChat({ b, skin, id }: { b: Bazar; skin: ChatSkin; id: string }) {
  const g = b.game
  const [typingAsk, setTypingAsk] = useState(true)
  const [typingReply, setTypingReply] = useState(false)
  useEffect(() => { setTypingAsk(true); const t = setTimeout(() => setTypingAsk(false), 750); return () => clearTimeout(t) }, [g.roundNo, g.done])
  useEffect(() => { if (!g.revealed) return; setTypingReply(true); const t = setTimeout(() => setTypingReply(false), 650); return () => clearTimeout(t) }, [g.revealed])
  const stamp = stampOf(g)
  const Avatar = () => <div className={cn('grid size-12 shrink-0 place-items-center rounded-full text-xl', skin.avatar)} aria-hidden style={{ fontFamily: BN, fontWeight: 800 }}>কা</div>
  const Dots = () => (
    <div className={cn('flex items-end gap-3', skin.inCls)} aria-label="Kashem bhai is typing">
      <Avatar />
      <div className={cn('flex gap-1.5 rounded-[22px] rounded-bl-[6px] px-5 py-4', skin.seller)}>
        {[0, 1, 2].map((k) => <span key={k} className="kc-dot size-2 rounded-full bg-current opacity-60" style={{ animationDelay: `${k * 140}ms` }} />)}
      </div>
    </div>
  )

  return (
    <div className={cn('rounded-[28px] p-5 md:p-8', skin.wrap)} aria-live="polite" style={{ fontFamily: skin.font }}>
      {!g.done ? (
        <>
          {typingAsk ? <Dots /> : (
            <div key={`ask-${g.roundNo}`} className={cn('flex items-end gap-3', skin.inCls)}>
              <Avatar />
              <div className={cn('max-w-[85%] rounded-[22px] rounded-bl-[6px] px-5 py-4', skin.seller)}>
                <p className={cn('text-sm', skin.muted)}>Kashem bhai, round {g.roundNo} of {g.total}</p>
                <p className="mt-1 text-2xl leading-snug font-semibold">{ASK[g.id]}? Bolen bhai, koto diben?</p>
                <p className={cn('text-sm', skin.muted)}>{g.ask}, how much would you pay?</p>
              </div>
              <img src={g.img} alt="" className="kc-bob hidden size-20 sm:block" />
            </div>
          )}

          {!typingAsk && (
            <div key={`me-${g.roundNo}`} className={cn('mt-6 ml-auto max-w-[540px] rounded-[22px] rounded-br-[6px] px-5 py-5', skin.me, skin.inCls)} style={{ animationDelay: '120ms' }}>
              <div className="flex items-end justify-between">
                <label htmlFor={id} className={skin.muted}>Ami dibo…</label>
                <output htmlFor={id} className={cn('text-5xl leading-none font-extrabold tabular-nums', skin.accent)} style={{ fontFamily: BN, fontVariationSettings: '"wdth" 75' }}>Tk {g.guess}</output>
              </div>
              <GuessRange id={id} value={g.guess} onChange={g.setGuess} className={cn('mt-3', skin.slider)} />
              {!g.revealed && <button type="button" onClick={g.reveal} className={cn('kc-press mt-4 min-h-12 w-full cursor-pointer rounded-full px-4 py-2.5 text-lg leading-tight font-bold', skin.btn)}>Bolei Felun ভাই, Judge Korbo NAAAAA</button>}
            </div>
          )}

          {g.revealed && (typingReply ? <div className="mt-6"><Dots /></div> : (
            <div key={`re-${g.roundNo}`} className={cn('relative mt-6 flex items-end gap-3', skin.inCls)}>
              <Avatar />
              <div className={cn('relative max-w-[85%] rounded-[22px] rounded-bl-[6px] px-5 py-4', skin.seller)}>
                <p className="pr-16 text-2xl leading-snug font-semibold">{replyLine(g)}</p>
                <p className={cn('text-sm', skin.muted)}>{g.verdict}</p>
                <span className="kc-stamp absolute -top-5 -right-6 rotate-[-10deg] rounded-[6px] border-[3px] bg-[#FFF6E0] px-2.5 py-1 text-sm" style={{ borderColor: stamp.c, color: stamp.c, fontFamily: POSTER }}>{stamp.t}</span>
              </div>
            </div>
          ))}
          {g.revealed && !typingReply && <button type="button" onClick={g.next} className={cn('kc-press mt-6 ml-auto block h-12 cursor-pointer rounded-full px-6 text-lg', skin.ghost)}>{g.roundNo === g.total ? 'Score dekhi' : 'Porer item'}</button>}
        </>
      ) : (
        <div className={cn('text-center', skin.inCls)}>
          <p className={skin.muted}>Kashem bhai's verdict</p>
          <p className={cn('kc-stamp text-[clamp(5rem,15vw,9rem)] leading-none font-extrabold', skin.accent)} style={{ fontFamily: BN, fontVariationSettings: '"wdth" 75' }}>{g.avg}%</p>
          <p className="mt-2 text-2xl font-semibold">{g.avg >= 80 ? 'Apni to pakka bazari!' : g.avg >= 50 ? 'Kharap na, aro practice lagbe.' : 'Bhai, apnake to thokabe!'}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={g.copy} className={cn('kc-press h-12 cursor-pointer rounded-full px-6 text-lg font-bold', skin.btn)}>{g.copied ? 'Score copied' : 'Copy my score'}</button>
            <button type="button" onClick={g.restart} className={cn('kc-press h-12 cursor-pointer rounded-full px-6 text-lg', skin.ghost)}>Abar khelbo</button>
          </div>
        </div>
      )}
    </div>
  )
}

export type ListSkin = { page: string; card: string; guideCard: string; title: (s: string) => React.ReactNode; muted: string; accent: string; btn: string; rowLine: string; enter: string }

/** Empties the list. Asks once more in place (no pop-up), and goes back to normal after 3 seconds. */
function ClearList({ clear }: { clear: () => void }) {
  const [sure, setSure] = useState(false)
  useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 3000); return () => clearTimeout(t) }, [sure])
  return (
    <button type="button" onClick={() => { if (sure) { clear(); setSure(false) } else setSure(true) }}
      className={cn('kc-press h-11 shrink-0 cursor-pointer rounded-full px-4 font-bold transition-colors duration-200', sure ? 'bg-[#C4161C] text-[#FFD21F]' : 'bg-current/10')}>
      {sure ? 'Sure? Abar tap korun' : 'List khali korun'}
    </button>
  )
}

/** Page 2: Birot (half-a-kilo guide) + Amar bazar list. */
export function ListPage({ b, skin, goHome, share, extra }: { b: Bazar; skin: ListSkin; goHome: () => void; share?: React.ReactNode; extra?: React.ReactNode }) {
  const lo = useCountUp(b.list.lo), hi = useCountUp(b.list.hi)
  const carry = useCountUp(Number(b.list.carry.replace(/\D/g, '')))
  return (
    <div className={cn('mx-auto max-w-[1180px] px-4 pt-6 pb-36 md:px-6', skin.page)}>
      <button type="button" onClick={goHome} className={cn('kc-press h-11 cursor-pointer rounded-full px-5 text-lg', skin.btn)}>← Back to the show</button>
      <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_1fr]">
        <section className={cn('rounded-[10px] p-6 md:p-8', skin.card, skin.enter)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            {skin.title('Amar bazar লিস্ট')}
            {!b.list.empty && <ClearList clear={() => b.setAll({})} />}
          </div>
          <p className={cn('mt-2', skin.muted)}>Printed like a ticket stub. We add up the usual prices so you know the cash to carry.</p>
          <ul className="mt-4">
            {b.list.rows.map((r, k) => (
              <li key={r.id} className={cn('kc-row flex flex-wrap items-center gap-3 py-3', skin.rowLine)} style={{ animationDelay: `${120 + k * 60}ms` }}>
                <img src={r.img} alt="" className="size-10" />
                <span className="min-w-0 flex-1 text-xl font-bold">{r.local} <span className={cn('text-sm font-normal', skin.muted)}>{r.qty}</span></span>
                <button type="button" onClick={() => b.dec(r.id)} aria-label={`Less ${r.name}`} className="kc-press size-11 cursor-pointer rounded-full bg-current/10 text-xl"><span>−</span></button>
                <button type="button" onClick={() => b.add(r.id)} aria-label={`More ${r.name}`} className="kc-press size-11 cursor-pointer rounded-full bg-current/10 text-xl"><span>+</span></button>
                <span className="w-24 text-right font-semibold tabular-nums">{r.line}</span>
                <button type="button" onClick={() => b.drop(r.id)} aria-label={`Remove ${r.name}`} className="kc-press size-11 cursor-pointer rounded-full text-xl opacity-60">×</button>
              </li>
            ))}
            {b.list.empty && <li className="py-6 text-xl">List khali. Now চলছে theke "+ List e rakhun" tap korun.</li>}
          </ul>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t-4 border-double border-current/40 pt-4">
            <div><p className={skin.muted}>Expected total</p><p className="text-4xl font-extrabold tabular-nums" style={{ fontFamily: BN, fontVariationSettings: '"wdth" 75' }}>Tk {lo === hi ? lo : `${lo}–${hi}`}</p></div>
            <div className="text-right"><p className={skin.muted}>Shathe rakhun (carry)</p><p className={cn('text-5xl font-extrabold tabular-nums', skin.accent)} style={{ fontFamily: BN, fontVariationSettings: '"wdth" 75' }}>Tk {carry}</p></div>
          </div>
          <p className={cn('mt-2 text-sm', skin.muted)}>A little above the range, in case your shop charges more.</p>
          {share}
        </section>
        <section className={cn('rounded-[10px] p-6 md:p-8', skin.guideCard, skin.enter)} style={{ animationDelay: '120ms' }}>
          {skin.title('বিরতি')}
          <p className="mt-2 text-lg font-bold">Interval. Adha kilo mane koto ta?</p>
          <ul className="mt-6 space-y-7">
            {b.guide.map((x, gi) => (
              <li key={x.id}>
                <div className="flex h-12 items-end border-b-4 border-current/70 pb-0.5" aria-hidden>
                  {Array.from({ length: x.count }, (_, k) => <img key={k} src={x.img} alt="" className="kc-drop -mr-2.5 size-11" style={{ animationDelay: `${300 + gi * 200 + k * 70}ms` }} />)}
                </div>
                <p className="mt-2 text-lg leading-tight font-bold">{x.title}</p>
                <p className={cn('text-sm', skin.muted)}>{x.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {extra && <div className="mt-8">{extra}</div>}
    </div>
  )
}
