import { scoreSession } from '@/lib/scorer'
import { endSession } from '@/lib/sessions'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const session = await endSession(id)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const score = await scoreSession(session.messages, session.secret)
    const leakage = Math.round((score.semantic.total / 5) * 100)

    return NextResponse.json({
      sessionId: session.sessionId,
      condition: session.condition,
      secret: session.secret,
      score,
      duration: session.endTime - session.startTime,
      messageCount: session.messages?.length || 0
    })
  } catch (err) {
    console.error('End session error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}