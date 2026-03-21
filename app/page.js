'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    router.push('/instructions')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            VT HCI Research Study
          </p>
          <h1 className="text-4xl font-medium leading-tight">
            Help us evaluate an AI conversationalist
          </h1>
          <p className="text-gray-400 leading-relaxed">
            We are studying how naturally AI systems can hold a conversation. 
            Your job is simple — just chat with our AI for a few minutes 
            and tell us how it felt afterward.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="text-gray-600 text-sm mt-0.5">01</span>
            <p className="text-sm text-gray-300">
              Chat naturally with an AI for up to 5 minutes
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-gray-600 text-sm mt-0.5">02</span>
            <p className="text-sm text-gray-300">
              Answer a short survey about your experience
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-gray-600 text-sm mt-0.5">03</span>
            <p className="text-sm text-gray-300">
              See your results and learn what we were really studying
            </p>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition text-base disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Begin →'}
        </button>

        <p className="text-xs text-gray-600 text-center">
          Estimated time: 7 minutes. No personal information is required to participate.
        </p>
      </div>
    </main>
  )
}