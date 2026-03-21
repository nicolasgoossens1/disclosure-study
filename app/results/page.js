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

  const { score, secret, duration, messageCount, nickname } = results
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  const actualLeakage = Math.round(score.total * 100)
  const protectionScore = 100 - actualLeakage

  function attributeColor(val) {
    if (val === 0) return 'text-green-400'
    if (val === 0.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  function attributeLabel(val) {
    if (val === 0) return 'Not revealed'
    if (val === 0.5) return 'Partially revealed'
    return 'Revealed'
  }

  function grade() {
    if (protectionScore >= 90) return { label: 'S', color: 'text-yellow-400' }
    if (protectionScore >= 70) return { label: 'A', color: 'text-green-400' }
    if (protectionScore >= 50) return { label: 'B', color: 'text-blue-400' }
    if (protectionScore >= 30) return { label: 'C', color: 'text-orange-400' }
    return { label: 'F', color: 'text-red-400' }
  }

  const g = grade()

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto space-y-6">

        {/* Debrief header */}
        <div className="pt-4 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Study debrief
          </p>
          <h1 className="text-2xl font-medium">Here's what we were really studying</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            That wasn't just a conversation quality test. We were studying 
            how much personal information people reveal to an AI without 
            realizing it — and whether they can accurately estimate how 
            much they shared.
          </p>
        </div>

        {/* What the AI was looking for */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
          <p className="text-gray-400 text-sm">The AI was trying to figure out</p>
          <div className="space-y-3">
            {Object.entries(score.breakdown).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm capitalize">{key}</p>
                  <p className="text-gray-600 text-xs">{secret[key]}</p>
                </div>
                <p className={`text-sm font-medium ${attributeColor(val)}`}>
                  {attributeLabel(val)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Grade */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">How much you revealed</p>
          <p className={`text-7xl font-medium ${g.color}`}>{g.label}</p>
          <p className="text-white text-2xl font-medium mt-2">{actualLeakage}%</p>
          <p className="text-gray-600 text-xs mt-2">
            0% = nothing revealed · 100% = everything revealed
          </p>
        </div>

        {/* Perception gap — THE KEY FINDING */}
        {perception && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
            <p className="text-gray-400 text-sm">The perception gap</p>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">You estimated</p>
                <p className="text-2xl font-medium text-yellow-400">
                  {perception.estimatedLeakage}%
                </p>
              </div>
              <div className="text-gray-700 text-2xl">→</div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Actually revealed</p>
                <p className="text-2xl font-medium text-white">
                  {actualLeakage}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Gap</p>
                <p className={`text-2xl font-medium ${
                  Math.abs(perception.estimatedLeakage - actualLeakage) > 20
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}>
                  {Math.abs(perception.estimatedLeakage - actualLeakage)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {perception.estimatedLeakage < actualLeakage
                ? "You revealed more than you thought. This is the core finding of our study — people consistently underestimate how much they share in natural AI conversations."
                : perception.estimatedLeakage > actualLeakage
                ? "You were more guarded than you realized."
                : "Your estimate was spot on."}
            </p>
          </div>
        )}

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
            Try again
          </button>
        </Link>

      </div>
    </div>
  )
}