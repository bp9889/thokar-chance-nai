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
const log = (...a) => console.log('[prices]', ...a)
const dbg = (...a) => DEBUG && console.log('[debug]', ...a)

const bnDigits = '০১২৩৪৫৬৭৮৯'
const toLatin = (s) => String(s ?? '').replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)))
const norm = (s) => toLatin(s).replace(/\s+/g, ' ').replace(/ী/g, 'ি').replace(/িঁ/g, 'েঁ').trim()
const today = () => new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10) // Dhaka date

// Our item id -> Bangla names as they appear in government sheets (first match wins).
// "skip" patterns stop a looser name matching a different product (e.g. imported vs local).
const MATCH = {
  potato: { any: ['আলু'], skip: ['মিষ্টি', 'নতুন'] },
  newpotato: { any: ['নতুন আলু'] },
  onion: { any: ['পেঁয়াজ (দেশি)', 'পেঁয়াজ দেশি', 'পেঁয়াজ - দেশি', 'পেয়াজ (দেশি)', 'পেঁয়াজ'], skip: ['আমদানি', 'পাতা'] },
  rosun: { any: ['রসুন (দেশি)', 'রসুন দেশি', 'রসুন - দেশি', 'রসুন'], skip: ['আমদানি'] },
  ada: { any: ['আদা (দেশি)', 'আদা দেশি', 'আদা - দেশি', 'আদা'], skip: ['আমদানি'] },
  chili: { any: ['কাঁচা মরিচ', 'কাচা মরিচ'] },
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

/** Find an item in a list of [name, numbers[]] rows. Returns {min,max} or null. */
function pick(rows, id) {
  const m = MATCH[id]
  for (const pat of m.any) {
    const p = norm(pat)
    const row = rows.find(([name]) => name.includes(p) && !(m.skip || []).some((s) => name.includes(norm(s))))
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
// The DAM portal's daily report is a form (division, district, upazila, market, price type, date).
// This tries the Dhaka markets it can discover; set DEBUG=1 to print the form so the mapping can be tuned.
async function fromDAM() {
  const base = process.env.DAM_BASE || 'https://market.dam.gov.bd/'
  const html = await get(base + 'market_daily_price_report')
  const forms = [...html.matchAll(/<form[^>]*action="([^"]*)"[^>]*>/gi)].map((m) => m[1])
  const selects = [...html.matchAll(/<select[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi)].map((m) => ({ name: m[1], options: [...m[2].matchAll(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)</gi)].map((o) => [o[1], o[2].trim()]).slice(0, 40) }))
  const scripts = [...html.matchAll(/(url\s*:\s*['"][^'"]+['"]|\.(?:get|post)\(\s*['"][^'"]+['"])/gi)].map((m) => m[1])
  dbg('DAM forms', forms, 'selects', JSON.stringify(selects).slice(0, 3000), 'ajax', scripts.slice(0, 20))
  // Rows from any price table already on the page (the portal shows recent prices for common items).
  const rows = []
  for (const tr of html.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
    const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').trim())
    const label = cells.find((c) => /[ঀ-৿]/.test(c))
    if (label) rows.push([norm(label), numbersIn(cells.slice(cells.indexOf(label) + 1))])
  }
  dbg('DAM rows', rows.slice(0, 20))
  if (!rows.length) throw new Error('DAM: no price rows found on the page yet')
  return { name: 'DAM', url: base + 'market_daily_price_report', date: today(), rows }
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
  for (const fn of [fromTCB, fromDAM]) {
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
      if (prev.min !== got.min || prev.max !== got.max || prev.date !== src.date) changed++
      Object.assign(prev, got, { date: src.date, source: src.name })
      touched.push(`${id}=${got.min}-${got.max} (${src.name})`)
    }
  }
  for (const src of results) {
    if (data.sources[src.name]?.date !== src.date) changed++
    data.sources[src.name] = { url: src.url, date: src.date }
  }
  log(`matched ${touched.length} items:`, touched.join(', '))
  if (!changed) { log('no new report or price changes; prices.json left as is'); return }
  data.updated = today()
  fs.writeFileSync(FILE, JSON.stringify(data, null, 1) + '\n')
  log(`${changed} changes written`)
  if (!results.length) process.exitCode = 0 // keep last good data; the site shows dates
}

main()
