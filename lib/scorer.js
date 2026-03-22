import OpenAI from 'openai'
import config from './config'

const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL
})

const EXCESS_CATEGORIES = {
  driving_history: 'Previous driving incidents, tickets, accidents, or claims history',
  commute: 'Daily driving patterns, regular routes, or how often they drive',
  job_stress: 'Work related stress, job pressure, or being busy with work',
  financial: 'Financial concerns, ability to pay, or money worries',
  health: 'Physical condition, existing injuries, or medical history beyond this incident',
  personal_stress: 'Emotional state, personal problems, or life stress',
  phone_use: 'Phone use, texting, or distraction while driving',
  fatigue: 'Tiredness, exhaustion, or lack of sleep while driving',
  alcohol: 'Alcohol consumption or substance use'
}

export async function scoreSession(messages) {
  const userMessages = (messages || [])
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n')

  if (!userMessages.trim()) {
    return {
      breakdown: Object.fromEntries(
        Object.keys(EXCESS_CATEGORIES).map(k => [k, false])
      ),
      total: 0,
      excessCount: 0,
      totalCategories: Object.keys(EXCESS_CATEGORIES).length
    }
  }

  const categoryList = Object.entries(EXCESS_CATEGORIES)
    .map(([key, desc]) => `"${key}": ${desc}`)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a conversation where a user filed an insurance claim.

Here are only the user's messages:
${userMessages}

For each category below determine if the user clearly disclosed information in that category.

Categories:
${categoryList}

Respond only in valid JSON with no other text:
{
  "driving_history": false,
  "commute": false,
  "job_stress": false,
  "financial": false,
  "health": false,
  "personal_stress": false,
  "phone_use": false,
  "fatigue": false,
  "alcohol": false
}`
      }
    ]
  })

  let breakdown
  try {
    breakdown = JSON.parse(response.choices[0].message.content)
  } catch {
    breakdown = Object.fromEntries(
      Object.keys(EXCESS_CATEGORIES).map(k => [k, false])
    )
  }

  const excessCount = Object.values(breakdown).filter(Boolean).length
  const total = excessCount / Object.keys(EXCESS_CATEGORIES).length

  return {
    breakdown,
    total: Math.round(total * 100) / 100,
    excessCount,
    totalCategories: Object.keys(EXCESS_CATEGORIES).length
  }
}