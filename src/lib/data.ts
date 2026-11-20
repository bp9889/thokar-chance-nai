const svgs = import.meta.glob('../assets/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const IMG: Record<string, string> = {}
for (const [p, url] of Object.entries(svgs)) IMG[p.split('/').pop()!.replace('.svg', '')] = url

export type Unit = 'kg' | 'piece' | 'bundle' | 'hali' | 'g100'
export type Item = { id: string; name: string; local: string; cat: 'veg' | 'leaf' | 'fruit' | 'spice'; unit: Unit; min: number; max: number; src: boolean; season: boolean; off: string; date?: string | null; source?: string; week?: [number, number]; month?: [number, number]; year?: [number, number] }

// Preview data. src:true = Dhaka market reports, 13 to 16 Nov 2026. src:false = placeholder estimate.
export const ITEMS: Item[] = [
  { id: 'potato', name: 'Potato', local: 'Alu', cat: 'veg', unit: 'kg', min: 28, max: 30, src: true, season: false, off: '' },
  { id: 'newpotato', name: 'New potato', local: 'Notun alu', cat: 'veg', unit: 'kg', min: 140, max: 150, src: true, season: true, off: '' },
  { id: 'onion', name: 'Onion, local', local: 'Deshi peyaj', cat: 'veg', unit: 'kg', min: 40, max: 55, src: true, season: false, off: '' },
  { id: 'tomato', name: 'Tomato', local: 'Tomato', cat: 'veg', unit: 'kg', min: 80, max: 150, src: true, season: true, off: '' },
  { id: 'cauliflower', name: 'Cauliflower', local: 'Fulkopi', cat: 'veg', unit: 'piece', min: 30, max: 40, src: true, season: true, off: '' },
  { id: 'cabbage', name: 'Cabbage', local: 'Badhakopi', cat: 'veg', unit: 'piece', min: 30, max: 40, src: true, season: true, off: '' },
  { id: 'brinjal', name: 'Long brinjal', local: 'Lomba begun', cat: 'veg', unit: 'kg', min: 60, max: 100, src: true, season: false, off: '' },
  { id: 'chili', name: 'Green chilli', local: 'Kacha morich', cat: 'veg', unit: 'kg', min: 100, max: 140, src: true, season: false, off: '' },
  { id: 'shim', name: 'Flat beans', local: 'Shim', cat: 'veg', unit: 'kg', min: 50, max: 80, src: true, season: true, off: '' },
  { id: 'lau', name: 'Bottle gourd', local: 'Lau', cat: 'veg', unit: 'kg', min: 60, max: 70, src: true, season: true, off: '' },
  { id: 'korola', name: 'Bitter gourd', local: 'Korola', cat: 'veg', unit: 'kg', min: 60, max: 80, src: true, season: false, off: '' },
  { id: 'potol', name: 'Pointed gourd', local: 'Potol', cat: 'veg', unit: 'kg', min: 50, max: 60, src: true, season: false, off: '' },
  { id: 'dherosh', name: 'Okra', local: 'Dherosh', cat: 'veg', unit: 'kg', min: 50, max: 60, src: true, season: false, off: '' },
  { id: 'chichinga', name: 'Snake gourd', local: 'Chichinga', cat: 'veg', unit: 'kg', min: 50, max: 60, src: true, season: false, off: '' },
  { id: 'jhinga', name: 'Ridge gourd', local: 'Jhinga', cat: 'veg', unit: 'kg', min: 60, max: 80, src: true, season: false, off: '' },
  { id: 'kakrol', name: 'Teasel gourd', local: 'Kakrol', cat: 'veg', unit: 'kg', min: 80, max: 100, src: false, season: false, off: '' },
  { id: 'borboti', name: 'Yardlong beans', local: 'Borboti', cat: 'veg', unit: 'kg', min: 60, max: 80, src: true, season: false, off: '' },
  { id: 'pepe', name: 'Green papaya', local: 'Kacha pepe', cat: 'veg', unit: 'kg', min: 25, max: 30, src: true, season: false, off: '' },
  { id: 'kacha_kola', name: 'Green banana', local: 'Kacha kola', cat: 'veg', unit: 'hali', min: 40, max: 40, src: true, season: false, off: '' },
  { id: 'gajor', name: 'Carrot', local: 'Gajor', cat: 'veg', unit: 'kg', min: 120, max: 130, src: true, season: true, off: '' },
  { id: 'mula', name: 'Radish', local: 'Mula', cat: 'veg', unit: 'kg', min: 40, max: 60, src: true, season: true, off: '' },
  { id: 'kumra', name: 'Pumpkin', local: 'Misti kumra', cat: 'veg', unit: 'kg', min: 40, max: 50, src: true, season: false, off: '' },
  { id: 'chal_kumra', name: 'Ash gourd', local: 'Chal kumra', cat: 'veg', unit: 'piece', min: 50, max: 60, src: false, season: false, off: '' },
  { id: 'shosha', name: 'Cucumber', local: 'Shosha', cat: 'veg', unit: 'kg', min: 70, max: 80, src: true, season: false, off: '' },
  { id: 'kochu', name: 'Taro', local: 'Kochu', cat: 'veg', unit: 'kg', min: 40, max: 50, src: true, season: false, off: '' },
  { id: 'kochur_loti', name: 'Taro stolon', local: 'Kochur loti', cat: 'veg', unit: 'kg', min: 80, max: 80, src: true, season: false, off: '' },
  { id: 'capsicum', name: 'Capsicum', local: 'Capsicum', cat: 'veg', unit: 'kg', min: 300, max: 300, src: true, season: true, off: '' },
  { id: 'misti_alu', name: 'Sweet potato', local: 'Misti alu', cat: 'veg', unit: 'kg', min: 40, max: 60, src: false, season: true, off: '' },
  { id: 'motorshuti', name: 'Green peas', local: 'Motorshuti', cat: 'veg', unit: 'kg', min: 120, max: 160, src: false, season: true, off: '' },
  { id: 'broccoli', name: 'Broccoli', local: 'Broccoli', cat: 'veg', unit: 'piece', min: 60, max: 80, src: false, season: true, off: '' },
  { id: 'beet', name: 'Beetroot', local: 'Beet', cat: 'veg', unit: 'kg', min: 80, max: 100, src: false, season: true, off: '' },
  { id: 'olkopi', name: 'Kohlrabi', local: 'Olkopi', cat: 'veg', unit: 'kg', min: 60, max: 80, src: false, season: true, off: '' },
  { id: 'mocha', name: 'Banana flower', local: 'Mocha', cat: 'veg', unit: 'piece', min: 30, max: 40, src: false, season: false, off: '' },
  { id: 'sajna', name: 'Drumstick', local: 'Sajna', cat: 'veg', unit: 'kg', min: 0, max: 0, src: false, season: false, off: 'Boshonto' },
  { id: 'echor', name: 'Raw jackfruit', local: 'Echor', cat: 'veg', unit: 'kg', min: 0, max: 0, src: false, season: false, off: 'Grishmo' },
  { id: 'lalshak', name: 'Red amaranth', local: 'Lal shak', cat: 'leaf', unit: 'bundle', min: 15, max: 20, src: true, season: true, off: '' },
  { id: 'kolmi', name: 'Water spinach', local: 'Kolmi shak', cat: 'leaf', unit: 'bundle', min: 10, max: 20, src: true, season: false, off: '' },
  { id: 'pui', name: 'Malabar spinach', local: 'Pui shak', cat: 'leaf', unit: 'bundle', min: 30, max: 40, src: true, season: false, off: '' },
  { id: 'palong', name: 'Spinach', local: 'Palong shak', cat: 'leaf', unit: 'bundle', min: 25, max: 25, src: true, season: true, off: '' },
  { id: 'data', name: 'Stem amaranth', local: 'Data shak', cat: 'leaf', unit: 'bundle', min: 20, max: 20, src: true, season: false, off: '' },
  { id: 'laushak', name: 'Bottle gourd leaves', local: 'Lau shak', cat: 'leaf', unit: 'bundle', min: 30, max: 40, src: false, season: false, off: '' },
  { id: 'mulashak', name: 'Radish leaves', local: 'Mula shak', cat: 'leaf', unit: 'bundle', min: 15, max: 20, src: false, season: true, off: '' },
  { id: 'kochushak', name: 'Taro leaves', local: 'Kochu shak', cat: 'leaf', unit: 'bundle', min: 15, max: 20, src: false, season: false, off: '' },
  { id: 'dhonepata', name: 'Coriander leaves', local: 'Dhonepata', cat: 'spice', unit: 'g100', min: 30, max: 40, src: false, season: true, off: '' },
  { id: 'ada', name: 'Ginger', local: 'Ada', cat: 'spice', unit: 'kg', min: 150, max: 200, src: false, season: false, off: '' },
  { id: 'rosun', name: 'Garlic, local', local: 'Deshi rosun', cat: 'spice', unit: 'kg', min: 150, max: 200, src: false, season: false, off: '' },
  { id: 'lebu', name: 'Lime', local: 'Lebu', cat: 'spice', unit: 'hali', min: 20, max: 40, src: false, season: false, off: '' },
  { id: 'peyara', name: 'Guava', local: 'Peyara', cat: 'fruit', unit: 'kg', min: 70, max: 100, src: false, season: false, off: '' },
  { id: 'malta', name: 'Malta', local: 'Malta', cat: 'fruit', unit: 'kg', min: 350, max: 400, src: true, season: true, off: '' },
  { id: 'komola', name: 'Orange', local: 'Komola', cat: 'fruit', unit: 'kg', min: 350, max: 400, src: false, season: true, off: '' },
  { id: 'apel', name: 'Apple', local: 'Apel', cat: 'fruit', unit: 'kg', min: 350, max: 450, src: true, season: false, off: '' },
  { id: 'angur', name: 'Grapes', local: 'Angur', cat: 'fruit', unit: 'kg', min: 450, max: 500, src: false, season: false, off: '' },
  { id: 'dalim', name: 'Pomegranate', local: 'Dalim', cat: 'fruit', unit: 'kg', min: 450, max: 500, src: false, season: false, off: '' },
  { id: 'naspati', name: 'Pear', local: 'Naspati', cat: 'fruit', unit: 'kg', min: 330, max: 400, src: false, season: false, off: '' },
  { id: 'pepe_paka', name: 'Ripe papaya', local: 'Paka pepe', cat: 'fruit', unit: 'kg', min: 100, max: 120, src: false, season: false, off: '' },
  { id: 'kola', name: 'Banana, sagor', local: 'Sagor kola', cat: 'fruit', unit: 'hali', min: 40, max: 60, src: false, season: false, off: '' },
  { id: 'dab', name: 'Green coconut', local: 'Dab', cat: 'fruit', unit: 'piece', min: 150, max: 220, src: true, season: false, off: '' },
  { id: 'anaros', name: 'Pineapple', local: 'Anaros', cat: 'fruit', unit: 'piece', min: 40, max: 70, src: false, season: false, off: '' },
  { id: 'jolpai', name: 'Olive', local: 'Jolpai', cat: 'fruit', unit: 'kg', min: 40, max: 50, src: true, season: true, off: '' },
  { id: 'boroi', name: 'Jujube', local: 'Boroi', cat: 'fruit', unit: 'kg', min: 100, max: 120, src: false, season: true, off: '' },
  { id: 'amloki', name: 'Amla', local: 'Amloki', cat: 'fruit', unit: 'kg', min: 200, max: 240, src: false, season: true, off: '' },
  { id: 'kamranga', name: 'Star fruit', local: 'Kamranga', cat: 'fruit', unit: 'kg', min: 60, max: 80, src: false, season: false, off: '' },
  { id: 'sofeda', name: 'Sapodilla', local: 'Sofeda', cat: 'fruit', unit: 'kg', min: 120, max: 150, src: false, season: false, off: '' },
  { id: 'ata', name: 'Custard apple', local: 'Ata', cat: 'fruit', unit: 'kg', min: 0, max: 0, src: false, season: false, off: 'Shorot' },
  { id: 'khejur', name: 'Dates', local: 'Khejur', cat: 'fruit', unit: 'kg', min: 600, max: 900, src: false, season: false, off: '' },
  { id: 'aam', name: 'Mango', local: 'Aam', cat: 'fruit', unit: 'kg', min: 0, max: 0, src: false, season: false, off: 'Grishmo' },
  { id: 'kathal', name: 'Jackfruit', local: 'Kathal', cat: 'fruit', unit: 'piece', min: 0, max: 0, src: false, season: false, off: 'Grishmo' },
  { id: 'lichu', name: 'Litchi', local: 'Lichu', cat: 'fruit', unit: 'kg', min: 0, max: 0, src: false, season: false, off: 'Grishmo' },
  { id: 'tormuj', name: 'Watermelon', local: 'Tormuj', cat: 'fruit', unit: 'kg', min: 0, max: 0, src: false, season: false, off: 'Boshonto' },
  { id: 'jam', name: 'Black plum', local: 'Jam', cat: 'fruit', unit: 'kg', min: 0, max: 0, src: false, season: false, off: 'Grishmo' }
]
export const BN: Record<string, string> = { "potato": 'আলু', "newpotato": 'নতুন আলু', "onion": 'দেশি পেঁয়াজ', "tomato": 'টমেটো', "cauliflower": 'ফুলকপি', "cabbage": 'বাঁধাকপি', "brinjal": 'লম্বা বেগুন', "chili": 'কাঁচা মরিচ', "shim": 'শিম', "lau": 'লাউ', "korola": 'করলা', "potol": 'পটল', "dherosh": 'ঢেঁড়স', "chichinga": 'চিচিঙ্গা', "jhinga": 'ঝিঙ্গা', "kakrol": 'কাঁকরোল', "borboti": 'বরবটি', "pepe": 'কাঁচা পেঁপে', "kacha_kola": 'কাঁচা কলা', "gajor": 'গাজর', "mula": 'মুলা', "kumra": 'মিষ্টি কুমড়া', "chal_kumra": 'চাল কুমড়া', "shosha": 'শসা', "kochu": 'কচু', "kochur_loti": 'কচুর লতি', "capsicum": 'ক্যাপসিকাম', "misti_alu": 'মিষ্টি আলু', "motorshuti": 'মটরশুঁটি', "broccoli": 'ব্রকলি', "beet": 'বিট', "olkopi": 'ওলকপি', "mocha": 'মোচা', "sajna": 'সজনে', "echor": 'এঁচোড়', "lalshak": 'লাল শাক', "kolmi": 'কলমি শাক', "pui": 'পুঁই শাক', "palong": 'পালং শাক', "data": 'ডাটা শাক', "laushak": 'লাউ শাক', "mulashak": 'মুলা শাক', "kochushak": 'কচু শাক', "dhonepata": 'ধনেপাতা', "ada": 'আদা', "rosun": 'দেশি রসুন', "lebu": 'লেবু', "peyara": 'পেয়ারা', "malta": 'মাল্টা', "komola": 'কমলা', "apel": 'আপেল', "angur": 'আঙুর', "dalim": 'ডালিম', "naspati": 'নাশপাতি', "pepe_paka": 'পাকা পেঁপে', "kola": 'সাগর কলা', "dab": 'ডাব', "anaros": 'আনারস', "jolpai": 'জলপাই', "boroi": 'বরই', "amloki": 'আমলকী', "kamranga": 'কামরাঙা', "sofeda": 'সফেদা', "ata": 'আতা', "khejur": 'খেজুর', "aam": 'আম', "kathal": 'কাঁঠাল', "lichu": 'লিচু', "tormuj": 'তরমুজ', "jam": 'জাম' }
const bnDigits = '০১২৩৪৫৬৭৮৯'
export const toBn = (v: number | string) => String(v).replace(/[0-9]/g, (d) => bnDigits[Number(d)])
export const tkBn = (a: number, b: number) => (a === b ? `${toBn(a)} টাকা` : `${toBn(a)}–${toBn(b)} টাকা`)
export const UNIT_BN: Record<Unit, string> = { kg: 'কেজি', piece: 'পিস', bundle: 'আঁটি', hali: 'হালি', g100: '১০০ গ্রাম' }
export const BY: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]))

