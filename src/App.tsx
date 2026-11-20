import { useState } from 'react'
import Site from './cinema/Site'
import type { Demo } from './cinema/theme'

const DEMOS = import.meta.env.VITE_DEMOS === '1'
export default function App() {
  const [demo, setDemo] = useState<Demo>(3)
  return <Site demo={demo} setDemo={DEMOS ? setDemo : undefined} />
}
