// Daily price updater for THOKAR চান্স NAI.
// Pulls Dhaka retail prices from official sources, sanity-checks them, and
// rewrites public/prices.json. Items no source covers keep their last value and date.
//
// Sources
//   TCB  - Trading Corporation of Bangladesh, daily retail market prices (Dhaka), Excel/PDF per working day
//   DAM  - Department of Agricultural Marketing, market daily price report (Dhaka markets)
//
// Run: node scripts/update-prices.mjs  (in CI the workflow first completes TCB/DAM's incomplete TLS chains via NODE_EXTRA_CA_CERTS)

import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from '@e965/xlsx'

const FILE = path.resolve('public/prices.json')
const DEBUG = process.env.DEBUG === '1'
const DRY = process.env.DRY === '1' // print what would change, write nothing
const log = (...a) => console.log('[prices]', ...a)
const dbg = (...a) => DEBUG && console.log('[debug]', ...a)

const bnDigits = '০১২৩৪৫৬৭৮৯'
const decode = (s) => String(s ?? '').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
const toLatin = (s) => decode(s).replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)))
// NFC + spelling folds so 'পেঁয়াজ'/'পিঁয়াজ', 'কাঁচামরিচ'/'কাঁচা মরিচ' and decomposed য় all compare equal
const norm = (s) => toLatin(s).normalize('NFC').replace(/\u09DF/g, '\u09AF\u09BC').replace(/ী/g, 'ি').replace(/িঁ/g, 'েঁ').replace(/\s+/g, '').trim()
const today = () => new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10) // Dhaka date

// Our item id -> Bangla names as they appear in government sheets (first match wins).
// "skip" patterns stop a looser name matching a different product (e.g. imported vs local).
const MATCH = {
  potato: { any: ['আলু'], skip: ['মিষ্টি', 'নতুন আলু'] },
  newpotato: { any: ['নতুন আলু'] },
  onion: { any: ['পেঁয়াজ (দেশি)', 'পেঁয়াজ দেশি', 'পেঁয়াজ - দেশি', 'পেয়াজ (দেশি)', 'পেঁয়াজ'], skip: ['আমদানি', 'পাতা'] },
  rosun: { any: ['রসুন (দেশি)', 'রসুন দেশি', 'রসুন - দেশি', 'রসুন'], skip: ['আমদানি'] },
  ada: { any: ['আদা (দেশি)', 'আদা দেশি', 'আদা - দেশি', 'আদা'], skip: ['আমদানি'] },
  chili: { any: ['কাঁচা মরিচ', 'কাচা মরিচ'], skip: ['শুকনা'] },
  tomato: { any: ['টমেটো'] },
  brinjal: { any: ['লম্বা বেগুন', 'বেগুন'] },
  cauliflower: { any: ['ফুলকপি'] },
  cabbage: { any: ['বাঁধাকপি', 'বাধাকপি'] },
  shim: { any: ['শিম', 'সীম'] },
  lau: { any: ['লাউ'], skip: ['শাক'] },
  korola: { any: ['করলা'] },
  potol: { any: ['পটল'] },
  dherosh: { any: ['ঢেঁড়স', 'ঢেড়স', 'ভেন্ডি'] },
  chichinga: { any: ['চিচিঙ্গা'] },
  jhinga: { any: ['ঝিঙ্গা', 'ঝিঙা'] },
  kakrol: { any: ['কাঁকরোল', 'কাকরোল'] },
  borboti: { any: ['বরবটি'] },
  pepe: { any: ['কাঁচা পেঁপে', 'পেঁপে (কাঁচা)', 'পেপে'], skip: ['পাকা'] },
  kacha_kola: { any: ['কাঁচা কলা'] },
  gajor: { any: ['গাজর'] },
  mula: { any: ['মুলা'], skip: ['শাক'] },
  kumra: { any: ['মিষ্টি কুমড়া', 'মিষ্টিকুমড়া'] },
  chal_kumra: { any: ['চাল কুমড়া', 'চালকুমড়া'] },
  shosha: { any: ['শসা'] },
  kochu: { any: ['কচু'], skip: ['লতি', 'শাক'] },
  kochur_loti: { any: ['কচুর লতি'] },
  capsicum: { any: ['ক্যাপসিকাম'] },
  misti_alu: { any: ['মিষ্টি আলু'] },
  motorshuti: { any: ['মটরশুঁটি', 'মটরশুটি'] },
  lalshak: { any: ['লাল শাক'] },
  palong: { any: ['পালং শাক', 'পালংশাক'] },
  pui: { any: ['পুঁই শাক', 'পুইশাক'] },
  kolmi: { any: ['কলমি শাক'] },
  lebu: { any: ['লেবু'] },
  peyara: { any: ['পেয়ারা'] },
  malta: { any: ['মাল্টা'] },
  komola: { any: ['কমলা'] },
  apel: { any: ['আপেল'] },
  angur: { any: ['আঙ্গুর', 'আঙুর'] },
  dalim: { any: ['ডালিম', 'আনার'] },
  pepe_paka: { any: ['পাকা পেঁপে'] },
  kola: { any: ['সাগর কলা', 'কলা (সাগর)'] },
  dab: { any: ['ডাব'] },
  anaros: { any: ['আনারস'] },
  boroi: { any: ['বরই', 'কুল'] },
  khejur: { any: ['খেজুর'] },
}