export const ROUNDS = [
  { id: 'potato', qty: 0.5, ask: 'Half a kilo of potatoes' },
  { id: 'cauliflower', qty: 1, ask: 'One cauliflower' },
  { id: 'chili', qty: 0.25, ask: '250 grams of green chillies' },
  { id: 'tomato', qty: 0.5, ask: 'Half a kilo of tomatoes' },
  { id: 'lalshak', qty: 1, ask: 'One bundle of red amaranth' },
]
export const GUIDE = [
  { id: 'potato', title: 'Half a kilo of potatoes', count: 5, text: 'About 4 to 5 medium potatoes' },
  { id: 'onion', title: 'Half a kilo of onions', count: 7, text: 'About 6 to 8 small local onions' },
  { id: 'tomato', title: 'Half a kilo of tomatoes', count: 5, text: 'About 4 to 5 medium tomatoes' },
  { id: 'korola', title: 'Half a kilo of bitter gourd', count: 4, text: 'About 3 to 4 medium ones' },
]
export const UNIT: Record<Unit, string> = { kg: 'per kg', piece: 'each', bundle: 'per bundle', hali: 'per hali (4)', g100: 'per 100 g' }
export const CATS = [
  { id: 'all', label: 'Sob' },
  { id: 'season', label: 'Ekhon season e' },
  { id: 'veg', label: 'Sobji' },
  { id: 'leaf', label: 'Shak' },
  { id: 'fruit', label: 'Fol' },
  { id: 'spice', label: 'Moshla' },
]
export const UPDATED = 'Preview data from Dhaka market reports, Oct to Nov 2026'
export const tk = (a: number, b: number) => (a === b ? `Tk ${a}` : `Tk ${a}–${b}`)
export function qtyText(i: Item, q: number) {
  if (i.unit === 'kg') return q < 1 ? `${Math.round(q * 1000)} g` : `${q} kg`
  if (i.unit === 'piece') return `${q} ${q === 1 ? 'piece' : 'pieces'}`
  if (i.unit === 'bundle') return `${q} ${q === 1 ? 'bundle' : 'bundles'}`
  if (i.unit === 'g100') return `${q * 100} g`
  return `${q} hali`
}
export const ASK_BN: Record<string, string> = { potato: 'আধা কেজি আলু', cauliflower: 'একটা ফুলকপি', chili: '২৫০ গ্রাম কাঁচা মরিচ', tomato: 'আধা কেজি টমেটো', lalshak: 'এক আঁটি লাল শাক' }
export const GUIDE_BN: Record<string, string> = { potato: 'আধা কেজি আলু, মোটামুটি ৪–৫টা মাঝারি', onion: 'আধা কেজি পেঁয়াজ, মোটামুটি ৬–৮টা ছোট দেশি', tomato: 'আধা কেজি টমেটো, মোটামুটি ৪–৫টা মাঝারি', korola: 'আধা কেজি করলা, মোটামুটি ৩–৪টা' }
export const CAT_BN: Record<string, string> = { all: 'সব', season: 'এই মৌসুমে', veg: 'সবজি', leaf: 'শাক', fruit: 'ফল' }

