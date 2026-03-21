import config from '@/lib/config'
import PROMPTS from '@/lib/prompts'
import { addMessage, getSession } from '@/lib/sessions'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL
})

export async function POST(request, { params }) {
  const { id } = await params
  const session = getSession(id)
  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  const { content } = await request.json()

  addMessage(id, 'user', content)

  const messages = [
    { role: 'system', content: PROMPTS[session.condition] },
    ...session.messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ]

  const response = await openai.chat.completions.create({
    model: config.model,
    messages
  })

  const reply = response.choices[0].message.content
  addMessage(id, 'assistant', reply)

  return NextResponse.json({ reply })
}