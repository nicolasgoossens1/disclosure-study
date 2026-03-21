'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Survey() {
  const router = useRouter()
  const [estimate, setEstimate] = useState(50)
  const [trust, setTrust] = useState(3)
  const [comfort, setComfort] = useState(3)
  const [control, setControl] = useState(3)
  const [perceivedAttrs, setPerceivedAttrs] = useState({
    University: null,
    Major: null,
    Hobby: null
  })
  const [submitting, setSubmitting] = useState(false)

  function setAttr(attr, opt) {
    setPerceivedAttrs(prev => ({ ...prev, [attr]: opt }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    const sessionId = localStorage.getItem('sessionId')
    const nickname = localStorage.getItem('name') || 'Anonymous'

    const perception = {
      estimatedLeakage: estimate,
      trust,
      comfort,
      control,
      perceivedAttributes: perceivedAttrs,
      nickname
    }

    localStorage.setItem('perception', JSON.stringify(perception))

    const endRes = await fetch(`/api/end/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const endData = await endRes.json()

    localStorage.setItem('sessionResults', JSON.stringify({
      leakage: endData.leakage,
      breakdown: endData.breakdown,
      secret: endData.secret,
      duration: endData.duration,
      messageCount: endData.messageCount
    }))

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
            Before we show your score
          </p>
          <h1 className="text-2xl font-medium">
            How do you think you did?
          </h1>
          <p className="text-gray-400 text-sm">
            Answer honestly — your estimates won't affect your score.
          </p>
        </div>

        {/* Leakage estimate */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">
              How much of your secret do you think the AI figured out?
            </p>
            <p className="text-xs text-gray-500">
              0% = nothing revealed · 100% = everything revealed
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Nothing</span>
              <span className="text-white font-medium text-base">
                {estimate}%
              </span>
              <span>Everything</span>
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

        {/* Attribute estimates */}
        <div className="space-y-4">
          <p className="text-sm font-medium">
            Which attributes do you think the AI guessed correctly?
          </p>
          {['University', 'Major', 'Hobby'].map(attr => (
            <div key={attr} className="flex justify-between items-center">
              <span className="text-sm text-gray-300">{attr}</span>
              <div className="flex gap-2">
                {['No', 'Partially', 'Yes'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAttr(attr, opt)}
                    className={`text-xs px-3 py-1 rounded-full border transition ${perceivedAttrs[attr] === opt
                        ? 'bg-white text-black border-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Likert scales */}
        <div className="space-y-6">
          <p className="text-sm font-medium">Rate your experience</p>
          {[
            { label: 'I trusted the AI', value: trust, set: setTrust },
            { label: 'I felt comfortable during the conversation', value: comfort, set: setComfort },
            { label: 'I felt in control of what I shared', value: control, set: setControl },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm text-gray-300">{item.label}</p>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => item.set(n)}
                    className={`flex-1 py-2 rounded-lg text-sm border transition ${item.value === n
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
          {submitting ? 'Saving...' : 'See my results →'}
        </button>

      </div>
    </div>
  )
}