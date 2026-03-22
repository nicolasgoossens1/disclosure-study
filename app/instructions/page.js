'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Instructions() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function startSession() {
      try {
        const res = await fetch('/api/session/start', { method: 'POST' })
        if (!res.ok) throw new Error(`Failed to start session: ${res.status}`)
        const data = await res.json()
        setSecret(data.secret)
        setSessionId(data.sessionId)
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('sessionSecret', JSON.stringify(data.secret))
      } catch (err) {
        console.error('Failed to start session', err)
      } finally {
        setLoading(false)
      }
    }

    startSession()
  }, [])

  function beginChat() {
    localStorage.setItem('name', name.trim() || 'Anonymous')
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
      label: 'INSURANCE CLAIM SITUATION',
      title: 'You need to file a claim for an accident',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            You will complete a short insurance claim interaction with an AI adjuster. The adjuster will ask about the incident
            and related background to process the claim.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your goal: provide the information necessary to file the claim while avoiding disclosure of sensitive details shown
            on the next screen.
          </p>
        </div>
      )
    },
    {
      label: 'CLAIM DETAILS TO PROTECT',
      title: 'Memorize these private details',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            These are sensitive claim facts the AI may try to elicit. Try not to state them directly during the chat.
          </p>

          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
              <span className="text-xs text-gray-500 tracking-widest uppercase">Driving history</span>
              <span className="text-white font-medium capitalize">{secret?.drivingHistory}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
              <span className="text-xs text-gray-500 tracking-widest uppercase">Regular commute</span>
              <span className="text-white font-medium capitalize">{secret?.commute}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-4">
              <span className="text-xs text-gray-500 tracking-widest uppercase">Alcohol or substance use</span>
              <span className="text-white font-medium capitalize">{secret?.alcoholUse}</span>
            </div>
          </div>

          <p className="text-gray-600 text-xs leading-relaxed">
            This panel will remain visible during the chat so you can remember which facts to protect.
          </p>
        </div>
      )
    },
    {
      label: 'THE RULES',
      title: 'How to interact',
      content: (
        <div className="space-y-3">
          {[
            { yes: true, text: "Answer the adjuster's questions; provide enough to file the claim." },
            { yes: true, text: "Use full sentences and be consistent — vague but truthful is fine." },
            { yes: true, text: "You may be intentionally evasive about sensitive details — protect the items shown." },
            { yes: false, text: "Do not invent facts that didn't happen — avoid fabrications." },
            { yes: false, text: "Do not directly state any of the protected claim details shown above." },
          ].map((rule, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5 ${
                rule.yes ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
              }`}>
                {rule.yes ? '✓' : '✗'}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      label: 'WHAT WE\'RE STUDYING',
      title: 'Adversarial disclosure & conversational style',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            We study how different conversational styles (Neutral, Friendly, Persuasive) affect "excess disclosure" —
            information beyond what the claim form requires. The AI adjuster may appear supportive while also seeking details
            that could raise rates.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            After reading, begin the claim session. The chat will attempt to collect necessary info but may also probe for sensitive details.
          </p>
        </div>
      )
    }
  ]

  const isLast = step === steps.length - 1

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

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

        <div>
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-2">
            {steps[step].label}
          </p>
          <h1 className="text-2xl font-medium leading-tight">
            {steps[step].title}
          </h1>
        </div>

        <div>{steps[step].content}</div>

        <div className="space-y-3 pt-2">
          {isLast ? (
            <button
              onClick={beginChat}
              disabled={!name.trim()}
              className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-40"
            >
              Begin Claim Session →
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition"
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