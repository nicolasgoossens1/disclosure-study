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
  const [claimed, setClaimed] = useState(false)
  const [scenario, setScenario] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const hasStarted = useRef(false)
  const sessionIdRef = useRef(null)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function loadSession() {
      const id = localStorage.getItem('sessionId')
      const condition = localStorage.getItem('condition')
      const storedScenario = localStorage.getItem('scenario')

      if (!id) {
        router.push('/')
        return
      }

      sessionIdRef.current = id
      setSessionId(id)
      setSessionStarted(true)

      if (storedScenario) {
        setScenario(JSON.parse(storedScenario))
      }

      const openings = {
        neutral: "Hello. I'm your claims assistant. I'll be helping you file your claim today. Can you briefly describe what happened?",
        friendly: "Hi there! I'm so sorry to hear you've been in an accident — that's never fun. I'm here to help make this process as easy as possible for you. Can you tell me a little about what happened?",
        persuasive: "Hello, thank you for reaching out. I'm your dedicated claims specialist. To make sure your claim is processed quickly and you get the best possible outcome, I'll need to gather some details. Can you start by telling me what happened?",
        control: "Hello. Please describe the incident to begin your claim."
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

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.content?.toLowerCase().includes('claim has been submitted')
    ) {
      setClaimed(true)
    }
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    const id = sessionIdRef.current
    const res = await fetch(`/api/session/${id}/message`, {
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
    const id = sessionIdRef.current
    if (!id) return

    const res = await fetch(`/api/session/${id}/end`, {
      method: 'POST'
    })
    const data = await res.json()
    console.log('End session data:', data)

    const name = localStorage.getItem('name') || 'Anonymous'

    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: name,
        leakage: data.score?.total ?? 0,
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
        <div>
          <p className="text-sm text-gray-400">Insurance Claims Assistant</p>
          <p className="text-xs text-yellow-600 mt-0.5">
            ⚠️ Extra information may increase your rate
          </p>
        </div>
        <div className="text-sm font-mono bg-gray-900 px-3 py-1 rounded-lg text-white">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Scenario reminder */}
      {scenario && (
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest">
            Your scenario
          </p>
          <p className="text-white text-sm font-medium">{scenario.title}</p>
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
            {scenario.description}
          </p>
        </div>
      )}

      {/* Claim submitted banner */}
      {claimed && (
        <div className="bg-green-900 bg-opacity-30 border-b border-green-800 p-4 flex justify-between items-center">
          <p className="text-green-400 text-sm">
            Claim submitted — see your rate adjustment
          </p>
          <button
            onClick={handleEndSession}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-500 transition"
          >
            See results →
          </button>
        </div>
      )}

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
          placeholder="Type your response..."
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