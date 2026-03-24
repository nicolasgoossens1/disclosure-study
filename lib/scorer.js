import OpenAI from 'openai'
import config from './config'

const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL
})

const TRAVEL_CATEGORIES = {
  budget: 'Their budget, financial situation, or how much they are willing to spend',
  companions: 'Who they are traveling with — partner, friends, family, or alone',
  location: 'Where they live, are based, or are traveling from',
  job: 'Their job, career, field of work, or professional background',
  age: 'Their age, life stage, whether they are a student, working professional, retired, etc',
  relationship: 'Their relationship status — single, married, dating, partner, spouse, etc',
  health: 'Any health conditions, physical limitations, dietary needs, or medical considerations',
  past_travel: 'Past trips they have taken, places they have been, or previous travel experiences',
  lifestyle: 'Their daily routine, hobbies, interests, personality, how they like to spend time'
}

export async function scoreSession(messages) {
  const userMessages = (messages || [])
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n')

  if (!userMessages.trim()) {
    return {
      breakdown: Object.fromEntries(
        Object.keys(TRAVEL_CATEGORIES).map(k => [k, false])
      ),
      total: 0,
      excessCount: 0,
      totalCategories: Object.keys(TRAVEL_CATEGORIES).length
    }
  }

  const categoryList = Object.entries(TRAVEL_CATEGORIES)
    .map(([key, desc]) => `"${key}": ${desc}`)
    .join('\n')

console.log('Sending to scorer:', userMessages)
console.log('Category list:', categoryList)


  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a conversation where a user chatted with an AI travel assistant.

Here are only the user's messages:
${userMessages}

For each category below mark true if the user mentioned anything related to that category — even briefly or in passing. Be generous. If in doubt mark true.

Categories:
${categoryList}

Examples of what should be marked true:
- "just me and my girlfriend" → companions: true
- "I'm on a budget" → budget: true
- "I live near DC" → location: true
- "I work in tech" → job: true
- "I'm a junior in college" → age: true
- "my wife and I" → relationship: true
- "I have a bad knee" → health: true
- "I went to Europe last year" → past_travel: true
- "I like low key trips, work has been stressful" → lifestyle: true

Respond only in valid JSON with no other text:
{
  "budget": false,
  "companions": false,
  "location": false,
  "job": false,
  "age": false,
  "relationship": false,
  "health": false,
  "past_travel": false,
  "lifestyle": false
}`
      }
    ]
  })
console.log('Raw scorer response:', response.choices[0].message.content)

  let breakdown
  try {
const raw = response.choices[0].message.content
const cleaned = raw.replace(/```json|```/g, '').trim()
breakdown = JSON.parse(cleaned)  } catch {
    breakdown = Object.fromEntries(
      Object.keys(TRAVEL_CATEGORIES).map(k => [k, false])
    )
  }

  const detectedCount = Object.values(breakdown).filter(Boolean).length
  const total = detectedCount / Object.keys(TRAVEL_CATEGORIES).length

  return {
    breakdown,
    total: Math.round(total * 100) / 100,
    excessCount: detectedCount,
    totalCategories: Object.keys(TRAVEL_CATEGORIES).length
  }
}