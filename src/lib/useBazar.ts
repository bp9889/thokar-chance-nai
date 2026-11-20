import { useEffect, useMemo, useState } from 'react'
import { BN, BY, CATS, GUIDE, IMG, ITEMS, ROUNDS, UNIT, UNIT_BN, freshness, qtyText, tk, tkBn } from './data'

export function useBazar(ver = 0) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [round, setRound] = useState(0)
  const [guess, setGuess] = useState(60)
  const [revealed, setRevealed] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [list, setList] = useState<Record<string, number>>(() => {
    try { const saved = JSON.parse(localStorage.getItem('tcn-list') || 'null'); if (saved && typeof saved === 'object') return Object.fromEntries(Object.entries(saved).filter(([id, n]) => BY[id] && typeof n === 'number' && n > 0)) as Record<string, number> } catch { /* private mode */ }
    return { potato: 0.5, onion: 0.5, cauliflower: 1, chili: 0.25, lalshak: 2 }
  })
  useEffect(() => { try { localStorage.setItem('tcn-list', JSON.stringify(list)) } catch { /* private mode */ } }, [list])

  const step = (id: string) => (BY[id].unit === 'kg' ? 0.25 : 1)
  const add = (id: string) => BY[id].off ? undefined : setList((l) => ({ ...l, [id]: l[id] ? l[id] + step(id) : BY[id].unit === 'kg' ? 0.5 : 1 }))
  const dec = (id: string) => setList((l) => { const n = (l[id] || 0) - step(id); const c = { ...l }; if (n <= 0) delete c[id]; else c[id] = n; return c })
  const drop = (id: string) => setList((l) => { const c = { ...l }; delete c[id]; return c })

  const board = useMemo(() => {
    const s = q.trim().toLowerCase()
    return ITEMS.filter((i) => (cat === 'all' || i.cat === cat || (cat === 'season' && i.season)) && (!s || `${i.name} ${i.local}`.toLowerCase().includes(s)))
      .map((i) => ({ ...i, bn: BN[i.id], priceBn: tkBn(i.min, i.max), unitBn: UNIT_BN[i.unit], img: IMG[i.id], price: i.off ? 'Off season' : tk(i.min, i.max), per: i.off ? `Asbe ${i.off} e` : UNIT[i.unit], inList: !!list[i.id], available: !i.off, fresh: freshness(i.date) }))
  }, [q, cat, list, ver])

  const r = ROUNDS[round]
  const it = BY[r.id]
  const lo = Math.round(it.min * r.qty), hi = Math.round(it.max * r.qty)
  const mid = (lo + hi) / 2
  let acc = 100, verdict = 'Right inside the usual range.', direction: 'in' | 'over' | 'under' = 'in'
  if (guess > hi) { acc = Math.max(0, Math.round(100 - ((guess - hi) / mid) * 100)); verdict = `You guessed Tk ${guess - hi} above the usual price.`; direction = 'over' }
  if (guess < lo) { acc = Math.max(0, Math.round(100 - ((lo - guess) / mid) * 100)); verdict = `You guessed Tk ${lo - guess} below the usual price.`; direction = 'under' }
  const all = revealed ? [...scores, acc] : scores
  const avg = all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0
  const isLast = round === ROUNDS.length - 1
  const game = {
    ask: r.ask, id: r.id, bn: BN[r.id], realBn: tkBn(lo, hi), img: IMG[r.id], name: it.name, local: it.local, roundNo: round + 1, total: ROUNDS.length,
    guess, real: tk(lo, hi), lo, hi, verdict, acc, avg, revealed, done, copied, direction, scores: all,
    nextLabel: isLast ? 'See my score' : 'Next item',
    setGuess: (v: number) => { setGuess(v); setRevealed(false) },
    reveal: () => setRevealed(true),
    next: () => { const s2 = [...scores, acc]; setScores(s2); setRevealed(false); if (isLast) setDone(true); else { setRound(round + 1); setGuess(60) } },
    restart: () => { setRound(0); setScores([]); setDone(false); setRevealed(false); setGuess(60); setCopied(false) },
    copy: () => { try { navigator.clipboard.writeText(`My bazar sense on Bazar Dam: ${avg}%. Can you beat it?`) } catch { /* ignore */ } setCopied(true) },
  }

  let tlo = 0, thi = 0
  const rows = Object.entries(list).map(([id, n]) => {
    const i = BY[id]; const a = Math.round(i.min * n), b = Math.round(i.max * n); tlo += a; thi += b
    return { id, bn: BN[id], name: i.name, local: i.local, img: IMG[id], qty: qtyText(i, n), line: tk(a, b), n }
  })
  const carry = Math.ceil((thi * 1.1) / 50) * 50
  const guide = GUIDE.map((g) => ({ ...g, img: IMG[g.id] }))
  const seasonal = ITEMS.filter((i) => i.season).map((i) => ({ ...i, img: IMG[i.id], price: tk(i.min, i.max), per: UNIT[i.unit] }))
  const pick = (ids: string[]) => ids.map((id) => { const i = BY[id]; return { ...i, bn: BN[id], priceBn: tkBn(i.min, i.max), unitBn: UNIT_BN[i.unit], img: IMG[id], price: tk(i.min, i.max), per: UNIT[i.unit], inList: !!list[id] } })

  return {
    q, setQ, cat, setCat, cats: CATS, board, game, add, dec, drop, setAll: (l: Record<string, number>) => setList(l), raw: list,
    list: { rows, totalBn: tkBn(tlo, thi), carryBn: `${carry}`, total: tk(tlo, thi), lo: tlo, hi: thi, carry: `Tk ${carry}`, empty: rows.length === 0 },
    guide, seasonal, pick,
  }
}
export type Bazar = ReturnType<typeof useBazar>
