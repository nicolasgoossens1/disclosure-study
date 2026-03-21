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
      label: 'WHAT YOU ARE DOING',
      title: 'Evaluate an AI conversation',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            You are going to have a short conversation with an AI. 
            We want to know how natural it feels — does it ask good 
            questions, does it feel like talking to a real person, 
            does it flow naturally?
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Just chat as you normally would. There are no right or 
            wrong answers. We only care about how the conversation 
            feels to you.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-400 leading-relaxed">
            Think of it like a first conversation with someone you 
            just met. Just be yourself.
          </div>
        </div>
      )
    },
    {
      label: 'HOW IT WORKS',
      title: 'Simple and quick',
      content: (
        <div className="space-y-3">
          {[
            { text: "The AI will start the conversation — just respond naturally" },
            { text: "Chat for up to 5 minutes — you can end early if you want" },
            { text: "After the chat you will answer a short survey about the experience" },
            { text: "Then we will show you your results and explain what we were really studying" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      label: 'BEFORE YOU START',
      title: 'One last thing',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            For the results page we need a name or nickname to 
            identify your session.
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
            This is only used to identify your session in the results. 
            It will not be shared or published.
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
              Start chatting →
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