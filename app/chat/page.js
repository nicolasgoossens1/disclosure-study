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
      let condition = localStorage.getItem('condition')
      const storedScenario = localStorage.getItem('scenario')

      if (!id) {
        router.push('/')
        return
      }
      condition = 'rapport'
  localStorage.setItem('condition', 'rapport')
      sessionIdRef.current = id
      setSessionId(id)
      setSessionStarted(true)

      if (storedScenario) {
        setScenario(JSON.parse(storedScenario))
      }

     const openings = {
  minimal: "Hello. What kind of destination are you looking for and what is your approximate budget?",
  rapport: "Oh how exciting — a weekend trip! I love helping people plan getaways. Before we dive in, tell me — are you more of a relax and recharge kind of traveler or do you like to pack in as many experiences as possible?",
  authority: "Welcome. To generate the most accurate personalized recommendations for your trip our system works best with some background information. Could you start by telling me a bit about what you are looking for in this trip and what typically makes a getaway feel successful for you?"
}
      setMessages([{
        role: 'assistant',
content: openings[condition] || openings.minimal
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
    <p className="text-sm text-gray-400">AI Travel Assistant</p>
    <p className="text-xs text-gray-600 mt-0.5">
      Plan your weekend trip
    </p>
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