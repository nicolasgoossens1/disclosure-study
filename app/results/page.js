'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Results() {
  const [results, setResults] = useState(null)
  const [perception, setPerception] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const data = localStorage.getItem('sessionResults')
    if (data) setResults(JSON.parse(data))

    const p = localStorage.getItem('perception')
    if (p) setPerception(JSON.parse(p))

    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(setLeaderboard)
  }, [])

  if (!results) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">No results found.</p>
      </div>
    )
  }

  const { score = {}, secret = {}, duration = 0, messageCount = 0 } = results

  // derive summary level and numeric total
  const total = typeof score.total === 'number' ? score.total : (score.score ?? score) // fallback shapes
  let normalized = 0
  if (typeof total === 'number') normalized = Math.max(0, Math.min(1, total))
  const level = score.level || (normalized === 0 ? 'None' : normalized <= 0.33 ? 'Low' : normalized <= 0.66 ? 'Moderate' : 'High')
  const leakedCount = typeof score.leakedCount === 'number'
    ? score.leakedCount
    : Array.isArray(score.leakedCategories)
      ? score.leakedCategories.length
      : Object.values(score.breakdown || {}).filter(v => v > 0).length

  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  const actualLeakage = Math.round(score.total * 100)
  const protectionScore = 100 - actualLeakage

  function levelColor(lvl) {
    const key = String(lvl).toLowerCase()
    if (key === 'none' || key === 'none' || key === '0') return 'text-green-400'
    if (key === 'low') return 'text-green-400'
    if (key === 'moderate') return 'text-yellow-400'
    return 'text-red-400'
  }

  function attrLabel(val) {
    if (val === 0) return 'Protected'
    if (val === 0.5) return 'Partially revealed'
    if (val === 1) return 'Revealed'
    // handle objects like { score: 0.5, ... }
    if (val && typeof val === 'object' && typeof val.score === 'number') return attrLabel(val.score)
    return 'Unknown'
  }

  const breakdown = score.breakdown || {}

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto space-y-6">

        <div className="text-center">
          <h1 className="text-2xl font-medium">Session Summary</h1>
          <p className="text-gray-400 text-sm mt-2">
            Calm, professional summary of your claim interaction.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Disclosure risk</p>
          <p className={`text-4xl font-medium ${levelColor(level)}`}>{level}</p>
          <p className="text-gray-500 text-xs mt-2">
            {leakedCount} sensitive attribute{leakedCount === 1 ? '' : 's'} disclosed
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {Math.round((normalized || 0) * 100)}% disclosure index
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
          <p className="text-gray-400 text-sm">Attribute breakdown</p>
          {Object.keys(breakdown).length === 0 ? (
            <p className="text-gray-500 text-xs">No attribute breakdown available.</p>
          ) : (
            Object.entries(breakdown).map(([key, val]) => {
              const label = attrLabel(val)
              return (
                <div key={key} className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm capitalize">{key}</p>
                    <p className="text-gray-500 text-xs">{secret[key] ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${label === 'Protected' ? 'text-green-400' : label === 'Partially revealed' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {label}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

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

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
            <p className="text-gray-400 text-sm">Who revealed the least</p>
            {leaderboard.map((entry, i) => (
              <div
                key={i}
                className={`flex justify-between items-center text-sm ${
                  entry.nickname === nickname
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                  <span>{entry.nickname}</span>
                  {entry.nickname === nickname && (
                    <span className="text-xs text-gray-600">you</span>
                  )}
                </div>
                <span>{Math.round((1 - entry.leakage) * 100)}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Consent note */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
          <p className="text-gray-400 text-sm">About this study</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            This study used a deception design — you were not told the true 
            purpose beforehand so your behavior would be natural. Your data 
            is stored anonymously and used only for academic research. 
            If you would like your data removed please contact the research team.
          </p>
        </div>

        <Link href="/">
          <button className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-gray-200 transition">
            Return to Home
          </button>
        </Link>

      </div>
    </div>
  )
}