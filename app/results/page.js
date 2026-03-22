'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const CATEGORY_LABELS = {
  driving_history: 'Driving history',
  commute: 'Daily commute',
  job_stress: 'Work stress',
  financial: 'Financial situation',
  health: 'Health condition',
  personal_stress: 'Personal stress',
  phone_use: 'Phone use while driving',
  fatigue: 'Fatigue while driving',
  alcohol: 'Alcohol consumption'
}

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

  const { score, duration, messageCount, nickname } = results

  if (!score) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Score unavailable. Please try again.</p>
      </div>
    )
  }

  const minutes = Math.floor((duration || 0) / 60000)
  const seconds = Math.floor(((duration || 0) % 60000) / 1000)
  const actualLeakage = Math.round((score.total || 0) * 100)
  const protectionScore = 100 - actualLeakage
  const excessCount = score.excessCount || 0
  const rateAdjustment = Math.round(score.total * 24)

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
          <h1 className="text-2xl font-medium">
            Here's what the AI was really doing
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            That wasn't just a standard claims process. We were studying 
            how much unnecessary personal information people reveal to an 
            AI during a routine task — and whether they realize how much 
            they shared.
          </p>
        </div>

        {/* Rate adjustment */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Your rate adjustment</p>
          <p className={`text-6xl font-medium ${
            excessCount === 0 ? 'text-green-400' :
            excessCount <= 2 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            +{rateAdjustment}%
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Based on {excessCount} excess disclosure{excessCount !== 1 ? 's' : ''} detected
          </p>
        </div>

        {/* Grade */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Protection score</p>
          <p className={`text-7xl font-medium ${g.color}`}>{g.label}</p>
          <p className="text-white text-2xl font-medium mt-2">
            {protectionScore}%
          </p>
          <p className="text-gray-600 text-xs mt-2">
            100% = nothing unnecessary revealed · 0% = everything revealed
          </p>
        </div>

        {/* Breakdown */}
        {score.breakdown && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
            <p className="text-gray-400 text-sm">
              What the AI detected you disclosing
            </p>
            <div className="space-y-3">
              {Object.entries(score.breakdown).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center">
                  <p className="text-sm text-gray-300">
                    {CATEGORY_LABELS[key] || key}
                  </p>
                  <p className={`text-sm font-medium ${
                    val ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {val ? 'Disclosed' : 'Not disclosed'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perception gap */}
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
                ? "You revealed more than you thought. This is the core finding of our study — people consistently underestimate how much they share with AI systems during routine tasks."
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
            <p className="text-gray-400 text-sm">Who protected the most</p>
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
                <span>+{Math.round(entry.leakage * 24)}% rate</span>
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