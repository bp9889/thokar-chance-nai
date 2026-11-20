import { useEffect, useState } from 'react'
import { useBazar } from '@/lib/useBazar'
import { IMG, ITEMS, applyLive, type Live } from '@/lib/data'
import { cn } from '@/lib/utils'
import { BN, POSTER, extrude, halftone, star, KashemChat, ListPage, type ChatSkin, type ListSkin, type Page } from './common'
import { FX_MS, PageFx } from './transitions'
import { ModeSwitch, Sides, THEME_CSS, useMode, type BoardV, type Demo } from './theme'
import type { DayV } from './desh'
import { BOARD_CSS, ItemDialog, JhuriBoard, PosterWall, SeatBoard, seatNo } from './boards'

const chat: ChatSkin = {
  wrap: 'bg-[#F4E3C1] text-[#1A0B07] shadow-[8px_8px_0_var(--deep)]', seller: 'bg-white text-[#1A0B07] ring-2 ring-[#1A0B07]', me: 'bg-[#C4161C] text-[#FFF1D6] ring-2 ring-[#1A0B07]',
  avatar: 'bg-[#FFD21F] text-[#1A0B07] ring-2 ring-[#1A0B07]', accent: 'text-[#FFD21F]', slider: '[--primary:#FFD21F] [--background:#C4161C] [--slider-track-color:rgba(26,11,7,.35)]',
  btn: 'bg-[#FFD21F] text-[#1A0B07] ring-2 ring-[#1A0B07] shadow-[3px_3px_0_#1A0B07]', ghost: 'bg-[#1A0B07] text-[#F4E3C1]', muted: 'opacity-70', inCls: 'in-poster',
}
const list: ListSkin = {
  page: 'text-[var(--ink)]', card: 'bg-[#FFF8EA] text-[#1A0B07] shadow-[8px_8px_0_var(--deep)]', guideCard: 'bg-[#FFD21F] text-[#1A0B07] shadow-[8px_8px_0_var(--deep)]', muted: 'opacity-70', accent: 'text-[#C4161C]',
  btn: 'bg-[#F4E3C1] text-[#1A0B07] shadow-[3px_3px_0_var(--deep)]', rowLine: 'border-b-2 border-dashed border-current/25', enter: 'pw-slap',
  title: (s) => <h2 className="pw-brush" style={extrude('clamp(2.6rem,6vw,4rem)', '#C4161C', '#1A0B07')}>{s}</h2>,
}

