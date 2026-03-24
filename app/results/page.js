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

const CONDITION_INFO = {
  minimal: {
    label: 'Minimal Engagement',
    description: 'The AI was purely functional — it asked only what was needed to complete the task. No rapport building, no personality.'
  },
  rapport: {
    label: 'Rapport Building',
    description: 'The AI was designed to build a social connection — expressing warmth, following personal threads, making you feel comfortable sharing.'
  },
  authority: {
    label: 'Authority Positioning',
    description: 'The AI positioned itself as an expert — implying that sharing more information would lead to better recommendations.'
  }
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
    fetch('/api/leaderboard').then(r => r.json()).then(setLeaderboard)
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

  const actualDetected = score.breakdown
    ? Object.entries(score.breakdown).filter(([_, val]) => val === true).map(([key]) => key)
    : []

  const perceivedChecked = perception?.checkedCategories || []

  // Three groups
  const sharedAndKnew = actualDetected.filter(id => perceivedChecked.includes(id))
  const sharedButMissed = actualDetected.filter(id => !perceivedChecked.includes(id))
  const notShared = CATEGORIES.map(c => c.id).filter(id => !actualDetected.includes(id))

  const gapCount = sharedButMissed.length
  const conditionInfo = CONDITION_INFO[condition] || { label: condition, description: '' }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="pt-4 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Study debrief
          </p>
          <h1 className="text-2xl font-medium">
            Here's what we found
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            That wasn't just a travel planning conversation. We were 
            studying how AI conversational strategy affects what you 
            share — and whether you realize what you shared.
          </p>
        </div>

        {/* THE KEY FINDING — front and center */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            The key finding
          </p>
          {gapCount === 0 ? (
            <>
              <p className="text-2xl font-medium text-green-400">
                You knew everything you shared.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your perception was accurate. You correctly identified 
                every topic that came up in the conversation.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-medium text-white">
                The AI learned{' '}
                <span className="text-red-400">
                  {gapCount} thing{gapCount !== 1 ? 's' : ''}
                </span>{' '}
                about you that you didn't realize you shared.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                You were focused on planning a trip. The AI was 
                building a profile.
              </p>
            </>
          )}
        </div>

        {/* What you shared without realizing */}
        {sharedButMissed.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                You shared this — but didn't realize it
              </p>
              <p className="text-gray-400 text-xs">
                The AI detected these topics. You didn't check them on the survey.
              </p>
            </div>
            <div className="space-y-2">
              {sharedButMissed.map(id => {
                const cat = CATEGORIES.find(c => c.id === id)
                return (
                  <div key={id} className="flex items-center gap-3 bg-red-950 bg-opacity-40 border border-red-900 rounded-xl px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    <p className="text-sm text-white">{cat?.label}</p>
                    <p className="text-xs text-red-400 ml-auto">not noticed</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* What you shared and knew */}
        {sharedAndKnew.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                You shared this — and knew it
              </p>
              <p className="text-gray-400 text-xs">
                The AI detected these and you correctly identified them.
              </p>
            </div>
            <div className="space-y-2">
              {sharedAndKnew.map(id => {
                const cat = CATEGORIES.find(c => c.id === id)
                return (
                  <div key={id} className="flex items-center gap-3 bg-green-950 bg-opacity-40 border border-green-900 rounded-xl px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <p className="text-sm text-white">{cat?.label}</p>
                    <p className="text-xs text-green-400 ml-auto">noticed</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* What the AI didn't learn */}
        {notShared.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                The AI didn't learn this
              </p>
              <p className="text-gray-400 text-xs">
                These topics never came up.
              </p>
            </div>
            <div className="space-y-2">
              {notShared.map(id => {
                const cat = CATEGORIES.find(c => c.id === id)
                return (
                  <div key={id} className="flex items-center gap-3 rounded-xl px-4 py-3 border border-gray-800">
                    <div className="w-2 h-2 rounded-full bg-gray-600 flex-shrink-0" />
                    <p className="text-sm text-gray-500">{cat?.label}</p>
                    <p className="text-xs text-gray-600 ml-auto">protected</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Condition reveal */}
        {condition && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              The AI strategy used on you
            </p>
            <p className="text-white font-medium">{conditionInfo.label}</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {conditionInfo.description}
            </p>
          </div>
        )}

        {/* Awareness */}
        {perception && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Your awareness
            </p>
            <div className="flex justify-between">
              <p className="text-sm text-gray-400">Noticed a strategy</p>
              <p className="text-sm text-white">{perception.noticedStrategy || '—'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-400">Felt probed</p>
              <p className="text-sm text-white">{perception.feltProbed || '—'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-400">Conversation felt natural</p>
              <p className="text-sm text-white">{perception.natural}/5</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-400">Trusted the AI</p>
              <p className="text-sm text-white">{perception.trust}/5</p>
            </div>
            {perception.strategyDescription && (
              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-1">How you described the strategy</p>
                <p className="text-sm text-gray-300 italic">"{perception.strategyDescription}"</p>
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
            <p className="text-gray-400 text-sm">Leaderboard</p>
            {leaderboard.map((entry, i) => (
              <div key={i} className={`flex justify-between items-center text-sm ${entry.nickname === nickname ? 'text-white' : 'text-gray-400'}`}>
                <div className="flex gap-3 items-center">
                  <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                  <span>{entry.nickname}</span>
                  {entry.nickname === nickname && <span className="text-xs text-gray-600">you</span>}
                </div>
                <span>{Math.round(entry.leakage * 100)}% detected</span>
              </div>
            ))}
          </div>
        )}

        {/* Consent */}
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