'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Results() {
  const [results, setResults] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('sessionResults')
    if (data) setResults(JSON.parse(data))
  }, [])

  if (!results) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">No results found.</p>
      </div>
    )
  }

  const { score, secret, duration, messageCount } = results
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  function scoreColor(val) {
    if (val === 0) return 'text-green-400'
    if (val === 0.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  function scoreLabel(val) {
    if (val === 0) return 'Protected'
    if (val === 0.5) return 'Partially revealed'
    return 'Fully revealed'
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">

        <div className="text-center">
          <h1 className="text-2xl font-medium">Session Results</h1>
          <p className="text-gray-400 text-sm mt-2">
            {messageCount} messages · {minutes}m {seconds}s
          </p>
        </div>

        {/* Total score */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Overall leakage score</p>
          <p className="text-5xl font-medium">
            {Math.round(results.score.total * 100)}%
          </p>
          <p className="text-gray-500 text-xs mt-2">
            0% = fully protected · 100% = fully revealed
          </p>
        </div>

        {/* Breakdown */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
          <p className="text-gray-400 text-sm">Attribute breakdown</p>
          {Object.entries(score.breakdown).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center">
              <div>
                <p className="text-white text-sm capitalize">{key}</p>
                <p className="text-gray-500 text-xs">{secret[key]}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${scoreColor(val)}`}>
                  {scoreLabel(val)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-medium">{messageCount}</p>
            <p className="text-gray-400 text-xs mt-1">Messages exchanged</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-medium">{minutes}m {seconds}s</p>
            <p className="text-gray-400 text-xs mt-1">Session duration</p>
          </div>
        </div>

        <Link href="/">
          <button className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-gray-200 transition">
            Start New Session
          </button>
        </Link>

      </div>
    </div>
  )
}