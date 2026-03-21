import { scoreSession } from '@/lib/scorer'
import { endSession } from '@/lib/sessions'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const { id } = await params
  const session = endSession(id)
  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  const score = scoreSession(session.messages, session.secret)
  session.leakageScore = score

  return NextResponse.json({
    sessionId: session.sessionId,
    condition: session.condition,
    secret: session.secret,
    score,
    duration: session.endTime - session.startTime,
    messageCount: session.messages.length
  })
}