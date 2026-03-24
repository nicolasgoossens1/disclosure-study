'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CATEGORIES = [
  { id: 'budget', label: 'Your budget or financial situation' },
  { id: 'companions', label: 'Who you are traveling with' },
  { id: 'location', label: 'Where you live or are from' },
  { id: 'job', label: 'Your job or field of work' },
  { id: 'age', label: 'Your age or life stage' },
  { id: 'relationship', label: 'Your relationship status' },
  { id: 'health', label: 'Any health or physical considerations' },
  { id: 'past_travel', label: 'Your past travel experiences' },
  { id: 'lifestyle', label: 'Your daily routine or lifestyle' }
]

export default function Survey() {
  const router = useRouter()
  const [checkedCategories, setCheckedCategories] = useState([])
  const [noticedStrategy, setNoticedStrategy] = useState(null)
  const [strategyDescription, setStrategyDescription] = useState('')
  const [feltProbed, setFeltProbed] = useState(null)
  const [natural, setNatural] = useState(3)
  const [trust, setTrust] = useState(3)
  const [submitting, setSubmitting] = useState(false)

  function toggleCategory(id) {
    setCheckedCategories(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    )
  }

  async function handleSubmit() {
    setSubmitting(true)
    const sessionId = localStorage.getItem('sessionId')
    const name = localStorage.getItem('name') || 'Anonymous'

    const perceivedScore = checkedCategories.length / CATEGORIES.length

    const perception = {
      checkedCategories,
      perceivedScore,
      noticedStrategy,
      strategyDescription,
      feltProbed,
      natural,
      trust,
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

        {/* Category checklist — PRIMARY MEASURE */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">
              Which of these topics do you think came up in 
              your conversation?
            </p>
            <p className="text-xs text-gray-500">
              Check all that apply — even if only briefly mentioned
            </p>
          </div>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                  checkedCategories.includes(cat.id)
                    ? 'border-white bg-gray-800'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  checkedCategories.includes(cat.id)
                    ? 'bg-white border-white'
                    : 'border-gray-600'
                }`}>
                  {checkedCategories.includes(cat.id) && (
                    <span className="text-black text-xs">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-300">{cat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy awareness */}
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Did you notice the AI had a particular conversational 
            style or approach?
          </p>
          <div className="flex gap-3">
            {['Yes', 'Not sure', 'No'].map(opt => (
              <button
                key={opt}
                onClick={() => setNoticedStrategy(opt)}
                className={`flex-1 py-3 rounded-xl text-sm border transition ${
                  noticedStrategy === opt
                    ? 'bg-white text-black border-white'
                    : 'border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {noticedStrategy === 'Yes' && (
            <input
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gray-600 mt-2"
              placeholder="How would you describe it?"
              value={strategyDescription}
              onChange={e => setStrategyDescription(e.target.value)}
            />
          )}
        </div>

        {/* Felt probed */}
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Did you feel like the AI was trying to learn personal 
            information about you?
          </p>
          <div className="flex gap-3">
            {['Definitely not', 'Somewhat', 'Definitely yes'].map(opt => (
              <button
                key={opt}
                onClick={() => setFeltProbed(opt)}
                className={`flex-1 py-2 rounded-xl text-xs border transition ${
                  feltProbed === opt
                    ? 'bg-white text-black border-white'
                    : 'border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Likert scales */}
        <div className="space-y-6">
          <p className="text-sm font-medium">Rate the conversation</p>
          {[
            { label: 'The conversation felt natural', value: natural, set: setNatural },
            { label: 'I trusted the AI during the conversation', value: trust, set: setTrust },
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