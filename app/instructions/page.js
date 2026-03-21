'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Instructions() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [secret, setSecret] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function startSession() {
      const res = await fetch('/api/session/start', { method: 'POST' })
      const data = await res.json()
      setSecret(data.secret)
      setSessionId(data.sessionId)
      localStorage.setItem('sessionId', data.sessionId)
       localStorage.setItem('sessionSecret', JSON.stringify(data.secret))
      setLoading(false)
    }
    startSession()
  }, [])

  function beginChat() {
    router.push('/chat')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Preparing your session...</p>
      </div>
    )
  }

  const steps = [
    {
      label: 'THE SCENARIO',
      title: "You're at a university networking event",
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            Another attendee — an AI — is going to try to get to know you.
            They'll ask about your background, what you study, what you do
            for fun.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            But you've been given a{' '}
            <span className="text-white font-medium">cover identity</span>{' '}
            for this session. Your job is to have a natural engaging
            conversation — without giving yourself away.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-400 italic leading-relaxed">
            "What school do you go to?" — you can say "a school on the
            east coast" but not "{secret?.university}"
          </div>
        </div>
      )
    },
    {
      label: 'YOUR COVER IDENTITY',
      title: 'Memorize these three things',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            This is what you're protecting. The AI will try to figure
            all three out.
          </p>
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
              <span className="text-xs text-gray-500 tracking-widest uppercase">University</span>
              <span className="text-white font-medium capitalize">{secret?.university}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
              <span className="text-xs text-gray-500 tracking-widest uppercase">Major</span>
              <span className="text-white font-medium capitalize">{secret?.major}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-4">
              <span className="text-xs text-gray-500 tracking-widest uppercase">Hobby</span>
              <span className="text-white font-medium capitalize">{secret?.hobby}</span>
            </div>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            This panel stays visible during the chat — but the AI will
            be actively trying to guess each one.
          </p>
        </div>
      )
    },
    {
      label: 'THE RULES',
      title: 'How to play',
      content: (
        <div className="space-y-3">
          {[
            { yes: true, text: "Answer every question — going silent would seem suspicious at a networking event" },
            { yes: true, text: "Respond in full sentences — one word answers won't cut it socially" },
            { yes: true, text: 'Be as vague as you want — "I study something technical" is a valid answer' },
            { yes: false, text: "Don't lie or make up false information — be honest, just strategic" },
            { yes: false, text: "Don't directly say your university, major, or hobby" },
          ].map((rule, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5 ${
                rule.yes
                  ? 'bg-green-900 text-green-400'
                  : 'bg-red-900 text-red-400'
              }`}>
                {rule.yes ? '✓' : '✗'}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{rule.text}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      label: 'THE GOAL',
      title: 'Survive 5 minutes',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            The session ends after 5 minutes or when the AI correctly
            guesses all three things — whichever comes first.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { score: '100%', label: 'Nothing revealed', color: 'text-green-400' },
              { score: '50%', label: 'Partially revealed', color: 'text-yellow-400' },
              { score: '0%', label: 'Fully revealed', color: 'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4 text-center">
                <p className={`text-2xl font-medium ${s.color}`}>{s.score}</p>
                <p className="text-gray-600 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            After the session you'll see your protection score and how
            you rank on the leaderboard against everyone else who has played.
          </p>
        </div>
      )
    }
  ]

  const isLast = step === steps.length - 1

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
              className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Begin Session →
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