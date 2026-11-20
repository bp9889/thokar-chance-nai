import { useState } from 'react'
import Site from './cinema/Site'
import { DemoPicker, type BoardV } from './cinema/theme'
import type { DayV } from './cinema/desh'

const DEMOS = import.meta.env.VITE_DEMOS === '1'
export default function App() {
  const [day, setDay] = useState<DayV>('tar')
  const [board, setBoard] = useState<BoardV>('seat')
  return <Site demo={3} day={day} board={board} picker={DEMOS ? <DemoPicker day={day} setDay={setDay} board={board} setBoard={setBoard} /> : undefined} />
}