/** Dhaka "today" as YYYY-MM-DD. */
export const dhakaToday = () => new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10)
export type Live = { updated: string; sources: Record<string, { url: string; date: string }>; items: Record<string, { min: number; max: number; date: string | null; source: string; week?: [number, number]; month?: [number, number]; year?: [number, number] }> }
/** Merge prices.json into the item table. */
export function applyLive(live: Live) {
  for (const [id, v] of Object.entries(live.items)) {
    const it = BY[id]
    if (!it || it.off) continue
    it.min = v.min; it.max = v.max; it.date = v.date; it.source = v.source; it.src = v.source !== 'estimate'; it.week = v.week; it.month = v.month; it.year = v.year
  }
}
/** Freshness label for an item: today, n days ago, update pending (> 7 days), or approx. */
export function freshness(date?: string | null) {
  if (!date) return { label: 'approx.', stale: false, approx: true }
  const days = Math.round((Date.parse(dhakaToday()) - Date.parse(date)) / 864e5)
  if (days > 7) return { label: 'Update pending', stale: true, approx: false, days }
  return { label: days <= 0 ? 'Aj update' : days === 1 ? 'Gotokal update' : `${days} din age update`, stale: false, approx: false, days }
}

/** Change against an earlier range, by the middle of each range. */
export function change(i: Item, vs: 'week' | 'month' | 'year') {
  const p = i[vs]
  if (!p || i.off) return null
  const now = (i.min + i.max) / 2, then = (p[0] + p[1]) / 2
  const diff = Math.round(now - then)
  return { diff, pct: Math.round((diff / then) * 100), dir: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same' as 'up' | 'down' | 'same' }
}
