'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Chat() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState(null)
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

    async function loadSession() {
      const id = localStorage.getItem('sessionId')
      const condition = localStorage.getItem('condition')

      if (!id) {
        router.push('/')
        return
      }

      setSessionId(id)
      setSessionStarted(true)

      const openings = {
        neutral: "Hey, good to meet you. What's been keeping you busy lately?",
        friendly: "Hi! So glad to meet you 😊 Okay tell me — what's your deal? What are you into?",
        persuasive: "Hey, good to connect. I'm trying to get a sense of the people here tonight — what's your background?"
      }

      setMessages([{
        role: 'assistant',
        content: openings[condition] || openings.neutral
      }])
    }
    loadSession()
  }, [])

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
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    const res = await fetch(`/api/session/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: userMessage })
    })

    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    setLoading(false)
    inputRef.current?.focus()
  }

  async function handleEndSession() {
    if (!sessionId) return
    const res = await fetch(`/api/session/${sessionId}/end`, {
      method: 'POST'
    })
    const data = await res.json()

    const name = localStorage.getItem('name') || 'Anonymous'

    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: name,
        leakage: data.score.total,
        messageCount: data.messageCount,
        duration: data.duration
      })
    })

    localStorage.setItem('sessionResults', JSON.stringify({
      ...data,
      nickname: name
    }))
    router.push('/survey')
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!sessionId) {
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
        <div className="text-sm text-gray-400">
          AI Conversation Evaluator
        </div>
        <div className="text-sm font-mono bg-gray-900 px-3 py-1 rounded-lg text-white">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-2 rounded-2xl text-sm text-gray-400">
              Typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex gap-3">
        <input
          ref={inputRef}
          className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-600"
          placeholder="Type your message..."
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
          className="bg-gray-800 text-gray-400 px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition"
        >
          Done
        </button>
      </div>

    </div>
  )
}