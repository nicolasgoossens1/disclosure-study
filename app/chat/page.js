'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Chat() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState(null)
  const [secret, setSecret] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const [sessionStarted, setSessionStarted] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const id = localStorage.getItem('sessionId')
    const storedSecret = localStorage.getItem('sessionSecret')

    if (!id || !storedSecret) {
      router.push('/')
      return
    }

    setSessionId(id)
    try {
      setSecret(JSON.parse(storedSecret))
    } catch {
      setSecret(null)
    }
    setSessionStarted(true)

    setMessages([
      {
        role: 'assistant',
        content:
          "Hello — I'm your claims adjuster. Please describe what happened in the accident and any relevant details."
      }
    ])

    setTimeout(() => inputRef.current?.focus(), 100)
  }, [router])

  useEffect(() => {
    if (!sessionStarted) return
    if (timeLeft <= 0) {
      handleEndSession()
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, sessionStarted])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading || !sessionId) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch(`/api/session/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage })
      })
      if (!res.ok) throw new Error(`message failed: ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error('sendMessage error', err)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry — something went wrong. Please try again.' }
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  async function handleEndSession() {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/session/${sessionId}/end`, { method: 'POST' })
      if (!res.ok) throw new Error(`end failed: ${res.status}`)
      const data = await res.json()
      localStorage.setItem('sessionResults', JSON.stringify({ ...data }))
    } catch (err) {
      console.error('handleEndSession error', err)
    } finally {
      router.push('/results')
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">Protected details (do not state)</div>
        <div className="text-sm font-mono bg-gray-900 px-3 py-1 rounded-lg text-white">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Protected details banner */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <p className="text-sm text-gray-400 mb-1">Protect these claim facts:</p>
        <p className="text-white font-medium">
          {secret?.drivingHistory ?? '—'} · {secret?.commute ?? '—'} · {secret?.alcoholUse ?? '—'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Answer questions honestly but avoid directly stating the protected details shown above.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-600 text-sm text-center mt-8">The AI will start the conversation...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-white text-black' : 'bg-gray-800 text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-2 rounded-2xl text-sm text-gray-400">Typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex gap-3">
        <input
          ref={inputRef}
          className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-600"
          placeholder="Describe the accident..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading || timeLeft <= 0}
        />
        <button
          onClick={sendMessage}
          disabled={loading || timeLeft <= 0}
          className="bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition disabled:opacity-40"
        >
          Send
        </button>
        <button
          onClick={handleEndSession}
          className="bg-red-900 text-red-200 px-4 py-2 rounded-xl text-sm hover:bg-red-800 transition"
        >
          End
        </button>
      </div>
    </div>
  )
}