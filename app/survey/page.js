'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CATEGORIES = [
  { id: 'budget',       label: 'How much money you planned to spend on the trip' },
  { id: 'companions',  label: 'Who you are traveling with' },
  { id: 'location',    label: 'Where you live or are from' },
  { id: 'job',         label: 'Your job or field of work' },
  { id: 'age',         label: 'Your age, or where you are in life (e.g. student, retired, new parent)' },
  { id: 'relationship',label: 'Whether you mentioned a partner, spouse, or significant other' },
  { id: 'health',      label: 'Any health or physical considerations' },
  { id: 'past_travel', label: 'Your past travel experiences' },
  { id: 'lifestyle',   label: 'Your typical daily habits or how you like to spend free time' },
]

const STYLE_OPTIONS = [
  { id: 'minimal',   label: 'Direct and efficient',     sub: 'It asked what it needed and moved on' },
  { id: 'rapport',   label: 'Warm and friendly',        sub: 'It felt genuinely interested in me' },
  { id: 'authority', label: 'Expert and informative',   sub: 'It positioned itself as a knowledgeable system' },
  { id: 'other',     label: 'Hard to describe',         sub: 'None of these quite fit' },
]

const PERSONAL_FREQ = ['Never', 'Sometimes', 'Often', 'Almost always']

