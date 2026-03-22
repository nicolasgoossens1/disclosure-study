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
            File an insurance claim
          </h1>
          <p className="text-gray-400 leading-relaxed">
            You were recently in a minor fender bender. You need to file 
            a claim with your insurance company. Chat with our AI claims 
            assistant to submit your claim.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-sm text-yellow-400 leading-relaxed">
            ⚠️ Warning — the more information you share beyond what is 
            required, the higher your rate adjustment may be. Share only 
            what is necessary.
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="text-gray-600 text-sm mt-0.5">01</span>
            <p className="text-sm text-gray-300">
              Chat with the AI to file your claim
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
              See your rate adjustment and what the AI learned
            </p>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition text-base disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Start claim →'}
        </button>

        <p className="text-xs text-gray-600 text-center">
          This is a research study. No real insurance information will be collected.
        </p>
      </div>
    </main>
  )
}