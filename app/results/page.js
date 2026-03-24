'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const CATEGORIES = [
  { id: 'budget', label: 'Budget or financial situation' },
  { id: 'companions', label: 'Who you traveled with' },
  { id: 'location', label: 'Where you live or are from' },
  { id: 'job', label: 'Job or field of work' },
  { id: 'age', label: 'Age or life stage' },
  { id: 'relationship', label: 'Relationship status' },
  { id: 'health', label: 'Health or physical considerations' },
  { id: 'past_travel', label: 'Past travel experiences' },
  { id: 'lifestyle', label: 'Daily routine or lifestyle' }
]

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

  const { score, duration, messageCount, nickname, condition } = results

  if (!score) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Score unavailable. Please try again.</p>
      </div>
    )
  }

  const minutes = Math.floor((duration || 0) / 60000)
  const seconds = Math.floor(((duration || 0) % 60000) / 1000)

  // Actual categories detected by AI scorer
  const actualDetected = score.breakdown
    ? Object.entries(score.breakdown)
        .filter(([_, val]) => val === true)
        .map(([key]) => key)
    : []

  const actualCount = actualDetected.length
  const actualScore = actualCount / CATEGORIES.length

  // Perceived categories checked by user
  const perceivedChecked = perception?.checkedCategories || []
  const perceivedCount = perceivedChecked.length
  const perceivedScore = perceivedCount / CATEGORIES.length

  // Perception gap
  const gapCount = actualCount - perceivedCount
  const gapDirection = gapCount > 0 ? 'under' : gapCount < 0 ? 'over' : 'accurate'

  const conditionLabels = {
    minimal: 'Minimal engagement',
    rapport: 'Rapport building',
    authority: 'Authority positioning'
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto space-y-6">

        {/* Debrief header */}
        <div className="pt-4 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Study debrief
          </p>
          <h1 className="text-2xl font-medium">
            Here's what we were really studying
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            That wasn't just a travel planning conversation. We were 
            studying how different AI conversational strategies affect 
            how much personal information people share — and whether 
            they realize how much they shared.
          </p>
        </div>

        {/* Condition reveal */}
        {condition && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
            <p className="text-gray-400 text-sm">The AI strategy used on you</p>
            <p className="text-white text-lg font-medium">
              {conditionLabels[condition] || condition}
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              {condition === 'minimal' && "The AI was designed to be purely functional — asking only what was necessary with no rapport building."}
              {condition === 'rapport' && "The AI was designed to build a social connection — expressing warmth and following personal threads to make you feel comfortable sharing."}
              {condition === 'authority' && "The AI was designed to position itself as an expert — implying that more information leads to better recommendations to encourage disclosure."}
            </p>
          </div>
        )}

        {/* Category comparison — THE KEY FINDING */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
          <p className="text-gray-400 text-sm">
            What the AI detected vs what you thought you shared
          </p>
          <div className="space-y-2">
            {CATEGORIES.map(cat => {
              const detected = actualDetected.includes(cat.id)
              const perceived = perceivedChecked.includes(cat.id)
              const mismatch = detected !== perceived

              return (
                <div
                  key={cat.id}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg ${
                    mismatch ? 'bg-gray-800' : ''
                  }`}
                >
                  <p className="text-sm text-gray-300">{cat.label}</p>
                  <div className="flex gap-3 items-center">
                    <span className={`text-xs ${detected ? 'text-red-400' : 'text-green-400'}`}>
                      {detected ? 'AI detected' : 'Not detected'}
                    </span>
                    {mismatch && (
                      <span className="text-xs text-yellow-400">
                        {detected && !perceived ? '← missed' : '← wrong'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Perception gap summary */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
          <p className="text-gray-400 text-sm">Your perception gap</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">AI detected</p>
              <p className="text-2xl font-medium text-white">
                {actualCount}/9
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">You thought</p>
              <p className="text-2xl font-medium text-yellow-400">
                {perceivedCount}/9
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Gap</p>
              <p className={`text-2xl font-medium ${
                gapCount > 0 ? 'text-red-400' :
                gapCount < 0 ? 'text-blue-400' :
                'text-green-400'
              }`}>
                {gapCount > 0 ? `+${gapCount}` : gapCount}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {gapDirection === 'under' &&
              `The AI learned ${gapCount} more thing${gapCount !== 1 ? 's' : ''} about you than you realized. This is the core finding of our study — the AI's conversational strategy influences how much people share without noticing.`}
            {gapDirection === 'over' &&
              "You thought you shared more than the AI actually detected. You were more guarded than you realized."}
            {gapDirection === 'accurate' &&
              "Your perception was accurate — you correctly identified what you shared."}
          </p>
        </div>

        {/* Awareness questions */}
        {perception && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
            <p className="text-gray-400 text-sm">Your awareness</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">Noticed a strategy</p>
              <p className="text-sm text-white">
                {perception.noticedStrategy || '—'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">Felt probed</p>
              <p className="text-sm text-white">
                {perception.feltProbed || '—'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">Conversation felt natural</p>
              <p className="text-sm text-white">
                {perception.natural}/5
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">Trusted the AI</p>
              <p className="text-sm text-white">
                {perception.trust}/5
              </p>
            </div>
            {perception.strategyDescription && (
              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-1">
                  How you described the strategy
                </p>
                <p className="text-sm text-gray-300 italic">
                  "{perception.strategyDescription}"
                </p>
              </div>
            )}
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
            <p className="text-gray-400 text-sm">Perception gap leaderboard</p>
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
                <span>{Math.round(entry.leakage * 100)}% detected</span>
              </div>
            ))}
          </div>
        )}

        {/* Consent note */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
          <p className="text-gray-400 text-sm">About this study</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            This study used a deception design — you were not told the 
            true purpose beforehand so your behavior would be natural. 
            Your data is stored anonymously and used only for academic 
            research at Virginia Tech. If you would like your data 
            removed please contact the research team.
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