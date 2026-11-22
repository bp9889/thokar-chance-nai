/* Five calm looks for THOKAR চান্স NAI. Each has a day and a night palette; layout differences are keyed by data-t. */
export type ThemeId = 'khata' | 'tag' | 'lau' | 'shapla' | 'memo'
export const THEMES: { id: ThemeId; name: string; note: string }[] = [
  { id: 'khata', name: 'Hisab khata', note: 'Ruled ledger paper, ink blue, red margin' },
  { id: 'tag', name: 'Daam tag', note: 'White price list, big numbers, one green' },
  { id: 'lau', name: 'Lau pata', note: 'Soft leaf green, rounded tiles' },
  { id: 'shapla', name: 'Shapla', note: 'Pale shapla pink, plum ink, side column' },
  { id: 'memo', name: 'Cash memo', note: 'Pink carbon memo, handwritten prices' },
]

export const MIN_CSS = `
.mn { min-height: 100dvh; background: var(--bg); color: var(--fg); font-family: var(--fb); transition: background-color 400ms ease, color 300ms ease; font-feature-settings: "tnum" 1; }
.mn h1, .mn h2, .mn .d { font-family: var(--fd); font-weight: var(--wd, 600); letter-spacing: var(--ld, 0); }
.mn .muted { color: var(--muted); }
.mn .line { border-color: var(--line); }
.mn .acc { color: var(--acc); }
.mn .card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); }
.mn .btn { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-height: 44px; padding: 0 1rem; border-radius: var(--rb, var(--r)); background: var(--acc); color: var(--accfg); font-weight: 600; cursor: pointer; transition: opacity 150ms ease, transform 140ms var(--ease-out); }
.mn .btn:active { transform: scale(.97); }
.mn .btn-q { background: transparent; color: var(--fg); border: 1px solid var(--line); }
.mn .chip { min-height: 40px; padding: 0 .9rem; border-radius: var(--rb, var(--r)); border: 1px solid var(--line); cursor: pointer; transition: background-color 150ms ease, color 150ms ease; }
.mn .chip[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.mn input, .mn select { background: var(--field, var(--card)); color: var(--fg); border: 1px solid var(--line); border-radius: var(--r); min-height: 44px; padding: 0 .8rem; }
.mn .up { color: var(--up); } .mn .down { color: var(--down); }
.mn .num { font-family: var(--fn, var(--fb)); }
.mn .fade { animation: mn-fade 260ms var(--ease-out) both; }
@keyframes mn-fade { from { opacity: 0; transform: translateY(6px); } }
@media (prefers-reduced-motion: reduce) { .mn .fade { animation: none; } }
@media (hover: hover) and (pointer: fine) { .mn .row:hover { background: var(--hover); } .mn .btn:hover { opacity: .9; } }

/* 1 Hisab khata: ledger lines and a red margin */
.mn[data-t="khata"] { --fd: 'Tiro Bangla', serif; --fb: 'Tiro Bangla', serif; --wd: 400; --r: 0px; --rb: 0px;
  background-image: linear-gradient(90deg, transparent calc(50% - 404px), var(--margin) calc(50% - 404px) calc(50% - 402px), transparent calc(50% - 402px)), repeating-linear-gradient(transparent 0 35px, var(--rule) 35px 36px); }
.mn[data-t="khata"][data-m="day"] { --bg: #EEF0E4; --fg: #1F2D4D; --muted: #5D6A86; --line: #B9C9DC; --rule: rgba(70,120,180,.20); --margin: rgba(200,60,50,.55); --card: transparent; --acc: #B23A2E; --accfg: #FFF; --up: #B23A2E; --down: #2E6B3E; --hover: rgba(31,45,77,.05); --field: rgba(255,255,255,.55); }
.mn[data-t="khata"][data-m="night"] { --bg: #151B28; --fg: #E4E8F1; --muted: #9AA6BE; --line: #34415C; --rule: rgba(140,170,220,.10); --margin: rgba(240,113,103,.45); --card: transparent; --acc: #F07167; --accfg: #151B28; --up: #F07167; --down: #7FCB95; --hover: rgba(255,255,255,.04); --field: rgba(255,255,255,.04); }
.mn[data-t="khata"] .leader { flex: 1; border-bottom: 1px dotted var(--muted); margin: 0 .5rem .35rem; opacity: .6; }

/* 2 Daam tag: white price list */
.mn[data-t="tag"] { --fd: 'Hanken Grotesk Variable', 'Hind Siliguri', sans-serif; --fb: 'Hanken Grotesk Variable', 'Hind Siliguri', sans-serif; --wd: 700; --ld: -0.02em; --r: 2px; --rb: 999px; }
.mn[data-t="tag"][data-m="day"] { --bg: #FFFFFF; --fg: #111418; --muted: #61676E; --line: #E3E6E9; --card: #FFFFFF; --acc: #1F7A3A; --accfg: #FFF; --up: #C0392B; --down: #1F7A3A; --hover: #F5F6F7; }
.mn[data-t="tag"][data-m="night"] { --bg: #111315; --fg: #F2F3F4; --muted: #9BA1A8; --line: #2A2E33; --card: #16191C; --acc: #4CC27A; --accfg: #0D1A12; --up: #FF7B6B; --down: #4CC27A; --hover: #1B1F22; }

/* 3 Lau pata: soft green, rounded tiles */
.mn[data-t="lau"] { --fd: 'Baloo Da 2 Variable', sans-serif; --fb: 'Baloo Da 2 Variable', sans-serif; --wd: 700; --r: 18px; --rb: 999px; }
.mn[data-t="lau"][data-m="day"] { --bg: #EAF1E6; --fg: #1C3A25; --muted: #557560; --line: #D3E2CC; --card: #FFFFFF; --acc: #2F8F3A; --accfg: #FFF; --up: #C0492B; --down: #2F8F3A; --hover: #F4F8F1; }
.mn[data-t="lau"][data-m="night"] { --bg: #12201A; --fg: #E6F1E9; --muted: #96B3A0; --line: #263D30; --card: #1A2B22; --acc: #7BD389; --accfg: #0F1F15; --up: #FF8A6B; --down: #7BD389; --hover: #20352A; }
.mn[data-t="lau"] .card { border: 0; box-shadow: 0 1px 0 var(--line), 0 10px 30px -18px rgba(28,58,37,.35); }

/* 4 Shapla: pale pink, plum ink, sticky side column */
.mn[data-t="shapla"] { --fd: 'Mina', sans-serif; --fb: 'Hind Siliguri', sans-serif; --wd: 700; --r: 10px; --rb: 10px; }
.mn[data-t="shapla"][data-m="day"] { --bg: #F8EEF2; --fg: #3A1E34; --muted: #7D5C74; --line: #EBD6E0; --card: #FFFAFC; --acc: #2E7D4F; --accfg: #FFF; --up: #B03A48; --down: #2E7D4F; --hover: #F3E3EA; }
.mn[data-t="shapla"][data-m="night"] { --bg: #1E1420; --fg: #F6E9F0; --muted: #BFA3B6; --line: #3A2A3B; --card: #261A29; --acc: #8FD4A9; --accfg: #102016; --up: #FF8FA0; --down: #8FD4A9; --hover: #2D2030; }

/* 5 Cash memo: carbon-copy pink paper, printed blue rules, handwritten values */
.mn[data-t="memo"] { --fd: 'Hind Siliguri', sans-serif; --fb: 'Hind Siliguri', sans-serif; --fn: 'Atma', cursive; --wd: 600; --r: 4px; --rb: 4px; }
.mn[data-t="memo"][data-m="day"] { --bg: #E9E4DC; --paper: #F9E3E7; --fg: #23356E; --ink: #1B1F3B; --muted: #6A77A3; --line: #C9B3C8; --card: #F9E3E7; --acc: #23356E; --accfg: #F9E3E7; --up: #C4161C; --down: #1F7A3A; --hover: rgba(35,53,110,.05); }
.mn[data-t="memo"][data-m="night"] { --bg: #0F1424; --paper: #1A2036; --fg: #C9D3FF; --ink: #F7E7EC; --muted: #8A95C2; --line: #343C5E; --card: #1A2036; --acc: #F3B6C4; --accfg: #1A2036; --up: #FF8A8F; --down: #8FD4A9; --hover: rgba(255,255,255,.04); }
.mn[data-t="memo"] .sheet { background: var(--paper); box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 20px 50px -30px rgba(0,0,0,.35); }
.mn[data-t="memo"] .num, .mn[data-t="memo"] .hand { font-family: 'Atma', cursive; color: var(--ink); font-weight: 600; }
.mn[data-t="memo"] .btn .num { color: inherit; }
.mn[data-t="memo"] .memo-row { background-image: linear-gradient(var(--line), var(--line)); background-size: 100% 1px; background-position: bottom; background-repeat: no-repeat; }
`
