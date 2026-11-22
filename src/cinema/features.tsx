/* The 10/10 features: Thokse naki? checker, price arrows, Ajke shosta ki?,
   WhatsApp list share, install/offline, and the season calendar. */
import { useEffect, useMemo, useState } from 'react'
import type { Bazar } from '@/lib/useBazar'
import { BY, IMG, ITEMS, UNIT, change, freshness, qtyText, tk, type Item } from '@/lib/data'
import { cn } from '@/lib/utils'
import { BN, POSTER, extrude, halftone } from './common'

export const SITE = 'thokar-chance-nai.vercel.app'
const CAT_NAME: Record<Item['cat'], string> = { veg: 'Sobji', leaf: 'Shak', fruit: 'Fol', spice: 'Moshla' }

/* ---------- price arrows ---------- */
export function Trend({ i, vs = 'week', className }: { i: Item; vs?: 'week' | 'month'; className?: string }) {
  const c = change(i, vs)
  if (!c) return null
  const when = vs === 'week' ? 'gelo shoptah' : 'gelo mash'
  const label = c.dir === 'same' ? `${when} er moto` : `${c.dir === 'up' ? '↑' : '↓'} Tk ${Math.abs(c.diff)} vs ${when}`
  return (
    <span className={cn('inline-flex items-center rounded-[3px] px-1.5 py-px text-xs font-bold whitespace-nowrap', c.dir === 'up' ? 'bg-[#C4161C] text-[#FFF1D6]' : c.dir === 'down' ? 'bg-[#1F7A3A] text-[#F4FFF2]' : 'bg-current/15', className)}
      aria-label={c.dir === 'same' ? `Same as ${vs === 'week' ? 'last week' : 'last month'}` : `${c.dir === 'up' ? 'Up' : 'Down'} ${Math.abs(c.diff)} taka since ${vs === 'week' ? 'last week' : 'last month'}`}>
      {label}
    </span>
  )
}

