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
      label: 'THE TASK',
      title: 'Plan a weekend trip',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            You are going to chat with an AI travel assistant to help 
            plan a weekend trip. The AI will ask you questions and make 
            suggestions based on what you share.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Just have a natural conversation. There are no right or 
            wrong answers — we only care about how the interaction feels.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-400 leading-relaxed">
            Think of it like chatting with a travel agent. Just be 
            yourself and see what the AI comes up with.
          </div>
        </div>
      )
    },
    {
      label: 'HOW IT WORKS',
      title: 'Quick and simple',
      content: (
        <div className="space-y-3">
          {[
            'The AI will start the conversation — just respond naturally',
            'Chat for up to 5 minutes — you can end early if you want',
            'After the chat answer a short survey about the experience',
            'Then we will show you what the AI learned and explain what we were studying'
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{item}</p>
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
            Enter a name or nickname so we can identify your session 
            in the results.
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
            Your data is stored anonymously and used only for 
            academic research at Virginia Tech.
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