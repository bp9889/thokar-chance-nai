/* THOKAR চান্স NAI, minimal edition: the same features as the cinema site, without the poster
   effects. Five looks (themes.ts) share this one component; layout changes per look are small. */
import { useEffect, useMemo, useState } from 'react'
import { useBazar, type Bazar } from '@/lib/useBazar'
import { useLive } from '@/lib/live'
import { BY, IMG, ITEMS, UNIT, change, qtyText, tk, type Item } from '@/lib/data'
import { cn } from '@/lib/utils'
import { GuessRange } from '@/components/shared'
import { useMode } from '@/cinema/theme'
import { ASK, replyLine, stampOf } from '@/cinema/common'
import { APK, PLAN, QUICK, SEASONS, SITE, YEAR_ROUND, judge, listText, seasonNow, useInstall } from '@/cinema/features'
import { MIN_CSS, type ThemeId } from './themes'

type Row = Bazar['board'][number]
const CAT_NAME: Record<Item['cat'], string> = { veg: 'Sobji', leaf: 'Shak', fruit: 'Fol', spice: 'Moshla' }
const fmtDate = (d?: string | null) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '')

function useView() {
  const read = () => (location.hash === '#amar-list' ? 'list' : 'home')
  const [view, setView] = useState<'home' | 'list'>(read)
  useEffect(() => { const f = () => setView(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const go = (v: 'home' | 'list') => { history.pushState(null, '', v === 'list' ? '#amar-list' : location.pathname); setView(v); scrollTo({ top: 0 }) }
  return { view, go }
}

function TrendText({ i }: { i: Item }) {
  const w = change(i, 'week')
  if (!w) return null
  if (w.dir === 'same') return <span className="muted">same as last week</span>
  return <span className={w.dir === 'up' ? 'up' : 'down'}>{w.dir === 'up' ? '↑' : '↓'} Tk {Math.abs(w.diff)} vs last week</span>
}

function Stepper({ b, id }: { b: Bazar; id: string }) {
  const n = b.raw[id] || 0
  if (!n) return <button type="button" className="btn" onClick={() => b.add(id)}>+ List e rakhun</button>
  return (
    <div className="flex items-center gap-2">
      <span className="acc text-sm font-semibold">✓ List e ache</span>
      <div className="flex items-center rounded-[var(--rb)] border line">
        <button type="button" aria-label={`Less ${BY[id].local}`} onClick={() => b.dec(id)} className="grid size-11 cursor-pointer place-items-center text-lg">−</button>
        <span className="num min-w-[4.2rem] text-center font-semibold" aria-live="polite">{qtyText(BY[id], n)}</span>
        <button type="button" aria-label={`More ${BY[id].local}`} onClick={() => b.add(id)} className="grid size-11 cursor-pointer place-items-center text-lg">+</button>
      </div>
    </div>
  )
}

function Detail({ i, b }: { i: Row; b: Bazar }) {
  const m = change(i, 'month')
  return (
    <div className="fade flex flex-wrap items-end justify-between gap-4 pb-4">
      <div className="text-sm leading-relaxed">
        <p>{i.name} · {i.bn}</p>
        <p className="muted">{i.per}{i.available && ` · ${i.fresh.label}`}</p>
        {i.available && <p><TrendText i={i} />{m && m.dir !== 'same' && <span className="muted"> · last month {tk(i.month![0], i.month![1])}</span>}</p>}
      </div>
      {i.available && <Stepper b={b} id={i.id} />}
    </div>
  )
}

/* ---------- the price list, drawn per look ---------- */
function PriceList({ b, t, open, setOpen }: { b: Bazar; t: ThemeId; open: string; setOpen: (id: string) => void }) {
  const toggle = (id: string) => setOpen(open === id ? '' : id)
  if (t === 'lau') return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3" aria-label="Today's prices">
      {b.board.map((i) => (
        <li key={i.id} className={cn(open === i.id && 'col-span-full')}>
          <div className={cn('card h-full p-4', !i.available && 'opacity-60')}>
            <button type="button" aria-expanded={open === i.id} onClick={() => toggle(i.id)} className="flex w-full cursor-pointer items-center gap-3 text-left">
              <img src={i.img} alt="" className="size-10" />
              <span className="min-w-0 flex-1"><span className="d block truncate text-lg leading-tight">{i.local}</span><span className="num block">{i.price}</span><span className="muted block text-xs">{i.available ? i.fresh.label : i.per}</span></span>
            </button>
            {open === i.id && <div className="mt-3 border-t line pt-3"><Detail i={i} b={b} /></div>}
          </div>
        </li>
      ))}
    </ul>
  )
  if (t === 'memo') return (
    <div className="sheet rounded-[var(--r)] p-5 md:p-8">
      <div className="mb-2 flex items-baseline justify-between border-b-2 line pb-2 text-sm font-semibold"><span>Ponno</span><span>Dam</span></div>
      <ul aria-label="Today's prices">
        {b.board.map((i) => (
          <li key={i.id} className="memo-row">
            <button type="button" aria-expanded={open === i.id} onClick={() => toggle(i.id)} className={cn('row flex w-full cursor-pointer items-baseline gap-3 py-2.5 text-left', !i.available && 'opacity-55')}>
              <span className="flex-1">{i.local} <span className="muted text-sm">{i.per}</span></span>
              <span className="num text-lg">{i.price}</span>
            </button>
            {open === i.id && <Detail i={i} b={b} />}
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <ul aria-label="Today's prices" className={cn(t === 'tag' && 'border-t line')}>
      {b.board.map((i) => (
        <li key={i.id} className={cn(t !== 'khata' && 'border-b line')}>
          <button type="button" aria-expanded={open === i.id} onClick={() => toggle(i.id)}
            className={cn('row flex w-full cursor-pointer items-baseline gap-3 px-1 text-left', t === 'khata' ? 'h-9 items-end' : 'py-3.5', !i.available && 'opacity-55')}>
            {t !== 'khata' && <img src={i.img} alt="" className="size-7 self-center" />}
            <span className={cn('d', t === 'tag' ? 'text-xl' : 'text-lg')}>{i.local}</span>
            {t === 'khata' ? <span className="leader" aria-hidden /> : <span className="flex-1" />}
            <span className="flex flex-col items-end">
              <span className={cn('num', t === 'tag' ? 'text-xl font-semibold' : 'text-lg', i.fresh.stale && 'line-through opacity-60')}>{i.price}</span>
              {t !== 'khata' && <span className="muted text-xs">{i.available ? i.fresh.label : i.per}</span>}
            </span>
          </button>
          {open === i.id && <div className={cn(t === 'khata' && 'pt-2')}><Detail i={i} b={b} /></div>}
        </li>
      ))}
    </ul>
  )
}

/* ---------- small sections ---------- */
function Section({ id, title, sub, children, className }: { id?: string; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('scroll-mt-6 py-12 md:py-16', className)} aria-label={title}>
      <h2 className="text-3xl leading-tight md:text-4xl">{title}</h2>
      {sub && <p className="muted mt-2 max-w-[60ch]">{sub}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Shosta({ pick }: { pick: (id: string) => void }) {
  const deals = ITEMS.map((i) => ({ i, c: change(i, 'month') })).filter((x) => x.c && x.c.dir === 'down').sort((a, z) => a.c!.pct - z.c!.pct).slice(0, 5)
  if (!deals.length) return null
  return (
    <Section title="Ajke shosta ki?" sub="TCB er report onujayi gelo mash er cheye jegulor dam kome geche.">
      <ol className="flex flex-wrap gap-2">
        {deals.map(({ i, c }) => (
          <li key={i.id}><button type="button" onClick={() => pick(i.id)} className="chip flex items-center gap-2"><img src={IMG[i.id]} alt="" className="size-5" />{i.local}<span className="num down font-semibold">↓ {Math.abs(c!.pct)}%</span></button></li>
        ))}
      </ol>
    </Section>
  )
}

function Thokse() {
  const groups = (['veg', 'leaf', 'fruit', 'spice'] as const).map((c) => ({ c, items: ITEMS.filter((i) => i.cat === c && !i.off) }))
  const [id, setId] = useState('potato'); const it = BY[id]
  const [qty, setQty] = useState(1); const [paid, setPaid] = useState(''); const [shown, setShown] = useState(false)
  useEffect(() => { setQty(QUICK[it.unit][it.unit === 'kg' ? 2 : 0][0]); setShown(false) }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const n = it.unit === 'kg' ? qty : Math.max(1, Math.round(qty))
  const lo = Math.round(it.min * n), hi = Math.round(it.max * n), p = Number(paid)
  const v = p > 0 ? judge(p, lo, hi) : null
  const text = v ? `${v.t}! ${it.local} ${qtyText(it, n)} kinlam Tk ${p} e. Usual dam ${tk(lo, hi)}. Check koro: https://${SITE}` : ''
  return (
    <Section id="thokse-naki" title="Thokse naki?" sub="Ki kinlen, koto nilo bolen. Amra bole dibo mama thokaise naki.">
      <form className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end" onSubmit={(e) => { e.preventDefault(); setShown(true) }}>
        <label className="grid gap-1 text-sm">Ki kinlen?
          <select value={id} onChange={(e) => setId(e.target.value)} className="text-base">{groups.map((g) => <optgroup key={g.c} label={CAT_NAME[g.c]}>{g.items.map((i) => <option key={i.id} value={i.id}>{i.local} ({i.name})</option>)}</optgroup>)}</select>
        </label>
        <label className="grid gap-1 text-sm">Koto ({it.unit === 'kg' ? 'kg' : it.unit === 'g100' ? '×100 g' : it.unit === 'piece' ? 'ta' : it.unit === 'bundle' ? 'aati' : 'hali'})
          <input type="number" inputMode="decimal" min={0.05} step="any" value={qty} onChange={(e) => { setQty(Number(e.target.value)); setShown(false) }} className="text-base" />
        </label>
        <label className="grid gap-1 text-sm">Koto dilen? (Tk)
          <input type="number" inputMode="numeric" min={1} required value={paid} placeholder="60" onChange={(e) => { setPaid(e.target.value); setShown(false) }} className="text-base" />
        </label>
        <button type="submit" className="btn">Judge koren</button>
      </form>
      <div aria-live="polite">
        {shown && v ? (
          <div className="fade mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="d rounded-[var(--r)] border-2 px-3 py-1 text-xl" style={{ color: v.good ? 'var(--down)' : 'var(--up)', borderColor: 'currentColor' }}>{v.t}</span>
            <span>{v.line} <span className="muted">Usual {tk(lo, hi)}, apni dilen Tk {p}.</span></span>
            <a className="btn btn-q" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener">WhatsApp e bolun</a>
          </div>
        ) : <p className="muted mt-4 text-sm">Usual dam: {it.local} {qtyText(it, n)} = <span className="num">{tk(lo, hi)}</span></p>}
      </div>
    </Section>
  )
}

function Kashem({ b }: { b: Bazar }) {
  const g = b.game
  return (
    <Section id="dor-dam" title="Dor-দাম with Kashem bhai" sub="He names the item, you say your price. Kashem bhai is made up, kintu tar dor-dam ekdom real.">
      <div className="card max-w-[640px] p-5 md:p-6">
        {!g.done ? (
          <>
            <p className="muted text-sm">Round {g.roundNo} of {g.total}</p>
            <p className="d mt-1 text-2xl">{ASK[g.id]}? Bolen bhai, koto diben?</p>
            <div className="mt-4 flex items-baseline justify-between"><label htmlFor="mn-guess" className="muted text-sm">Ami dibo</label><output htmlFor="mn-guess" className="num text-3xl font-semibold">Tk {g.guess}</output></div>
            <GuessRange id="mn-guess" value={g.guess} onChange={g.setGuess} className="mt-2 [--primary:var(--acc)] [--background:var(--card)] [--slider-track-color:var(--line)]" />
            {!g.revealed ? <button type="button" onClick={g.reveal} className="btn mt-4 w-full">Bolei Felun ভাই, Judge Korbo NAAAAA</button> : (
              <div className="fade mt-4 border-t line pt-4">
                <p className="text-lg">{replyLine(g)}</p>
                <p className="muted text-sm">{g.verdict} <span className="font-semibold" style={{ color: stampOf(g).c }}>{stampOf(g).t}</span></p>
                <button type="button" onClick={g.next} className="btn btn-q mt-3">{g.roundNo === g.total ? 'Score dekhi' : 'Porer item'}</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="muted text-sm">Kashem bhai's verdict</p>
            <p className="num text-6xl font-semibold">{g.avg}%</p>
            <p className="mt-1">{g.avg >= 80 ? 'Apni to pakka bazari!' : g.avg >= 50 ? 'Kharap na, aro practice lagbe.' : 'Bhai, apnake to thokabe!'}</p>
            <button type="button" onClick={g.restart} className="btn btn-q mt-4">Abar khelbo</button>
          </div>
        )}
      </div>
    </Section>
  )
}

function Season({ pick }: { pick: (id: string) => void }) {
  const now = useMemo(() => seasonNow(), [])
  const [sel, setSel] = useState(now)
  const s = SEASONS.find((x) => x.id === sel)!
  return (
    <Section id="season" title="Season er calendar" sub="Choy ritu, choy rokom bazar. Season er jinish taja thake, dam o kom thake.">
      <div role="group" aria-label="Season" className="flex flex-wrap gap-2">
        {SEASONS.map((x) => <button key={x.id} type="button" aria-pressed={sel === x.id} onClick={() => setSel(x.id)} className="chip">{x.name} <span className="opacity-70">{x.bn}</span>{x.id === now && <span className="acc ml-1 text-xs font-semibold">· ekhon</span>}</button>)}
      </div>
      <p className="muted mt-4 text-sm">{s.months}</p>
      <ul key={sel} className="fade mt-2 flex flex-wrap gap-x-5 gap-y-2">
        {s.items.filter((id) => BY[id]).map((id) => <li key={id}><button type="button" onClick={() => pick(id)} className="flex cursor-pointer items-center gap-1.5 py-1"><img src={IMG[id]} alt="" className="size-5" />{BY[id].local}</button></li>)}
      </ul>
      <p className="muted mt-4 text-sm">Sara bochor: {YEAR_ROUND.filter((id) => BY[id]).map((id) => BY[id].local).join(', ')}.</p>
    </Section>
  )
}

function Caution() {
  return (
    <aside className="card mt-6 p-4 text-sm leading-relaxed md:p-5">
      <p className="d text-base">SAVDHAN! Dam ektu upor nich hobei :3</p>
      <p className="mt-1">Bhai, ekhane ja dekhchen ta Dhaka-r bazar er usual range. Area, quality ar shokal bikal bhede dam ektu edik odik hoy, oita normal. Kintu MAMA jodi range theke onek beshi chay? Tokhon shundor kore boilen: <b>"Eto na MAMA PLSS."</b></p>
      <p className="muted mt-1">Alu, peyaj, rosun, ada, kacha morich, begun, shosha, lebu ar khejur er dam daily auto update hoy TCB er Dhaka report theke. Baki gula "approx.", mane rough estimate. "Update pending" mane 7 din er beshi fresh report nai.</p>
    </aside>
  )
}

/* ---------- list view ---------- */
function ListView({ b, back }: { b: Bazar; back: () => void }) {
  const [sure, setSure] = useState(false)
  useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 3000); return () => clearTimeout(t) }, [sure])
  const [budget, setBudget] = useState('500'); const [fam, setFam] = useState(4)
  const build = () => {
    const cap = Number(budget) || 0; let hi = 0; const out: Record<string, number> = {}
    for (const [id, q4] of PLAN) { const i = BY[id]; if (!i || i.off || !(i.max > 0)) continue; const step = i.unit === 'kg' ? 0.25 : 1; const n = Math.max(step, Math.round((q4 * fam) / 4 / step) * step); const z = Math.round(i.max * n); if (hi + z <= cap) { out[id] = n; hi += z } }
    b.setAll(out)
  }
  return (
    <main className="mx-auto max-w-[760px] px-5 pb-24">
      <button type="button" onClick={back} className="btn btn-q mt-2">← Back</button>
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl">Amar bazar list</h1>
        {!b.list.empty && <button type="button" onClick={() => (sure ? (b.setAll({}), setSure(false)) : setSure(true))} className={cn('chip', sure && 'acc')}>{sure ? 'Sure? Abar tap korun' : 'List khali korun'}</button>}
      </div>
      <ul className="mt-5 border-t line">
        {b.list.rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 border-b line py-3">
            <img src={r.img} alt="" className="size-7" />
            <span className="flex-1">{r.local}</span>
            <div className="flex items-center rounded-[var(--rb)] border line">
              <button type="button" aria-label={`Less ${r.local}`} onClick={() => b.dec(r.id)} className="grid size-10 cursor-pointer place-items-center">−</button>
              <span className="num min-w-[4rem] text-center text-sm">{r.qty}</span>
              <button type="button" aria-label={`More ${r.local}`} onClick={() => b.add(r.id)} className="grid size-10 cursor-pointer place-items-center">+</button>
            </div>
            <span className="num w-24 text-right">{r.line}</span>
          </li>
        ))}
        {b.list.empty && <li className="muted py-6">List khali. Dam er list theke "+ List e rakhun" tap korun.</li>}
      </ul>
      {!b.list.empty && (
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="muted text-sm">Mot dam</p><p className="num text-3xl font-semibold">{b.list.total}</p></div>
          <div className="text-right"><p className="muted text-sm">Shathe rakhun</p><p className="num acc text-3xl font-semibold">{b.list.carry}</p></div>
          <div className="flex w-full flex-wrap gap-2">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(listText(b))}`} target="_blank" rel="noopener">WhatsApp e pathan</a>
            <button type="button" className="btn btn-q" onClick={async () => { try { if (navigator.share) await navigator.share({ text: listText(b) }); else await navigator.clipboard.writeText(listText(b)) } catch { /* closed */ } }}>Onno jaygay share</button>
          </div>
        </div>
      )}
      <section className="card mt-12 p-5" aria-label="Budget mode">
        <h2 className="text-2xl">Budget mode</h2>
        <p className="muted mt-1 text-sm">Pocket e koto ache, koy jon khaben bolen. 3-4 din er list baniye dibo, max dam dhore.</p>
        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); build() }}>
          <label className="grid gap-1 text-sm">Tk<input type="number" min={50} step={50} value={budget} onChange={(e) => setBudget(e.target.value)} className="w-28 text-base" /></label>
          <div role="group" aria-label="People" className="flex gap-1">{[1, 2, 3, 4, 5, 6].map((f) => <button key={f} type="button" aria-pressed={fam === f} onClick={() => setFam(f)} className="chip w-11 px-0">{f}</button>)}</div>
          <button type="submit" className="btn">List baniye dao</button>
        </form>
        <p className="muted mt-2 text-xs">Apnar ekhonkar list ta bodle jabe.</p>
      </section>
    </main>
  )
}

/* ---------- page ---------- */
export default function MinSite({ t, picker }: { t: ThemeId; picker?: React.ReactNode }) {
  const { ver, updated } = useLive()
  const b = useBazar(ver)
  const { mode, toggle } = useMode()
  const { view, go } = useView()
  const { inApp, android } = useInstall()
  const [open, setOpen] = useState('')
  const pick = (id: string) => { b.setQ(''); b.setCat('all'); setOpen(id); requestAnimationFrame(() => document.getElementById('dam')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })) }
  const count = b.list.rows.length
  const tcbDate = fmtDate(ITEMS.find((i) => i.source === 'TCB')?.date)

  const intro = (
    <div className={cn(t === 'shapla' ? '' : 'pt-10 md:pt-16')}>
      <p className="muted text-sm">Dhakar sobji, shak, fol ar moshla{tcbDate && ` · TCB report ${tcbDate}`}</p>
      <h1 className="mt-2 text-[clamp(2.4rem,6vw,4rem)] leading-[1.05]">Ajker bazar er ashol দাম.</h1>
      <p className="mt-3 max-w-[48ch]">Ek kilo alu, hajar ta question. {ITEMS.length} ta jinish er usual dam, ek jaygay.</p>
    </div>
  )
  const list = (
    <Section id="dam" title="Now চলছে" sub={t === 'shapla' ? undefined : 'Naam e tap korun, details ar list e rakhar button dekhben.'} className={cn(t === 'shapla' && 'pt-0 md:pt-0')}>
      <div className="mb-5 flex flex-wrap gap-2">
        <input type="search" value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Khujun: alu, malta, palong…" aria-label="Search" className="min-w-0 flex-1 basis-56 text-base" />
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-1.5">{b.cats.map((c) => <button key={c.id} type="button" aria-pressed={b.cat === c.id} onClick={() => b.setCat(c.id)} className="chip">{c.label}</button>)}</div>
      </div>
      {b.board.length === 0 ? <p className="muted">"{b.q}" naam e kichu nai.</p> : <PriceList b={b} t={t} open={open} setOpen={setOpen} />}
    </Section>
  )

  return (
    <div className="mn" data-t={t} data-m={mode}>
      <style>{MIN_CSS}</style>
      {picker}
      {!inApp && android && view === 'home' && (
        <div className="flex items-center gap-3 border-b line px-5 py-2.5 text-sm md:hidden">
          <span className="flex-1">Get our Android app. See the latest prices, even offline.</span>
          <a href={APK} download className="btn min-h-9 px-3 text-sm">Install</a>
        </div>
      )}
      <header className={cn('mx-auto flex items-center justify-between gap-3 px-5 py-4', t === 'shapla' ? 'max-w-[1180px]' : t === 'tag' ? 'max-w-[1100px]' : 'max-w-[860px]')}>
        <button type="button" onClick={() => go('home')} className="d cursor-pointer text-lg">THOKAR চান্স NAI</button>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          {view === 'home' && <><a href="#dam" className="hidden rounded-[var(--rb)] px-3 py-2 sm:inline">Dam</a><a href="#thokse-naki" className="hidden rounded-[var(--rb)] px-3 py-2 sm:inline">Thokse naki?</a></>}
          <button type="button" role="switch" aria-checked={mode === 'night'} aria-label="Night mode" onClick={toggle} className="chip px-3">{mode === 'night' ? '☾ Raat' : '☀ Din'}</button>
          <button type="button" onClick={() => go(view === 'list' ? 'home' : 'list')} className="btn min-h-10 px-3 text-sm">Amar list · <span className="num">{count}</span></button>
        </nav>
      </header>

      {view === 'list' ? <ListView b={b} back={() => go('home')} /> : t === 'shapla' ? (
        <main className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-24 md:grid-cols-[minmax(0,360px)_1fr]">
          <div className="md:sticky md:top-4 md:self-start">{intro}<Caution /></div>
          <div className="md:pt-16">{list}<Shosta pick={pick} /><Thokse /><Kashem b={b} /><Season pick={pick} /></div>
        </main>
      ) : (
        <main className={cn('mx-auto px-5 pb-24', t === 'tag' ? 'max-w-[1100px]' : 'max-w-[860px]')}>
          {t === 'memo' ? (
            <div className="sheet mt-6 rounded-[var(--r)] p-6 md:p-10">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 line pb-3"><span className="d text-sm tracking-wide">CASH MEMO</span><span className="text-sm">Date: <span className="hand">{new Date().toLocaleDateString('en-GB')}</span></span></div>
              {intro}
            </div>
          ) : intro}
          <Caution />
          <Shosta pick={pick} />
          {list}
          <Thokse />
          <Kashem b={b} />
          <Season pick={pick} />
          <section className="border-t line py-10 text-sm" aria-label="Get the app">
            {!inApp && <p>Get the app: see the last saved prices even when the internet drops in the bazar. <a href={APK} download className="acc font-semibold underline">Download for Android</a>.</p>}
            <p className="muted mt-3">Prices update daily from TCB's Dhaka market report{updated && ` (checked ${fmtDate(updated)})`}. They are averages, so your shop may be a little higher or lower.</p>
          </section>
        </main>
      )}
      {view === 'home' && count > 0 && (
        <button type="button" onClick={() => go('list')} className="btn fixed right-4 z-30 shadow-[0_10px_30px_-12px_rgba(0,0,0,.45)]" style={{ bottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          Amar list · <span className="num">{count}</span> · <span className="num">{b.list.total}</span>
        </button>
      )}
    </div>
  )
}