/* ---------- Ajke shosta ki? ---------- */
export function ShostaBoard({ onPick }: { onPick: (id: string) => void }) {
  const deals = ITEMS.map((i) => ({ i, c: change(i, 'month') })).filter((x) => x.c && x.c.dir === 'down').sort((a, b) => a.c!.pct - b.c!.pct).slice(0, 5)
  const fill = ITEMS.filter((i) => i.season && !i.off && i.unit === 'kg' && !deals.some((d) => d.i.id === i.id)).sort((a, b) => a.min - b.min).slice(0, Math.max(0, 5 - deals.length))
  const cards = [...deals.map((d) => ({ i: d.i, tag: `↓ ${Math.abs(d.c!.pct)}%`, note: `Gelo mash ${tk(d.i.month![0], d.i.month![1])}`, season: false })), ...fill.map((i) => ({ i, tag: 'Season', note: 'Ekhon season, dam kom thake', season: true }))]
  return (
    <section id="shosta" className="mx-auto max-w-[1180px] scroll-mt-6 px-4 pb-24 md:px-6" aria-labelledby="shosta-h">
      <div className="rv rv-brush"><h2 id="shosta-h" style={extrude('clamp(2.6rem,6.5vw,4.6rem)', '#FFD21F', '#1F7A3A')}>Ajke <span style={{ fontFamily: POSTER, fontSize: '.62em' }}>SHOSTA</span> ki?</h2></div>
      <p className="mt-2 max-w-[60ch] text-lg text-[var(--soft)]">TCB er report onujayi gelo mash er cheye jegulor dam kome geche. Baki ghor gula season er jinish, ekhon emnitei shosta thake.</p>
      <ol className="no-scrollbar mt-7 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {cards.map(({ i, tag, note, season }, k) => (
          <li key={i.id} className="w-[64%] shrink-0 snap-start sm:w-[40%] md:w-auto">
            <button type="button" onClick={() => onPick(i.id)} className="kc-press kc-row relative block h-full w-full cursor-pointer overflow-hidden rounded-[6px] bg-[#FFF8EA] p-4 text-left text-[#1A0B07] shadow-[6px_6px_0_var(--deep)]" style={{ animationDelay: `${k * 70}ms` }}>
              <span className={cn('absolute top-3 right-3 rounded-[3px] px-2 py-0.5 text-lg leading-none', season ? 'bg-[#FFD21F] text-[#1A0B07]' : 'bg-[#1F7A3A] text-[#F4FFF2]')} style={{ fontFamily: POSTER }}>{tag}</span>
              {!season && <span className="text-xs font-bold text-[#1F7A3A]">#{k + 1} shosta</span>}
              <img src={IMG[i.id]} alt="" className="mt-2 size-20 -rotate-6" />
              <p className="mt-2 text-2xl leading-none" style={{ fontFamily: POSTER }}>{i.local}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{tk(i.min, i.max)} <span className="text-sm font-normal opacity-70">{UNIT[i.unit]}</span></p>
              <p className="text-sm opacity-70">{note}</p>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------- Thokse naki? ---------- */
type Verdict = { t: string; c: string; line: string; good: boolean }
export function judge(paid: number, lo: number, hi: number): Verdict {
  if (paid < lo * 0.9) return { t: 'SHOSTA PAISEN!', c: '#1F7A3A', line: 'Usual dam er cheye kom e paisen. Mama aj apnake bhalobashe.', good: true }
  if (paid <= hi * 1.05) return { t: 'THOKAR CHANCE NAI', c: '#1F7A3A', line: 'Ekdom thik dam. Apni pakka bazari.', good: true }
  if (paid <= hi * 1.2) return { t: 'EKTU THOKSEN', c: '#B8520F', line: `Tk ${paid - hi} beshi gelo. Porer bar shundor kore bolben: "Eto na MAMA PLSS."`, good: false }
  return { t: 'THOKSEN!', c: '#C4161C', line: `Tk ${paid - hi} beshi! Mama aj apnake dhorse.`, good: false }
}
export const QUICK: Record<Item['unit'], [number, string][]> = {
  kg: [[0.25, '250 g'], [0.5, '500 g'], [1, '1 kg'], [2, '2 kg']], piece: [[1, '1 ta'], [2, '2 ta'], [3, '3 ta']], bundle: [[1, '1 aati'], [2, '2 aati'], [3, '3 aati']],
  hali: [[1, '1 hali'], [2, '2 hali'], [3, '3 hali']], g100: [[1, '100 g'], [2, '200 g'], [5, '500 g']],
}

async function verdictImage(i: Item, qty: string, paid: number, lo: number, hi: number, v: Verdict) {
  await document.fonts.ready
  const W = 1080, c = document.createElement('canvas'); c.width = W; c.height = W
  const x = c.getContext('2d')!
  x.fillStyle = v.good ? '#FFD21F' : '#FF9F1A'; x.fillRect(0, 0, W, W)
  x.save(); x.translate(W / 2, W * 0.42); x.fillStyle = v.good ? '#FFE36A' : '#FFB24A'
  for (let k = 0; k < 36; k += 2) { x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, W * 1.2, (k / 36) * Math.PI * 2, ((k + 1) / 36) * Math.PI * 2); x.closePath(); x.fill() }
  x.restore()
  const frame = (w: number, col: string, inset: number) => { x.strokeStyle = col; x.lineWidth = w; x.strokeRect(inset, inset, W - inset * 2, W - inset * 2) }
  frame(26, '#C4161C', 13); frame(8, '#1A0B07', 30); frame(14, '#FFD21F', 41); frame(6, '#1A0B07', 51)
  x.textAlign = 'center'; x.fillStyle = '#C4161C'; x.font = `44px Bungee`; x.fillText('THOKSE NAKI?', W / 2, 150)
  const img = new Image(); img.src = IMG[i.id]; await img.decode().catch(() => {})
  if (img.complete && img.naturalWidth) { x.save(); x.translate(W / 2, 330); x.rotate(-0.12); x.drawImage(img, -130, -130, 260, 260); x.restore() }
  x.fillStyle = '#1A0B07'; x.font = `600 46px ${BN}`; x.fillText(`${i.local} · ${qty}`, W / 2, 520)
  // stamp
  x.save(); x.translate(W / 2, 650); x.rotate(-0.07)
  x.font = `${v.t.length > 14 ? 74 : 92}px Bungee`; const tw = x.measureText(v.t).width
  x.fillStyle = '#FFF6E0'; x.fillRect(-tw / 2 - 34, -86, tw + 68, 124); x.strokeStyle = v.c; x.lineWidth = 10; x.strokeRect(-tw / 2 - 34, -86, tw + 68, 124)
  x.fillStyle = v.c; x.fillText(v.t, 0, 10); x.restore()
  x.fillStyle = '#1A0B07'; x.font = `700 44px ${BN}`; x.fillText(`Ami dilam Tk ${paid}`, W / 2, 810)
  x.font = `500 38px ${BN}`; x.fillText(`Usual dam ${tk(lo, hi)}`, W / 2, 862)
  x.fillStyle = '#C4161C'; x.font = `34px Bungee`; x.fillText('THOKAR CHANCE NAI', W / 2, 960); x.fillStyle = '#1A0B07'; x.font = `500 28px ${BN}`; x.fillText(SITE, W / 2, 1000)
  return new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
}

export function ThokseNaki() {
  const { inApp } = useInstall()
  const [id, setId] = useState('potato')
  const it = BY[id]
  const [qty, setQty] = useState(1)
  const [paid, setPaid] = useState('')
  const [shown, setShown] = useState(false)
  const [busy, setBusy] = useState('')
  useEffect(() => { setQty(QUICK[it.unit][it.unit === 'kg' ? 2 : 0][0]); setShown(false) }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const n = it.unit === 'kg' ? qty : Math.max(1, Math.round(qty))
  const lo = Math.round(it.min * n), hi = Math.round(it.max * n)
  const p = Number(paid)
  const v = p > 0 ? judge(p, lo, hi) : null
  const fresh = freshness(it.date)
  const qtxt = qtyText(it, n)
  const text = v ? `${v.t}! ${it.local} ${qtxt} kinlam Tk ${p} e. Usual dam ${tk(lo, hi)}. Tumi o check koro: https://${SITE}/#thokse-naki` : ''
  const groups = (['veg', 'leaf', 'fruit', 'spice'] as const).map((c) => ({ c, items: ITEMS.filter((i) => i.cat === c && !i.off) }))
  const shareImg = async () => {
    if (!v) return
    setBusy('img')
    try {
      const blob = await verdictImage(it, qtxt, p, lo, hi, v)
      if (!blob) return
      const file = new File([blob], 'thokse-naki.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text })
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'thokse-naki.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000) }
    } catch { /* share sheet closed */ } finally { setBusy('') }
  }
  return (
    <section id="thokse-naki" className="mx-auto max-w-[980px] scroll-mt-6 px-4 pb-24 md:px-6" aria-labelledby="tn-h">
      <div className="rv rv-brush"><h2 id="tn-h" style={extrude('clamp(2.8rem,7vw,5rem)', '#F4E3C1', '#C4161C')}>Thokse <span style={{ fontFamily: POSTER, fontSize: '.6em' }}>NAKI?</span></h2></div>
      <p className="mt-3 mb-8 max-w-[56ch] text-lg text-[var(--soft)]">Bazar theke ashlen? Ki kinlen, koto nilo, bolen. Amra bole dibo mama thokaise naki.</p>
      <form className="rv rv-slap grid gap-6 rounded-[10px] bg-[#FFF8EA] p-5 text-[#1A0B07] shadow-[8px_8px_0_var(--deep)] md:grid-cols-[1.1fr_1fr] md:p-8" onSubmit={(e) => { e.preventDefault(); setShown(true) }}>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block font-bold">Ki kinlen?</span>
            <span className="flex items-center gap-3">
              <img src={IMG[id]} alt="" className="size-12 shrink-0 -rotate-6" />
              <select value={id} onChange={(e) => setId(e.target.value)} className="h-12 w-full cursor-pointer rounded-[4px] bg-white px-3 text-lg ring-2 ring-[#1A0B07]">
                {groups.map((g) => <optgroup key={g.c} label={CAT_NAME[g.c]}>{g.items.map((i) => <option key={i.id} value={i.id}>{i.local} ({i.name})</option>)}</optgroup>)}
              </select>
            </span>
          </label>
          <fieldset>
            <legend className="mb-1.5 font-bold">Koto ta?</legend>
            <div className="flex flex-wrap items-center gap-2">
              {QUICK[it.unit].map(([q, l]) => (
                <button key={q} type="button" aria-pressed={qty === q} onClick={() => { setQty(q); setShown(false) }} className={cn('kc-press h-11 cursor-pointer rounded-[4px] px-3.5 font-bold ring-2 ring-[#1A0B07]', qty === q ? 'bg-[#1A0B07] text-[#FFD21F]' : 'bg-white')}>{l}</button>
              ))}
              <label className="flex h-11 items-center gap-2 rounded-[4px] bg-white px-3 ring-2 ring-[#1A0B07]/40">
                <span className="text-sm opacity-70">Onno</span>
                <input type="number" inputMode="decimal" min={it.unit === 'kg' ? 0.05 : 1} step={it.unit === 'kg' ? 'any' : 1} value={qty} onChange={(e) => { setQty(Math.max(0, Number(e.target.value))); setShown(false) }} className="h-full w-16 bg-transparent text-lg outline-none" aria-label={`Quantity in ${it.unit === 'kg' ? 'kg' : it.unit === 'g100' ? 'hundreds of grams' : it.unit}`} />
                <span className="text-sm">{it.unit === 'kg' ? 'kg' : it.unit === 'g100' ? '×100 g' : it.unit === 'piece' ? 'ta' : it.unit === 'bundle' ? 'aati' : 'hali'}</span>
              </label>
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-1.5 block font-bold">Koto dilen?</span>
            <span className="flex h-14 items-center gap-2 rounded-[4px] bg-white px-4 ring-2 ring-[#1A0B07]">
              <span className="text-xl font-bold">Tk</span>
              <input type="number" inputMode="numeric" min={1} required value={paid} onChange={(e) => { setPaid(e.target.value); setShown(false) }} placeholder="eg. 60" className="h-full w-full bg-transparent text-2xl font-bold outline-none placeholder:font-normal placeholder:opacity-40" />
            </span>
          </label>
          <button type="submit" className="kc-press pw-wig h-13 w-full cursor-pointer rounded-[4px] bg-[#C4161C] px-5 py-3 text-xl font-bold text-[#FFD21F] shadow-[4px_4px_0_#1A0B07]">Judge koren</button>
        </div>
        <div className="relative grid min-h-[300px] place-items-center overflow-hidden rounded-[8px] p-6 text-center" style={{ background: shown && v ? (v.good ? '#FFD21F' : '#FF9F1A') : '#F4E3C1' }} aria-live="polite">
          <div aria-hidden className="absolute inset-0" style={halftone} />
          {shown && v ? (
            <div className="relative">
              <img src={IMG[id]} alt="" className="mx-auto size-24 -rotate-6 drop-shadow-[5px_6px_0_rgba(26,11,7,.6)]" />
              <p key={`${id}-${p}-${n}`} className="kc-stamp mx-auto mt-3 inline-block rotate-[-6deg] rounded-[6px] border-[5px] bg-[#FFF6E0] px-4 py-2 text-[clamp(1.6rem,4vw,2.4rem)] leading-none" style={{ borderColor: v.c, color: v.c, fontFamily: POSTER }}>{v.t}</p>
              <p className="mt-4 text-lg leading-snug font-semibold">{v.line}</p>
              <p className="mt-1 text-sm">{it.local} {qtxt}: usual dam {tk(lo, hi)}. Apni dilen Tk {p}.</p>
              {fresh.approx && <p className="mt-1 text-xs opacity-75">Ei item er dam approx., tai verdict o approx.</p>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {!inApp && <button type="button" onClick={shareImg} disabled={busy === 'img'} className="kc-press h-11 cursor-pointer rounded-full bg-[#1A0B07] px-5 font-bold text-[#FFD21F]">{busy === 'img' ? 'Banacchi…' : 'Chobi share korun'}</button>}
                <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" className="kc-press grid h-11 place-items-center rounded-full bg-[#1F7A3A] px-5 font-bold text-white">WhatsApp e bolun</a>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="text-2xl leading-tight" style={{ fontFamily: POSTER }}>Verdict ekhane ashbe</p>
              <p className="mt-2 opacity-70">Usual dam: {it.local} {qtxt} = {tk(lo, hi)}</p>
            </div>
          )}
        </div>
      </form>
    </section>
  )
}

/* ---------- share the list ---------- */
export function listText(b: Bazar) {
  const lines = b.list.rows.map((r) => `• ${r.local} ${r.qty}: ${r.line}`)
  return `🛒 Amar bazar list\n${lines.join('\n')}\n\nMot: ${b.list.total}\nShathe rakhun: ${b.list.carry}\n\nAjker dam: https://${SITE}`
}
export function ShareList({ b }: { b: Bazar }) {
  const [copied, setCopied] = useState(false)
  if (b.list.empty) return null
  const text = listText(b)
  const native = async () => {
    try { if (navigator.share) { await navigator.share({ text }); return } await navigator.clipboard.writeText(text); setCopied(true) } catch { /* closed */ }
  }
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" className="kc-press inline-grid h-12 place-items-center rounded-[4px] bg-[#1F7A3A] px-5 text-lg font-bold text-white shadow-[3px_3px_0_#1A0B07]">WhatsApp e pathan</a>
      <button type="button" onClick={native} className="kc-press h-12 cursor-pointer rounded-[4px] bg-white px-5 text-lg font-bold ring-2 ring-[#1A0B07]">{copied ? 'Copy hoyeche' : 'Onno jaygay share'}</button>
    </div>
  )
}

/* ---------- season calendar ---------- */
export const SEASONS = [
  { id: 'grishmo', name: 'Grishmo', bn: 'গ্রীষ্ম', months: 'Boishakh, Joishtho', from: [4, 14], items: ['aam', 'kathal', 'lichu', 'jam', 'tormuj', 'anaros', 'jhinga', 'chichinga', 'potol', 'dherosh', 'borboti', 'shosha', 'pui', 'data', 'kolmi', 'echor', 'korola'] },
  { id: 'borsha', name: 'Borsha', bn: 'বর্ষা', months: 'Asharh, Srabon', from: [6, 15], items: ['aam', 'kathal', 'anaros', 'peyara', 'kakrol', 'chichinga', 'jhinga', 'dherosh', 'kochur_loti', 'kochu', 'pui', 'kolmi', 'chal_kumra', 'kamranga', 'dab'] },
  { id: 'shorot', name: 'Shorot', bn: 'শরৎ', months: 'Bhadro, Ashwin', from: [8, 16], items: ['ata', 'peyara', 'malta', 'jolpai', 'kamranga', 'chal_kumra', 'kumra', 'kochu', 'mocha', 'kakrol', 'laushak'] },
  { id: 'hemonto', name: 'Hemonto', bn: 'হেমন্ত', months: 'Kartik, Agrahayan', from: [10, 16], items: ['newpotato', 'cauliflower', 'cabbage', 'shim', 'mula', 'mulashak', 'lalshak', 'palong', 'lau', 'jolpai', 'amloki', 'malta', 'komola', 'gajor', 'tomato', 'dhonepata'] },
  { id: 'sheet', name: 'Sheet', bn: 'শীত', months: 'Poush, Magh', from: [12, 16], items: ['cauliflower', 'cabbage', 'shim', 'tomato', 'gajor', 'mula', 'beet', 'olkopi', 'broccoli', 'capsicum', 'motorshuti', 'palong', 'lalshak', 'dhonepata', 'misti_alu', 'newpotato', 'boroi', 'komola', 'lau'] },
  { id: 'boshonto', name: 'Boshonto', bn: 'বসন্ত', months: 'Falgun, Choitro', from: [2, 13], items: ['sajna', 'tormuj', 'echor', 'korola', 'data', 'kumra', 'boroi', 'shosha', 'tomato', 'lau'] },
]
export const YEAR_ROUND = ['potato', 'onion', 'rosun', 'ada', 'chili', 'brinjal', 'lebu', 'pepe', 'kacha_kola', 'kola', 'dab', 'khejur', 'apel', 'angur', 'dalim', 'naspati']
export function seasonNow(d = new Date(Date.now() + 6 * 3600e3)) {
  const md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate()
  if (md >= 1216 || md < 213) return 'sheet'
  let cur = 'boshonto'
  const start = (x: (typeof SEASONS)[number]) => x.from[0] * 100 + x.from[1]
  for (const x of [...SEASONS].filter((x) => x.id !== 'sheet').sort((a, b) => start(a) - start(b))) if (md >= start(x)) cur = x.id
  return cur
}
export function SeasonCalendar({ onPick }: { onPick: (id: string) => void }) {
  const now = useMemo(() => seasonNow(), [])
  const [sel, setSel] = useState(now)
  const s = SEASONS.find((x) => x.id === sel)!
  return (
    <section id="season" className="mx-auto max-w-[1180px] scroll-mt-6 px-4 pb-28 md:px-6" aria-labelledby="sc-h">
      <div className="rv rv-brush"><h2 id="sc-h" style={extrude('clamp(2.6rem,6.5vw,4.6rem)', '#FFD21F', '#C4161C')}>Season er <span style={{ fontFamily: POSTER, fontSize: '.6em' }}>CALENDAR</span></h2></div>
      <p className="mt-2 max-w-[60ch] text-lg text-[var(--soft)]">Choy ritu, choy rokom bazar. Season er jinish taja thake, dam o kom thake.</p>
      <div role="group" aria-label="Season" className="no-scrollbar mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pt-3 pb-2 md:mx-0 md:px-0">
        {SEASONS.map((x) => (
          <button key={x.id} type="button" aria-pressed={sel === x.id} onClick={() => setSel(x.id)}
            className={cn('kc-press relative shrink-0 cursor-pointer rounded-[6px] px-4 py-2.5 text-left transition-colors duration-200', sel === x.id ? 'bg-[#FFD21F] text-[#1A0B07] shadow-[4px_4px_0_var(--deep)]' : 'bg-[var(--chip)] text-[var(--chip-ink)]')}>
            <span className="block text-lg leading-none" style={{ fontFamily: POSTER }}>{x.name}</span>
            <span className="text-sm opacity-80">{x.bn} · {x.months}</span>
            {x.id === now && <span className="absolute -top-2.5 -right-2 rotate-6 rounded-[3px] bg-[#C4161C] px-1.5 text-xs font-bold text-[#FFD21F]">EKHON</span>}
          </button>
        ))}
      </div>
      <ul key={sel} className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3" aria-label={`${s.name} items`}>
        {s.items.filter((id) => BY[id]).map((id, k) => (
          <li key={id} className="kc-row" style={{ animationDelay: `${k * 25}ms` }}>
            <button type="button" onClick={() => onPick(id)} className="kc-press flex w-full cursor-pointer flex-col items-center gap-1 rounded-[6px] bg-[#FFF8EA] p-3 text-[#1A0B07] shadow-[4px_4px_0_var(--deep)]">
              <img src={IMG[id]} alt="" className="size-12" />
              <span className="text-center text-sm leading-tight font-bold">{BY[id].local}</span>
              <span className="text-xs opacity-70">{BY[id].off ? `Asbe ${BY[id].off} e` : tk(BY[id].min, BY[id].max)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-[var(--soft)]">Sara bochor paben: {YEAR_ROUND.filter((id) => BY[id]).map((id) => BY[id].local).join(', ')}.</p>
    </section>
  )
}

/* ---------- install: APK + home screen + offline ---------- */
type BIP = Event & { prompt: () => Promise<void> }
export const APK = '/thokar-chance-nai.apk'
export function useInstall() {
  const [bip, setBip] = useState<BIP | null>(null)
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [inApp] = useState(() => {
    try { if (/[?&]source=app\b/.test(location.search)) sessionStorage.setItem('tcn-app', '1'); return sessionStorage.getItem('tcn-app') === '1' } catch { return /[?&]source=app\b/.test(location.search) }
  })
  useEffect(() => {
    const f = (e: Event) => { e.preventDefault(); setBip(e as BIP) }
    const on = () => setOnline(true), off = () => setOnline(false)
    addEventListener('beforeinstallprompt', f); addEventListener('online', on); addEventListener('offline', off)
    return () => { removeEventListener('beforeinstallprompt', f); removeEventListener('online', on); removeEventListener('offline', off) }
  }, [])
  return { bip, online, inApp, android: typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent) }
}
export function AppCard() {
  const { bip, inApp, android } = useInstall()
  if (inApp) return null
  return (
    <div className="rv rv-slap mt-10 flex flex-col gap-4 rounded-[10px] bg-[#FFD21F] p-6 text-[#1A0B07] shadow-[6px_6px_0_var(--deep)] md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-2xl leading-none" style={{ fontFamily: POSTER }}>Get the app</p>
        <p className="mt-1 max-w-[52ch]">See the last saved prices even when the internet drops in the bazar. Install the Android app, or add the site to your home screen.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={APK} download className="kc-press inline-grid h-12 place-items-center rounded-[4px] bg-[#1A0B07] px-5 text-lg font-bold text-[#FFD21F]">{android ? 'Download the Android app' : 'Android app (APK)'}</a>
        {bip && <button type="button" onClick={() => bip.prompt()} className="kc-press h-12 cursor-pointer rounded-[4px] bg-white px-5 text-lg font-bold ring-2 ring-[#1A0B07]">Add to home screen</button>}
      </div>
    </div>
  )
}
export function OfflineNote({ updated }: { updated: string | null }) {
  const { online } = useInstall()
  if (online) return null
  return <p role="status" className="fixed inset-x-0 top-0 z-40 bg-[#1A0B07] py-2 text-center text-sm text-[#FFD21F]">Net nai. Shesh save kora dam dekhacchi{updated ? ` (${updated})` : ''}.</p>
}

/* ---------- Amar list: add button with a stepper, fly-to-list, floating list button ---------- */
/** The added item's picture flies in an arc into the floating list button, which then bumps. */
export function flyToList(from: HTMLElement | null, img: string) {
  const fab = document.getElementById('list-fab')
  if (!from || !fab || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const a = from.getBoundingClientRect(), z = fab.getBoundingClientRect()
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2
  const dx = z.left + 30 - x0, dy = z.top + z.height / 2 - y0
  const el = document.createElement('img')
  el.src = img; el.alt = ''
  Object.assign(el.style, { position: 'fixed', left: `${x0 - 28}px`, top: `${y0 - 28}px`, width: '56px', height: '56px', zIndex: '60', pointerEvents: 'none', filter: 'drop-shadow(3px 4px 0 rgba(26,11,7,.6))' })
  document.body.appendChild(el)
  el.animate([
    { transform: 'translate(0,0) scale(1) rotate(0deg)' },
    { transform: `translate(${dx * 0.45}px, ${Math.min(dy * 0.45, 0) - 90}px) scale(1.1) rotate(-25deg)`, offset: 0.45 },
    { transform: `translate(${dx}px, ${dy}px) scale(.35) rotate(-60deg)`, opacity: 0.4 },
  ], { duration: 640, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }).finished.then(() => {
    el.remove()
    fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12) rotate(-3deg)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' })
  }).catch(() => el.remove())
}

/** "+ List e rakhun"; once added, a tick and a − qty + stepper so it's clear it's in the list. */
export function ListControl({ b, id, size = 'lg', tone = 'poster' }: { b: Bazar; id: string; size?: 'lg' | 'sm'; tone?: 'poster' | 'row' }) {
  const i = BY[id]
  const n = b.raw[id] || 0
  const h = size === 'lg' ? 'h-12' : 'h-11'
  if (!n) return (
    <button type="button" onClick={(e) => { b.add(id); flyToList(e.currentTarget, IMG[id]) }}
      className={cn('kc-press pw-wig shrink-0 cursor-pointer rounded-[4px] bg-[#FFD21F] px-5 font-bold text-[#1A0B07] shadow-[3px_3px_0_#1A0B07]', h, size === 'lg' ? 'text-lg' : 'px-4')}>+ List e rakhun</button>
  )
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span className={cn('kc-stamp text-sm font-bold', tone === 'poster' ? 'np-tick' : 'text-[var(--hi)]')}>✓ List e ache</span>
      <div className={cn('flex items-center rounded-full bg-[#FFD21F] p-1 text-[#1A0B07] shadow-[3px_3px_0_#1A0B07]', h)}>
        <button type="button" onClick={() => b.dec(id)} aria-label={`Less ${i.local}`} className="kc-press grid aspect-square h-full cursor-pointer place-items-center rounded-full bg-[#1A0B07]/10 text-xl font-bold">−</button>
        <span key={n} className="kc-stamp min-w-[4.5rem] px-2 text-center font-bold tabular-nums" aria-live="polite">{qtyText(i, n)}</span>
        <button type="button" onClick={(e) => { b.add(id); flyToList(e.currentTarget, IMG[id]) }} aria-label={`More ${i.local}`} className="kc-press grid aspect-square h-full cursor-pointer place-items-center rounded-full bg-[#1A0B07] text-xl font-bold text-[#FFD21F]">+</button>
      </div>
    </div>
  )
}

/** Floating button, always in reach: how many things are in the list and the expected total. */
export function ListFab({ b, open }: { b: Bazar; open: () => void }) {
  const count = b.list.rows.length
  return (
    <button id="list-fab" type="button" onClick={open} aria-label={`Amar list: ${count} items, ${b.list.total}`}
      className="kc-press fixed right-4 z-30 flex h-14 cursor-pointer items-center gap-3 rounded-full bg-[#FFD21F] pr-5 pl-2 text-[#1A0B07] shadow-[4px_4px_0_#1A0B07] ring-2 ring-[#1A0B07]"
      style={{ bottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <span className="relative grid size-10 place-items-center rounded-full bg-[#C4161C]">
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden><path d="M11 11V9a5 5 0 0 1 10 0v2" fill="none" stroke="#FFD21F" strokeWidth="2.6" strokeLinecap="round" /><path d="M6 11h20l-2 16H8z" fill="#FFD21F" /><path d="M9 16h14M10 21h12" stroke="#C4161C" strokeWidth="1.6" strokeDasharray="2 2" /></svg>
        <span key={count} className="kc-stamp absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-[#1A0B07] text-xs font-bold text-[#FFD21F]">{count}</span>
      </span>
      <span className="text-left leading-tight"><span className="block font-bold">Amar list</span><span className="block text-sm tabular-nums">{count ? b.list.total : 'Khali'}</span></span>
    </button>
  )
}

/** On phones, right at the top: get the Android app (or, on iPhone, add to home screen). Can be closed for 14 days. */
export function AppBanner() {
  const { inApp, android } = useInstall()
  const [show, setShow] = useState(false)
  const ios = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)
  useEffect(() => {
    if (inApp || !matchMedia('(max-width: 767px)').matches) return
    try { const until = Number(localStorage.getItem('tcn-app-no') || 0); if (until > Date.now()) return } catch { /* private mode */ }
    setShow(true)
  }, [inApp])
  if (!show) return null
  const close = () => { setShow(false); try { localStorage.setItem('tcn-app-no', String(Date.now() + 14 * 864e5)) } catch { /* private mode */ } }
  return (
    <div role="region" aria-label="Android app" className="relative z-20 flex items-center gap-3 bg-[#FFD21F] px-4 py-3 text-[#1A0B07]" style={{ animation: 'kc-row 360ms var(--ease-out) both' }}>
      <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-[10px]" />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="font-bold">{ios ? 'Add us to your home screen' : 'Get our Android app'}</p>
        <p className="text-sm">{ios ? 'Tap Share, then Add to Home Screen.' : 'See the latest prices, even offline.'}</p>
      </div>
      {!ios && <a href={APK} download className="kc-press grid h-11 shrink-0 place-items-center rounded-[4px] bg-[#1A0B07] px-4 font-bold text-[#FFD21F]">{android ? 'Install' : 'APK'}</a>}
      <button type="button" onClick={close} aria-label="Close" className="kc-press grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-2xl leading-none">×</button>
    </div>
  )
}
