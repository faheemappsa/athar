import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="flex items-center gap-6">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="h-24 transition hover:drop-shadow-[0_0_2em_#646cffaa]" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="h-24 animate-spin-slow transition hover:drop-shadow-[0_0_2em_#61dafbaa]" alt="React logo" />
          </a>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-300">Athar starter</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Vite + React + TypeScript</h1>
          <p className="text-lg text-slate-300">Tailwind CSS, Axios, html2canvas, and Vite PWA are ready for application development.</p>
        </div>

        <button
          className="rounded-full bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          onClick={() => setCount((value) => value + 1)}
        >
          Count is {count}
        </button>
      </section>
    </main>
  )
}

export default App
