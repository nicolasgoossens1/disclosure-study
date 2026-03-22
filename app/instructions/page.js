'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const SCENARIOS = [
  {
    id: 'parking',
    title: 'Parking lot bump',
    description: 'You bumped another car while parking at a grocery store. Minor bumper damage. No injuries. The other driver was present.',
    details: {
      date: 'Yesterday afternoon',
      location: 'Grocery store parking lot',
      otherVehicle: true,
      injuries: false,
      damage: 'Minor bumper damage'
    }
  },
  {
    id: 'stoplight',
    title: 'Rear-ended at a stoplight',
    description: 'Someone hit you from behind while you were stopped at a red light. Your trunk has some damage. No injuries.',
    details: {
      date: 'This morning',
      location: 'Intersection near your home',
      otherVehicle: true,
      injuries: false,
      damage: 'Trunk and rear bumper damage'
    }
  },
  {
    id: 'highway',
    title: 'Side swipe on the highway',
    description: 'A car merged into your lane on the highway and clipped your door and mirror. You pulled over safely. No injuries.',
    details: {
      date: 'Last night',
      location: 'Highway on-ramp',
      otherVehicle: true,
      injuries: false,
      damage: 'Driver side door and mirror damage'
    }
  }
]

export default function Instructions() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [selectedScenario, setSelectedScenario] = useState(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function startSession() {
      const res = await fetch('/api/session/start', { method: 'POST' })
      const data = await res.json()
      localStorage.setItem('sessionId', data.sessionId)
      localStorage.setItem('sessionSecret', JSON.stringify(data.secret))
      localStorage.setItem('condition', data.condition)
      setLoading(false)
    }
    startSession()
  }, [])

  function beginChat() {
    localStorage.setItem('name', name.trim() || 'Anonymous')
    localStorage.setItem('scenario', JSON.stringify(selectedScenario))
    router.push('/chat')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Setting up your session...</p>
      </div>
    )
  }

  const steps = [
    {
      label: 'THE SITUATION',
      title: 'You were in a fender bender',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            You were recently involved in a minor car accident. Nobody 
            was seriously hurt but there was some damage to your vehicle. 
            You need to file a claim with your insurance company.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            You will chat with an AI claims assistant to submit your claim.
            On the next screen you will pick which scenario applies to you.
          </p>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-800 rounded-xl p-4 text-sm text-yellow-400 leading-relaxed">
            ⚠️ Your rate adjustment depends on what you share. Give only 
            what is necessary to file the claim.
          </div>
        </div>
      )
    },
    {
      label: 'YOUR SCENARIO',
      title: 'What happened to you?',
      content: (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm leading-relaxed">
            Pick the scenario that matches your situation for this session.
          </p>
          {SCENARIOS.map(scenario => (
            <div
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className={`border rounded-xl p-4 cursor-pointer transition space-y-1 ${
                selectedScenario?.id === scenario.id
                  ? 'border-white bg-gray-800'
                  : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              <p className="text-white text-sm font-medium">{scenario.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                {scenario.description}
              </p>
            </div>
          ))}
        </div>
      )
    },
    {
      label: 'WHAT YOU NEED TO PROVIDE',
      title: 'Required claim information',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            To file your claim you only need to provide these five things:
          </p>
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            {[
              'Date of the incident',
              'Brief description of what happened',
              'Whether another vehicle was involved',
              'General location',
              'Whether anyone was injured'
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-5 py-4 ${
                  i < 4 ? 'border-b border-gray-800' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-green-900 flex items-center justify-center text-xs text-green-400 flex-shrink-0">
                  ✓
                </div>
                <span className="text-white text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs leading-relaxed">
            Anything beyond these five things is not required. Sharing 
            extra information may increase your rate adjustment.
          </p>
        </div>
      )
    },
    {
      label: 'BEFORE YOU START',
      title: 'One last thing',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            Enter a name or nickname for your session results.
          </p>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">
              Your name or nickname
            </label>
            <input
              autoFocus
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gray-600"
              placeholder="e.g. Hokie Bird"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && beginChat()}
            />
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            This study uses a deception design. The true purpose will 
            be revealed after the chat. Your data is stored anonymously 
            and used only for academic research.
          </p>
        </div>
      )
    }
  ]

  const isLast = step === steps.length - 1

  const canAdvance = () => {
    if (step === 1 && !selectedScenario) return false
    if (isLast && !name.trim()) return false
    return true
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {/* Progress dots */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-white' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Step label */}
        <div>
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-2">
            {steps[step].label}
          </p>
          <h1 className="text-2xl font-medium leading-tight">
            {steps[step].title}
          </h1>
        </div>

        {/* Step content */}
        <div>{steps[step].content}</div>

        {/* Navigation */}
        <div className="space-y-3 pt-2">
          {isLast ? (
            <button
              onClick={beginChat}
              disabled={!canAdvance()}
              className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-40"
            >
              Start claim →
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-40"
            >
              Next →
            </button>
          )}
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="w-full bg-transparent text-gray-500 py-3 rounded-xl text-sm hover:text-white transition"
            >
              ← Back
            </button>
          )}
        </div>

      </div>
    </div>
  )
}