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
            Help us evaluate an AI assistant
          </h1>
          <p className="text-gray-400 leading-relaxed">
            We are studying how people interact with AI assistants 
            during everyday tasks. You will have a short conversation 
            with an AI to help plan a weekend trip. Afterward we will 
            ask you a few questions about your experience.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="text-gray-600 text-sm mt-0.5">01</span>
            <p className="text-sm text-gray-300">
              Chat with an AI travel assistant for a few minutes
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
              See what the AI learned about you and what we were studying
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
          Estimated time: 7 minutes. No personal information is required.
        </p>
      </div>
    </main>
  )
}