function LikertRow({ label, value, onChange, min = 'Strongly disagree', max = 'Strongly agree' }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-300">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg text-sm border transition ${
              value === n
                ? 'bg-white text-black border-white'
                : 'border-gray-800 text-gray-500 hover:border-gray-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function Survey() {
  const router = useRouter()

  // ── Section A: global exposure estimate ──────────────────────────────────
  const [exposurePct, setExposurePct] = useState(50)

  // ── Section B: style perception ──────────────────────────────────────────
  const [styleDescription, setStyleDescription] = useState('')
  const [selectedStyle, setSelectedStyle]       = useState(null)

  // ── Section C: experiential Likerts ──────────────────────────────────────
  const [personalFreq,    setPersonalFreq]    = useState(null)   // 'Never'…'Almost always'
  const [feltControl,     setFeltControl]     = useState(null)   // 1–5
  const [autoAnswer,      setAutoAnswer]      = useState(null)   // 1–5
  const [aiReliable,      setAiReliable]      = useState(null)   // 1–5
  const [feltNatural,     setFeltNatural]     = useState(null)   // 1–5
  const [useAgain,        setUseAgain]        = useState(null)   // 1–5

  // ── Section D: withheld anything? ────────────────────────────────────────
  const [withheld,        setWithheld]        = useState(null)   // 'Yes' | 'No'
  const [withheldReason,  setWithheldReason]  = useState('')

  // ── Section E: category checklist ────────────────────────────────────────
  const [checkedCategories, setCheckedCategories] = useState([])

  // ── Legacy fields kept for API compatibility ──────────────────────────────
  const [noticedStrategy,   setNoticedStrategy]   = useState(null)
  const [feltProbed,        setFeltProbed]         = useState(null)

  const [submitting, setSubmitting] = useState(false)

  function toggleCategory(id) {
    setCheckedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    setSubmitting(true)
    const sessionId = localStorage.getItem('sessionId')
    const name      = localStorage.getItem('name') || 'Anonymous'

    const perceivedScore = checkedCategories.length / CATEGORIES.length

    const perception = {
      // new fields
      exposurePct,
      styleDescription,
      selectedStyle,
      personalFreq,
      feltControl,
      autoAnswer,
      aiReliable,
      feltNatural,
      useAgain,
      withheld,
      withheldReason,
      // legacy fields
      checkedCategories,
      perceivedScore,
      noticedStrategy:      selectedStyle,          // map for backwards-compat
      strategyDescription:  styleDescription,
      feltProbed,
      natural:              feltNatural,
      trust:                feltControl,
      name,
    }

    localStorage.setItem('perception', JSON.stringify(perception))

    await fetch(`/api/session/${sessionId}/survey`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(perception),
    })

    router.push('/results')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-12">

        {/* ── Header ── */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Almost done</p>
          <h1 className="text-2xl font-medium">Quick questions about that conversation</h1>
          <p className="text-gray-400 text-sm">Answer honestly — there are no right or wrong answers.</p>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION A — Global exposure estimate
            Must come BEFORE the checklist so category
            labels cannot anchor the estimate.
        ══════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">
              Roughly what percentage of the conversation felt like it was about{' '}
              <span className="text-white">you personally</span> — your life, situation, or
              background — rather than just the trip?
            </p>
            <p className="text-xs text-gray-500">Give your gut estimate before anything else.</p>
          </div>

          <div className="space-y-3">
            <div className="text-center">
              <span className="text-4xl font-medium">{exposurePct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={exposurePct}
              onChange={e => setExposurePct(Number(e.target.value))}
              className="w-full accent-white"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>None of it</span>
              <span>All of it</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900" />

        {/* ══════════════════════════════════════════════
            SECTION B — Style perception
            Free-text first (unanchored), then recognition.
        ══════════════════════════════════════════════ */}
        <div className="space-y-6">

          {/* B1 — open description */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              In your own words, how would you describe the AI's conversational style?
            </p>
            <p className="text-xs text-gray-500">Just a sentence or two — your first impression.</p>
            <textarea
              rows={3}
              value={styleDescription}
              onChange={e => setStyleDescription(e.target.value)}
              placeholder="e.g. It felt friendly and asked a lot of follow-up questions…"
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gray-600 resize-none"
            />
          </div>

          {/* B2 — recognition (manipulation check) */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Which of these best describes how the AI came across?</p>
            <div className="space-y-2">
              {STYLE_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedStyle(opt.id)}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                    selectedStyle === opt.id
                      ? 'border-white bg-gray-800'
                      : 'border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                    selectedStyle === opt.id ? 'bg-white border-white' : 'border-gray-600'
                  }`}>
                    {selectedStyle === opt.id && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900" />

        {/* ══════════════════════════════════════════════
            SECTION C — Experiential measures
            Personal frequency first (sets the frame),
            then the Likert battery.
        ══════════════════════════════════════════════ */}
        <div className="space-y-8">

          {/* C1 — personal frequency */}
          <div className="space-y-3">
            <p className="text-sm font-medium">
              How often did the AI's questions feel personal rather than just about the trip?
            </p>
            <div className="flex gap-2">
              {PERSONAL_FREQ.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPersonalFreq(opt)}
                  className={`flex-1 py-2 rounded-xl text-xs border transition ${
                    personalFreq === opt
                      ? 'bg-white text-black border-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-400">Rate the conversation</p>

          {/* C2 — felt in control */}
          <LikertRow
            label="I felt in control of what I shared during the conversation"
            value={feltControl}
            onChange={setFeltControl}
          />

          {/* C3 — automatic answering */}
          <LikertRow
            label="I answered the AI's questions without stopping to think about whether I should"
            value={autoAnswer}
            onChange={setAutoAnswer}
            min="Strongly disagree"
            max="Strongly agree"
          />

          {/* C4 — reliability */}
          <LikertRow
            label="The AI seemed reliable and accurate"
            value={aiReliable}
            onChange={setAiReliable}
          />

          {/* C5 — naturalness */}
          <LikertRow
            label="The conversation felt natural"
            value={feltNatural}
            onChange={setFeltNatural}
          />

          {/* C6 — use again */}
          <LikertRow
            label="I would feel comfortable using this AI again"
            value={useAgain}
            onChange={setUseAgain}
            min="Strongly disagree"
            max="Strongly agree"
          />
        </div>

        <div className="border-t border-gray-900" />

        {/* ══════════════════════════════════════════════
            SECTION D — Withheld anything?
        ══════════════════════════════════════════════ */}
        <div className="space-y-4">
          <p className="text-sm font-medium">
            At any point did you choose not to answer something the AI asked?
          </p>
          <div className="flex gap-3">
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setWithheld(opt)}
                className={`flex-1 py-3 rounded-xl text-sm border transition ${
                  withheld === opt
                    ? 'bg-white text-black border-white'
                    : 'border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {withheld === 'Yes' && (
            <input
              type="text"
              value={withheldReason}
              onChange={e => setWithheldReason(e.target.value)}
              placeholder="Why? (optional)"
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gray-600"
            />
          )}
        </div>

        <div className="border-t border-gray-900" />

        {/* ══════════════════════════════════════════════
            SECTION E — Category checklist
            Comes LAST so labels cannot anchor the
            global estimate or style judgements above.
        ══════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">
              Which of these topics do you think came up in your conversation?
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

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'See what the AI learned →'}
        </button>

      </div>
    </div>
  )
}