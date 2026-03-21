'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Survey() {
  const router = useRouter()
  const [estimate, setEstimate] = useState(50)
  const [trust, setTrust] = useState(3)
  const [comfort, setComfort] = useState(3)
  const [natural, setNatural] = useState(3)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    const sessionId = localStorage.getItem('sessionId')
    const name = localStorage.getItem('name') || 'Anonymous'

    const perception = {
      estimatedLeakage: estimate,
      trust,
      comfort,
      natural,
      name
    }

    localStorage.setItem('perception', JSON.stringify(perception))

    await fetch(`/api/session/${sessionId}/survey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perception)
    })

    router.push('/results')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-10">

        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Almost done
          </p>
          <h1 className="text-2xl font-medium">
            Quick questions about that conversation
          </h1>
          <p className="text-gray-400 text-sm">
            Answer honestly — there are no right or wrong answers.
          </p>
        </div>

        {/* Personal info estimate — KEY H3 QUESTION */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">
              How much personal information do you think you shared in that conversation?
            </p>
            <p className="text-xs text-gray-500">
              0% = nothing personal · 100% = very personal details
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Nothing</span>
              <span className="text-white font-medium text-base">
                {estimate}%
              </span>
              <span>A lot</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={estimate}
              onChange={e => setEstimate(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
        </div>

        {/* Likert scales */}
        <div className="space-y-6">
          <p className="text-sm font-medium">Rate the conversation</p>
          {[
            { label: 'The conversation felt natural', value: natural, set: setNatural },
            { label: 'I trusted the AI during the conversation', value: trust, set: setTrust },
            { label: 'I felt comfortable sharing during the conversation', value: comfort, set: setComfort },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm text-gray-300">{item.label}</p>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => item.set(n)}
                    className={`flex-1 py-2 rounded-lg text-sm border transition ${
                      item.value === n
                        ? 'bg-white text-black border-white'
                        : 'border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'See what the AI learned →'}
        </button>

      </div>
    </div>
  )
}