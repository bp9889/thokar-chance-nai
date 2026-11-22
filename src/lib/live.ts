import { useEffect, useState } from 'react'
import { applyLive, type Live } from './data'
import seed from '../../public/prices.json'

// Prices as of this build, so the page shows real prices before (or without) the fetch.
applyLive(seed as unknown as Live)

/** Fetches the latest prices.json once; `ver` changes when new prices land. */
export function useLive() {
  const [ver, setVer] = useState(0)
  const [updated, setUpdated] = useState<string | null>(seed.updated)
  useEffect(() => {
    fetch('/prices.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject())).then((j: Live) => { applyLive(j); setUpdated(j.updated); setVer((v) => v + 1) }).catch(() => {})
  }, [])
  return { ver, updated }
}