/** The row for an item, or null. */
function findRow(rows, id) {
  const m = MATCH[id]
  for (const pat of m.any) {
    const p = norm(pat)
    const row = rows.find(([name]) => name.length < 40 && name.includes(p) && !(m.skip || []).some((s) => name.includes(norm(s))))
    if (row) return row
  }
  return null
}
/** Find an item in a list of [name, numbers[]] rows. Returns {min,max} or null. */
function pick(rows, id) {
  const m = MATCH[id]
  for (const pat of m.any) {
    const p = norm(pat)
    // long labels are report commentary ("…এর মূল্য বৃদ্ধি পেয়েছে"), not price rows
    const row = rows.find(([name]) => name.length < 40 && name.includes(p) && !(m.skip || []).some((s) => name.includes(norm(s))))
    if (row) {
      const nums = row[1].filter((n) => n > 0 && n < 5000)
      if (nums.length >= 2) return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) }
      if (nums.length === 1) return { min: nums[0], max: nums[0] }
    }
  }
  return null
}

/** Turn cell text into numbers: "৫০-৫৫" -> [50, 55]. */
function numbersIn(cells) {
  const out = []
  for (const c of cells) {
    const t = toLatin(c).replace(/,/g, '')
    for (const n of t.match(/\d+(\.\d+)?/g) || []) out.push(Number(n))
  }
  return out
}

async function get(url, as = 'text') {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (thokar-chance-nai price bot; +https://github.com/bp9889/thokar-chance-nai)' }, signal: AbortSignal.timeout(45000) })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return as === 'buf' ? Buffer.from(await r.arrayBuffer()) : r.text()
}
const absolute = (href, base) => new URL(href.replace(/&amp;/g, '&'), base).toString()

// ---------------- TCB ----------------
async function fromTCB() {
  const listUrl = process.env.TCB_LIST_URL || 'https://tcb.gov.bd/pages/daily-rmps'
  const html = await get(listUrl)
  const links = [...html.matchAll(/href="([^"]+\.(?:xlsx|xls|pdf))"/gi)].map((m) => absolute(m[1], listUrl))
  dbg('TCB links', links.slice(0, 8))
  const xl = links.find((l) => /\.xlsx?$/i.test(l))
  if (!xl) throw new Error('TCB: no Excel link on the listing page')
  const wb = XLSX.read(await get(xl, 'buf'), { type: 'buffer' })
  const rows = []
  for (const name of wb.SheetNames) {
    for (const r of XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: '' })) {
      const cells = r.map((c) => String(c))
      const label = cells.find((c) => /[ঀ-৿]/.test(c))
      if (!label) continue
      const after = cells.slice(cells.indexOf(label) + 1)
      rows.push([norm(label), numbersIn(after)])
    }
  }
  // Report date: the first dd/mm/yyyy or dd-mm-yyyy in the sheet, else the file name, else today.
  const flat = rows.map((r) => r[0]).join(' ') + ' ' + xl
  const dm = toLatin(flat).match(/(\d{1,2})[./-](\d{1,2})[./-](20\d\d)/)
  const date = dm ? `${dm[3]}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}` : today()
  dbg('TCB file', xl, 'rows:', rows.map((r) => `${r[0]} ${r[1].slice(0, 4).join('/')}`).join(' | '))
  return { name: 'TCB', url: xl, date, rows }
}