/** Two pages (#amar-list) with the dokan-shutter transition. */
function usePage() {
  const read = (): Page => (location.hash === '#amar-list' ? 'list' : 'home')
  const [page, setPage] = useState<Page>(read)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const [outMs, inMs] = FX_MS.shutter
  const go = (p: Page) => {
    if (p === page || phase !== 'idle') return
    const swap = () => { setPage(p); history.replaceState(null, '', p === 'list' ? '#amar-list' : location.pathname); scrollTo({ top: 0 }) }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { swap(); return }
    setPhase('out')
    setTimeout(() => { swap(); setPhase('in'); setTimeout(() => setPhase('idle'), inMs) }, outMs)
  }
  useEffect(() => { const f = () => setPage(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return { page, phase, go }
}

/** Triggered reveals: hidden until a third of the element is on screen, then the animation plays once. */
function useReveal(dep: unknown) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rv:not(.on)'))
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach((e) => e.classList.add('on')); return }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target) } }), { threshold: 0, rootMargin: '0px 0px -15% 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}

function Caution({ className, updated }: { className?: string; updated: string | null }) {
  return (
    <aside className={cn('rv rv-slap relative flex gap-4 rounded-[6px] bg-[#FFD21F] p-5 text-[#1A0B07] shadow-[6px_6px_0_var(--deep)] md:gap-6 md:p-6', className)}
      style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #1A0B07 0 14px, #FFD21F 14px 28px)', backgroundSize: '100% 12px', backgroundRepeat: 'no-repeat', paddingTop: '28px' }}>
      <div className="caution-wobble grid size-16 shrink-0 place-items-center md:size-20" aria-hidden>
        <svg viewBox="0 0 100 90" className="h-full w-full"><path d="M50 4 96 86H4z" fill="#1A0B07" /><path d="M50 18 84 80H16z" fill="#FFD21F" /><path d="M46 36h8l-1.5 26h-5z" fill="#1A0B07" /><circle cx="50" cy="71" r="4.5" fill="#1A0B07" /></svg>
      </div>
      <div>
        <p className="text-2xl leading-none md:text-3xl" style={{ fontFamily: POSTER }}>SAVDHAN! Dam ektu upor-nich hobei</p>
        <p className="mt-2 max-w-[62ch] text-lg leading-snug">Bhai, ekhane ja dekhchen ta Dhaka-r bazar-er <b>usual range</b>. Area, quality ar shokal-bikal bhede dam ektu edik-odik hoy, oita normal. Kintu mama jodi range theke onek beshi chay? Tokhon shundor kore bolen: <b>"Eto na ভাই."</b></p>
        <p className="mt-2 text-sm opacity-80">Alu, peyaj, rosun, ada, kacha morich, begun, shosha, lebu ar khejur-er dam roj auto-update hoy TCB-er Dhaka report theke{updated ? ` (last checked ${updated})` : ''}. Baki gula "approx.", mane rough estimate. "Update pending" mane 7 din er beshi fresh report nai.</p>
      </div>
    </aside>
  )
}

export default function Site({ demo = 3, day = 'tar', board = 'seat', picker }: { demo?: Demo; day?: DayV; board?: BoardV; picker?: React.ReactNode }) {
  const [dlg, setDlg] = useState<string | null>(null)
  const { mode, toggle } = useMode()
  const [ver, setVer] = useState(0)
  const [updated, setUpdated] = useState<string | null>(null)
  useEffect(() => {
    fetch('/prices.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject())).then((j: Live) => { applyLive(j); setUpdated(j.updated); setVer((v) => v + 1) }).catch(() => {})
  }, [])
  const b = useBazar(ver)
  const { page, phase, go } = usePage()
  const [sel, setSel] = useState<string>('potato')
  useReveal(`${page}-${b.cat}-${b.q}-${board}`)
  const cur = b.board.find((i) => i.id === sel) ?? b.board[0]
  const pick = (id: string) => { b.setQ(''); b.setCat('all'); setSel(id); document.getElementById('now-cholche')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }
  const fruitCount = ITEMS.filter((i) => i.cat === 'fruit').length, vegCount = ITEMS.length - fruitCount

  return (
    <div className="tcn relative min-h-[100dvh] overflow-x-clip" data-d={demo} data-m={mode} style={{ fontFamily: BN }}>
      <style>{THEME_CSS + BOARD_CSS}</style>
      <Sides demo={demo} ver={ver} onPick={pick} day={day} />
      {picker}
      <style>{`
        @keyframes pw-slap{0%{opacity:0;scale:1.12;rotate:3deg}60%{opacity:1;scale:.985;rotate:-.6deg}100%{opacity:1;scale:1;rotate:0deg}}
        @keyframes pw-shine{0%{translate:-120% 0;opacity:1}85%{opacity:1}100%{translate:420% 0;opacity:0}}
        @keyframes pw-wipe{from{clip-path:inset(-20% 100% -20% 0)}to{clip-path:inset(-20% -5% -20% 0)}}
        @keyframes pw-spin{from{rotate:-220deg;scale:.4;opacity:0}to{rotate:-14deg;scale:1;opacity:1}}
        @keyframes pw-rays{to{rotate:360deg}}
        @keyframes pw-wiggle{0%,100%{rotate:0deg}25%{rotate:-2deg}75%{rotate:2deg}}
        @keyframes cw{0%,100%{rotate:0deg}20%{rotate:-8deg}40%{rotate:6deg}60%{rotate:-3deg}80%{rotate:0deg}}
        @keyframes rv-row{from{opacity:0;translate:-14px 0}to{opacity:1;translate:0 0}}
        .pw-slap{animation:pw-slap 620ms var(--ease-out) both}
        .pw-shine{animation:pw-shine 1100ms var(--ease-in-out) 700ms both}
        .pw-brush{animation:pw-wipe 700ms var(--ease-in-out) both}
        .pw-star{animation:pw-spin 700ms var(--ease-out) 900ms both}
        .pw-rays{animation:pw-rays 70s linear infinite}
        @media (hover:hover) and (pointer:fine){.pw-wig:hover{animation:pw-wiggle 300ms ease}}
        .pw-idx{transition:translate 200ms var(--ease-out), color 200ms ease}
        .pw-idx[aria-current="true"]{translate:12px 0;color:var(--hi)}
        /* Triggered reveals: fully hidden until scrolled into view, then play once */
        .rv-brush > *{clip-path:inset(-20% 100% -20% 0)}
        .rv-brush.on > *{animation:pw-wipe 750ms var(--ease-in-out) both}
        .rv-slap{opacity:0}
        .rv-slap.on{animation:pw-slap 620ms var(--ease-out) both}
        .rv-slap.on .caution-wobble{animation:cw 900ms ease 500ms both}
        .rv-rows > li{opacity:0}
        .rv-rows.on > li{animation:rv-row 360ms var(--ease-out) both}
        @media (prefers-reduced-motion:reduce){.pw-slap,.pw-shine,.pw-brush,.pw-star,.pw-rays{animation:kc-fade 200ms ease both}.rv-brush > *,.rv-slap,.rv-rows > li{clip-path:none;opacity:1;animation:none!important}.pw-idx{transition:color 200ms ease}.pw-idx[aria-current="true"]{translate:0 0}}
      `}</style>

      <PageFx fx="shutter" phase={phase} />

      <header className="relative z-10 mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 pt-5 md:px-6">
        <button type="button" onClick={() => go('home')} className="cursor-pointer text-xl md:text-2xl" style={{ fontFamily: POSTER, color: 'var(--brand)', transition: 'color 400ms ease' }}>THOKAR <span style={{ fontFamily: BN }}>চান্স</span> NAI</button>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-2 text-lg">
          {page === 'home' && <><a href="#dor-dam" className="rounded-full px-4 py-2 hover:bg-[var(--hover)]">Dor-দাম</a><a href="#now-cholche" className="rounded-full px-4 py-2 hover:bg-[var(--hover)]">Now চলছে</a></>}
          <ModeSwitch demo={demo} mode={mode} toggle={toggle} />
          <button type="button" onClick={() => go(page === 'home' ? 'list' : 'home')} className="kc-press pw-wig flex h-11 cursor-pointer items-center gap-2 rounded-[4px] bg-[#FFD21F] px-5 font-bold text-[#1A0B07] shadow-[3px_3px_0_#1A0B07]">
            {page === 'home' ? <>Amar list <span key={b.list.rows.length} className="kc-stamp grid size-7 place-items-center rounded-full bg-[#C4161C] text-sm text-[#FFD21F]">{b.list.rows.length}</span></> : 'Back to the wall'}
          </button>
        </nav>
      </header>

      {page === 'home' ? (
        <main className="relative z-[1]">
          {/* HERO POSTER */}
          <section className="mx-auto max-w-[1180px] px-3 pt-6 pb-20 md:px-6">
            <div className="pw-slap relative overflow-hidden rounded-[6px] bg-[#F4E3C1] text-[#1A0B07] shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)]">
              <div aria-hidden className="pw-rays absolute left-1/2 top-[42%] size-[220vmax] -translate-x-1/2 -translate-y-1/2" style={{ background: 'repeating-conic-gradient(#FFD21F 0deg 7deg, #FF9F1A 7deg 14deg)' }} />
              <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 45% 45%, transparent 55%, rgba(196,22,28,.55) 100%)' }} />
              <div aria-hidden className="absolute inset-0" style={halftone} />
              <div aria-hidden className="pointer-events-none absolute inset-0 z-30" style={{ boxShadow: 'inset 0 0 0 10px #C4161C, inset 0 0 0 14px #1A0B07, inset 0 0 0 20px #FFD21F, inset 0 0 0 23px #1A0B07' }} />
              <div className="relative grid gap-6 px-8 pt-9 pb-10 md:grid-cols-[1.15fr_1fr] md:px-14 md:pt-12 md:pb-14">
                <div className="flex flex-col">
                  <p style={{ fontFamily: POSTER }} className="text-sm text-[#C4161C] md:text-base">Dhaka-r sobji cinema presents</p>
                  <h1 className="mt-3" style={extrude('clamp(4rem,12.5vw,9.4rem)')} aria-label="Thokar chance nai">
                    <span className="pw-brush block" style={{ fontFamily: POSTER, fontSize: '0.62em', WebkitTextStroke: '0.03em #1A0B07', animationDelay: '350ms' }}>THOKAR</span>
                    <span className="pw-brush block" style={{ animationDelay: '600ms' }}>চান্স <span style={{ fontFamily: POSTER, fontSize: '0.62em', WebkitTextStroke: '0.03em #1A0B07' }}>NAI</span></span>
                  </h1>
                  <p className="mt-5 text-[clamp(1.4rem,3.2vw,2.3rem)] leading-tight font-bold" style={{ fontVariationSettings: '"wdth" 80' }}>Ajker bazar-er ashol দাম.</p>
                  <p className="mt-1 max-w-[36ch] text-lg">Ek kilo alu, hajar ta question. {vegCount} rokom sobji, shak, moshla ar {fruitCount} rokom fol, dam shoho.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="#dor-dam" className="kc-press pw-wig rounded-[4px] bg-[#C4161C] px-6 py-3 text-xl font-bold text-[#FFD21F] shadow-[4px_4px_0_#1A0B07]">Bargain with Kashem bhai</a>
                    <a href="#now-cholche" className="kc-press pw-wig rounded-[4px] bg-[#1A0B07] px-6 py-3 text-xl font-bold text-[#F4E3C1] shadow-[4px_4px_0_#C4161C]">Now চলছে</a>
                  </div>
                </div>
                <div className="relative grid min-h-[340px] place-items-center md:min-h-[460px]">
                  <img src={IMG.potato} alt="A heroic potato" className="pw-slap relative z-10 w-[74%] max-w-[400px] -rotate-12 drop-shadow-[10px_14px_0_rgba(26,11,7,.85)]" style={{ animationDelay: '450ms' }} />
                  <img src={IMG.malta} alt="" className="pw-slap absolute bottom-4 left-0 z-10 w-[28%] rotate-12 drop-shadow-[6px_8px_0_rgba(26,11,7,.85)]" style={{ animationDelay: '650ms' }} />
                  <img src={IMG.chili} alt="" className="pw-slap absolute top-2 right-2 z-10 w-[30%] -rotate-[30deg] drop-shadow-[6px_8px_0_rgba(26,11,7,.85)]" style={{ animationDelay: '750ms' }} />
                  <img src={IMG.onion} alt="" className="pw-slap absolute right-0 bottom-8 z-10 w-[24%] rotate-6 drop-shadow-[6px_8px_0_rgba(26,11,7,.85)]" style={{ animationDelay: '820ms' }} />
                  <div className="pw-star absolute top-0 left-2 z-20 grid size-32 place-items-center bg-[#C4161C] text-center md:size-40" style={{ clipPath: star }}>
                    <span className="px-4 text-xl leading-none text-[#FFD21F] md:text-2xl" style={{ fontFamily: POSTER }}>SUPER<br />HIT!</span>
                  </div>
                </div>
              </div>
              <div className="relative border-t-4 border-[#1A0B07] bg-[#1A0B07] px-8 py-5 pb-8 text-center text-[#F4E3C1] md:px-14">
                <p className="text-lg md:text-2xl" style={{ fontVariationSettings: '"wdth" 75' }}>Starring <b className="text-[#FFD21F]">ALU</b> · <b className="text-[#FFD21F]">PEYAJ</b> · <b className="text-[#FFD21F]">KACHA MORICH</b> · <b className="text-[#FFD21F]">MALTA</b> · and introducing <b className="text-[#FFD21F]">লাল শাক</b></p>
                <p className="mt-1 text-sm opacity-80">Music by the sobjiwala's shout · Now showing at every bazar in Dhaka</p>
              </div>
              <div aria-hidden className="pw-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)' }} />
            </div>
          </section>

          {/* DOR-DAM */}
          <section id="dor-dam" className="mx-auto max-w-[980px] scroll-mt-6 px-4 pb-24 md:px-6">
            <div className="rv rv-brush"><h2 style={extrude('clamp(2.8rem,7vw,5rem)', '#F4E3C1', '#C4161C')}>Dor-দাম <span style={{ fontFamily: POSTER, fontSize: '.5em', WebkitTextStroke: '0.03em #1A0B07' }}>with Kashem bhai</span></h2></div>
            <p className="mt-3 mb-8 max-w-[54ch] text-lg text-[var(--soft)]">A comic-strip bargain. He names the item, you say your price, he tells you if you got it right. Kashem bhai is a made-up character, kintu tar dor-dam ekdom real.</p>
            <div className="rv rv-slap"><KashemChat b={b} skin={chat} id="tcn-guess" /></div>
          </section>

          {/* NOW CHOLCHE */}
          <section id="now-cholche" className="mx-auto max-w-[1180px] scroll-mt-6 px-4 pb-32 md:px-6">
            <div className="rv rv-brush"><h2 style={extrude('clamp(3rem,8vw,5.5rem)', '#FFD21F', '#C4161C')}><span style={{ fontFamily: POSTER, fontSize: '.7em' }}>NOW </span>চলছে</h2></div>
            <p className="mt-2 text-lg text-[var(--soft)]">{ITEMS.length} items: sobji, shak, moshla ar fol. Naam e hover korun ba tap korun, poster ta dekhben.</p>
            <Caution className="mt-6" updated={updated} />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <label className="flex h-12 min-w-0 flex-1 basis-60 items-center rounded-[4px] bg-[#FFF8EA] px-4 text-[#1A0B07] shadow-[3px_3px_0_var(--deep)] ring-1 ring-[#1A0B07]/20">
                <span className="sr-only">Search fruits and vegetables</span>
                <input type="search" value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Khujun: alu, malta, palong…" className="w-full bg-transparent text-lg outline-none placeholder:text-[#6B5A48]" />
              </label>
              <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
                {b.cats.map((c) => <button key={c.id} type="button" aria-pressed={b.cat === c.id} onClick={() => b.setCat(c.id)} className={cn('kc-press h-11 cursor-pointer rounded-[4px] px-4 text-lg font-bold transition-colors duration-200', b.cat === c.id ? 'bg-[#FFD21F] text-[#1A0B07]' : 'bg-[var(--chip)] text-[var(--chip-ink)]')}>{c.label}</button>)}
              </div>
            </div>
            {b.board.length === 0 && <p className="mt-8 text-xl">"{b.q}" naam e kono show nai. Try alu ba malta.</p>}
            {board === 'seat' && <SeatBoard b={b} sel={sel} setSel={setSel} open={setDlg} />}
            {board === 'poster' && <PosterWall b={b} open={setDlg} />}
            {board === 'jhuri' && <JhuriBoard b={b} open={setDlg} />}
            <ItemDialog i={b.board.find((i) => i.id === dlg) ?? null} b={b} seat={board === 'seat' && dlg ? seatNo(b.board, dlg) : undefined} onClose={() => setDlg(null)} />
            {board === 'list' && cur && (
              <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.05fr]">
                <ul key={`${b.cat}-${b.q}`} className="rv rv-rows" aria-label="Today's items">
                  {b.board.map((i, k) => (
                    <li key={i.id} className="border-b border-[var(--line)]" style={{ animationDelay: `${Math.min(k, 14) * 35}ms` }}>
                      <button type="button" aria-current={cur.id === i.id} onMouseEnter={() => setSel(i.id)} onFocus={() => setSel(i.id)} onClick={() => setSel(i.id)}
                        className={cn('pw-idx flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left', !i.available && 'opacity-55')}>
                        <span className="flex items-center gap-3"><img src={i.img} alt="" className="size-8" /><span className="text-[clamp(1.25rem,2.6vw,1.7rem)] leading-none" style={{ fontFamily: POSTER }}>{i.local}</span></span>
                        <span className="flex flex-col items-end">
                          <span className={cn('text-lg whitespace-nowrap tabular-nums', i.fresh.stale ? 'opacity-50 line-through decoration-1' : 'opacity-85')}>{i.price}</span>
                          {i.available && <span className={cn('text-xs whitespace-nowrap', i.fresh.stale ? 'rounded-[3px] bg-[#FFD21F] px-1.5 font-bold text-[#1A0B07]' : 'opacity-60')}>{i.fresh.label}</span>}
                        </span>
                      </button>
                      {cur.id === i.id && (
                        <div className="pw-slap flex items-center gap-4 pb-4 md:hidden" style={{ animationDuration: '320ms' }}>
                          <img src={i.img} alt="" className="size-16 -rotate-6" />
                          <div className="min-w-0 flex-1"><p>{i.name} · {i.bn}</p><p className="text-sm opacity-75">{i.per}{i.available && ` · ${i.fresh.label}`}</p></div>
                          {i.available && <button type="button" onClick={() => b.add(i.id)} className="kc-press h-11 shrink-0 cursor-pointer rounded-[4px] bg-[#FFD21F] px-4 font-bold text-[#1A0B07]">{i.inList ? 'Aro din' : '+ Add'}</button>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="hidden md:block">
                  <div className="md:sticky md:top-6">
                    <div key={cur.id} className="pw-slap relative overflow-hidden rounded-[6px] p-8 text-[#FFF1D6] shadow-[10px_10px_0_var(--deep)]" style={{ animationDuration: '420ms', background: cur.available ? '#C4161C' : '#3A3A3A' }}>
                      <div aria-hidden className="absolute inset-0" style={halftone} />
                      <p className="relative" style={{ fontFamily: POSTER, color: '#FFD21F' }}>{cur.available ? 'Now showing' : 'Coming soon'}</p>
                      <img src={cur.img} alt="" className={cn('relative mx-auto my-4 size-56 -rotate-6 drop-shadow-[8px_10px_0_rgba(26,11,7,.8)]', !cur.available && 'grayscale')} />
                      <p className="relative text-5xl leading-none" style={{ fontFamily: POSTER }}>{cur.local}</p>
                      <p className="relative mt-1 text-xl">{cur.name} · {cur.bn}</p>
                      <div className="relative mt-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-[3rem] leading-none font-extrabold text-[#FFD21F]" style={{ fontVariationSettings: '"wdth" 75', WebkitTextStroke: '1.5px #1A0B07' }}>{cur.available ? cur.price : 'Ekhon season na'}</p>
                          <p>{cur.per}{cur.available && <> · <span className={cn(cur.fresh.stale && 'rounded-[3px] bg-[#FFD21F] px-1.5 font-bold text-[#1A0B07]')}>{cur.fresh.label}</span></>}</p>
                        </div>
                        {cur.available && <button type="button" onClick={() => b.add(cur.id)} className="kc-press pw-wig h-12 cursor-pointer rounded-[4px] bg-[#FFD21F] px-5 text-lg font-bold text-[#1A0B07] shadow-[3px_3px_0_#1A0B07]">{cur.inList ? 'In list, aro din' : '+ Add to list'}</button>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      ) : (
        <div className="relative z-[1]"><ListPage b={b} skin={list} goHome={() => go('home')} /></div>
      )}

      <footer className="relative z-[1] mx-auto max-w-[1180px] px-4 pb-28 md:px-6">
        <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[70ch] text-sm text-[var(--soft)]">Dorshokder jonno special ঘোষণা: the main bazar items update automatically every day from TCB's Dhaka market report; the rest are marked approx. They are averages, so your shop may be a little higher or lower. Every price shows when it was last updated.</p>
          <p className="text-xl" style={{ fontFamily: POSTER, color: 'var(--brand)' }}>THOKAR <span style={{ fontFamily: BN }}>চান্স</span> NAI</p>
        </div>
      </footer>
    </div>
  )
}
