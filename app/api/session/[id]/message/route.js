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
  const session = await getSession(id)
  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  const { content, role, skipReply } = await request.json()

  // Opening message save — just store it, don't generate a reply
  if (skipReply) {
    await addMessage(id, role || 'assistant', content)
    return NextResponse.json({ ok: true })
  }

  await addMessage(id, 'user', content)

  const updatedSession = await getSession(id)

  const messages = [
    { role: 'system', content: PROMPTS[updatedSession.condition] },
    ...(updatedSession.messages || []).map(m => ({
      role: m.role,
      content: m.content
    }))
  ]

  const response = await openai.chat.completions.create({
    model: config.model,
    messages
  })

  const reply = response.choices[0].message.content
  await addMessage(id, 'assistant', reply)

  return NextResponse.json({ reply })
}