import { useState } from 'react'
import Site from './cinema/Site'
import MinSite from './minimal/MinSite'
import { THEMES, type ThemeId } from './minimal/themes'

const DEMOS = import.meta.env.VITE_DEMOS === '1'

function Picker({ t, set }: { t: ThemeId; set: (t: ThemeId) => void }) {
  return (
    <div role="group" aria-label="Demo" className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-16px)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full bg-[#111] p-1 text-sm text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)]">
      {THEMES.map((x, k) => (
        <button key={x.id} type="button" aria-pressed={t === x.id} title={x.note} onClick={() => set(x.id)}
          className={`h-9 shrink-0 cursor-pointer rounded-full px-3 whitespace-nowrap ${t === x.id ? 'bg-white text-black' : 'hover:bg-white/10'}`}>{k + 1} · {x.name}</button>
      ))}
    </div>
  )
}

export default function App() {
  const [t, setT] = useState<ThemeId>('khata')
  if (!DEMOS) return <Site />
  return <MinSite t={t} picker={<Picker t={t} set={setT} />} />
}