// ---------------- DAM ----------------
// The DAM portal's daily report is a POST form (division → district → upazila → market, price type, date)
// whose dropdowns load over AJAX. Walk that chain for Dhaka district, then ask for retail (খুচরা) prices.
// gov servers are slow at times: try a request up to 3 times
async function retry(fn, what, n = 3) {
  for (let i = 1; ; i++) {
    try { return await fn() } catch (e) { if (i >= n) throw new Error(`${what}: ${e.message}`); log(`${what} attempt ${i} failed (${e.message}), retrying`); await new Promise((r) => setTimeout(r, 5000 * i)) }
  }
}
const opts = (html) => [...html.matchAll(/<option[^>]*value=["']?([^"'>]+?)["']?\s*>([^<]*)</gi)].map((m) => [m[1].trim(), toLatin(m[2]).replace(/&nbsp;/g, ' ').trim()]).filter(([v]) => v && v !== '0')
async function fromDAM() {
  const base = process.env.DAM_BASE || 'https://market.dam.gov.bd/'
  const page = base + 'market_daily_price_report'
  const UA = { 'user-agent': 'Mozilla/5.0 (thokar-chance-nai price bot; +https://github.com/bp9889/thokar-chance-nai)' }
  const first = await retry(() => fetch(page, { headers: UA, signal: AbortSignal.timeout(90000) }), 'DAM page')
  const cookie = (first.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ')
  const html = await first.text()
  const token = html.match(/name="csrf_webspice_tkn"\s+value="([^"]+)"/)?.[1] || ''
  let tok = token
  const refresh = async () => { const h = await (await fetch(page, { headers: { ...UA, cookie }, signal: AbortSignal.timeout(45000) })).text(); tok = h.match(/name="csrf_webspice_tkn"\s+value="([^"]+)"/)?.[1] || tok }
  const post = async (url, pairs) => {
    const body = new URLSearchParams([['csrf_webspice_tkn', tok], ...pairs])
    const r = await retry(() => fetch(url, { method: 'POST', body, headers: { ...UA, cookie, 'x-requested-with': 'XMLHttpRequest', 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', referer: page }, signal: AbortSignal.timeout(180000) }), url.replace(base, 'DAM /'), 2)
    if (!r.ok) throw new Error(`${r.status} ${url}`)
    return r.text()
  }
  const many = (key, vals) => vals.map((v) => [key, v])
  const rawDiv = await post(base + 'get_division_list_ban', [])
  dbg('DAM division list raw', rawDiv.slice(0, 400))
  const divs = opts(rawDiv)
  const div = divs.find(([, n]) => n.startsWith('ঢাকা'))
  const dists = div ? opts(await post(base + 'get_district_list_ban', [['data_id[]', div[0]]])) : []
  const dist = dists.find(([, n]) => n === 'ঢাকা')
  // Dhaka city only (ঢাকা সদর): Karwan Bazar, Shyambazar, Tejgaon, Mirpur-1, New Market, …
  const subs = dist ? opts(await post(base + 'get_subdistrict_list_ban', [['data_id[]', dist[0]]])).filter(([, n]) => n.includes('সদর')) : []
  const markets = subs.length ? opts(await post(base + 'get_market_list_ban', many('data_id[]', subs.map((x) => x[0])))) : []
  dbg('DAM chain', { token: !!token, cookie: !!cookie, div, dist, subs: subs.map((x) => x[1]), markets: markets.map((x) => x[1]) })
  if (!markets.length) throw new Error('DAM: could not load Dhaka markets')

  // Try the last few days (reports land late in the day and skip holidays).
  const fmts = (d) => { const [y, m, dd] = d.split('-'); return [`${dd}-${m}-${y}`, `${y}-${m}-${dd}`, `${dd}/${m}/${y}`] }
  for (let back = 0; back < 5; back++) {
    const d = new Date(Date.parse(today()) - back * 864e5).toISOString().slice(0, 10)
    for (const date of fmts(d)) {
      await refresh()
      const t0 = Date.now()
      const out = await post(page, [
        ['Division_id[]', div[0]], ['District_id[]', dist[0]],
        ...many('Subdistrict_id[]', subs.map((x) => x[0])), ...many('Market_id[]', markets.map((x) => x[0])),
        ['PriceType_id[]', '4'], ['date', date], ['filter', 'Generate Report'],
      ])
      const table = []
      for (const tr of out.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
        const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => toLatin(m[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')).replace(/\s+/g, ' ').trim())
        if (cells.some((c) => /[ঀ-৿]/.test(c)) && cells.some((c) => /\d/.test(c))) table.push(cells)
      }
      dbg(`DAM ${date} (${Math.round((Date.now() - t0) / 1000)}s): ${out.length} bytes, ${table.length} rows`, table.slice(0, 12).map((c) => c.join(' | ')))
      if (DEBUG && back === 0 && date === fmts(d)[0]) {
        const txt = toLatin(out.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
        dbg('DAM response title:', out.match(/<title>([^<]*)/)?.[1], 'text:', txt.slice(2500, 4500))
        dbg('DAM datepicker config:', (html.match(/date_picker[\s\S]{0,300}/g) || []).map((x) => x.replace(/\s+/g, ' ')).slice(0, 4))
        dbg('DAM tables in response:', (out.match(/<table[^>]*>/gi) || []).length, 'iframes/links:', (out.match(/(iframe|href)="[^"]*report[^"]*"/gi) || []).slice(0, 8))
      }
      if (table.length < 5) continue
      // Several markets per item: group by item name, take the median min and median max.
      const by = new Map()
      for (const cells of table) {
        const label = cells.find((c) => /[ঀ-৿]/.test(c) && !markets.some(([, n]) => n === c))
        if (!label) continue
        const nums = numbersIn(cells.slice(cells.indexOf(label) + 1)).filter((n) => n > 0 && n < 5000 && !(n > 2000 && n < 2100))
        if (nums.length < 2) continue
        const k = norm(label)
        if (!by.has(k)) by.set(k, [])
        by.get(k).push([Math.min(nums[0], nums[1]), Math.max(nums[0], nums[1])])
      }
      const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)] }
      const rows = [...by].map(([k, v]) => [k, [med(v.map((x) => x[0])), med(v.map((x) => x[1]))]])
      dbg('DAM items', rows.map(([k, n]) => `${k} ${n.join('-')}`).join(' | '))
      return { name: 'DAM', url: page, date: d, rows }
    }
  }
  throw new Error('DAM: no report rows for the last 5 days')
}

// ---------------- merge ----------------
function sane(prev, next) {
  if (!next || !(next.min > 0) || next.max < next.min) return false
  if (next.max > next.min * 3) return false // a range this wide is almost certainly a parse error
  if (!prev) return true
  const mid = (prev.min + prev.max) / 2, nmid = (next.min + next.max) / 2
  return nmid > mid / 3 && nmid < mid * 3 // a 3x jump overnight means we read the wrong row or unit
}

async function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'))
  const results = []
  // DAM's report form doesn't return data to scripts yet; enable with DAM=1 once that's sorted
  for (const fn of process.env.DAM === '1' ? [fromTCB, fromDAM] : [fromTCB]) {
    try { const r = await fn(); results.push(r); log(`${r.name}: ${r.rows.length} rows, report date ${r.date}`) } catch (e) { log(`${fn.name} failed: ${e.message}${e.cause ? ' (' + (e.cause.code || e.cause.message) + ')' : ''}`) }
  }
  let changed = 0
  const touched = []
  for (const id of Object.keys(MATCH)) {
    const prev = data.items[id]
    if (!prev) continue
    for (const src of results) { // later sources (DAM, market-level) override TCB when both have the item
      const got = pick(src.rows, id)
      if (!got) continue
      if (!sane(prev, got)) { log(`skip ${id}: ${JSON.stringify(got)} looks wrong vs ${prev.min}-${prev.max}`); continue }
      // TCB rows also carry last week's, last month's and last year's range: today min/max, week min/max,
      // month min/max, month change %, year min/max, year change %.
      const raw = src.name === 'TCB' ? findRow(src.rows, id)?.[1] || [] : []
      const pair = (a, b) => (a > 0 && b > 0 && b >= a && sane(got, { min: a, max: b }) ? [a, b] : undefined)
      const hist = { week: pair(raw[2], raw[3]), month: pair(raw[4], raw[5]), year: pair(raw[7], raw[8]) }
      const histNew = JSON.stringify(hist), histOld = JSON.stringify({ week: prev.week, month: prev.month, year: prev.year })
      if (prev.min !== got.min || prev.max !== got.max || prev.date !== src.date || (raw.length && histNew !== histOld)) changed++
      Object.assign(prev, got, { date: src.date, source: src.name })
      if (raw.length) { delete prev.week; delete prev.month; delete prev.year; for (const [k, v] of Object.entries(hist)) if (v) prev[k] = v }
      touched.push(`${id}=${got.min}-${got.max} (${src.name})`)
    }
  }
  for (const src of results) {
    if (data.sources[src.name]?.date !== src.date) changed++
    data.sources[src.name] = { url: src.url, date: src.date }
  }
  log(`matched ${touched.length} items:`, touched.join(', '))
  for (const src of results) for (const id of Object.keys(MATCH)) { const row = findRow(src.rows, id); if (row) dbg(`${src.name} ${id} full:`, row[0], JSON.stringify(row[1])) }
  if (!changed) { log('no new report or price changes; prices.json left as is'); return }
  data.updated = today()
  if (DRY) { log(`dry run: ${changed} changes not written`); return }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 1) + '\n')
  log(`${changed} changes written`)
  if (!results.length) process.exitCode = 0 // keep last good data; the site shows dates
}

main()
