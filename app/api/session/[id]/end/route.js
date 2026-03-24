import { scoreSession } from '@/lib/scorer'
import { endSession } from '@/lib/sessions'
import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'

function computeBehavioralMetrics(messages) {
  const userMessages = messages.filter(m => m.role === 'user')
  if (userMessages.length === 0) return {
    avgWordCount: 0,
    totalWords: 0,
    messageCount: 0
  }

  const totalWords = userMessages.reduce((sum, m) => {
    return sum + m.content.trim().split(/\s+/).length
  }, 0)

  return {
    avgWordCount: Math.round(totalWords / userMessages.length),
    totalWords,
    messageCount: userMessages.length
  }
}

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

    console.log('Session messages count:', session.messages?.length)
    console.log('First few user messages:', 
      session.messages
        ?.filter(m => m.role === 'user')
        ?.slice(0, 3)
        ?.map(m => m.content)
    )

    const score = await scoreSession(session.messages)
    console.log('Score result:', JSON.stringify(score))

    const behavioral = computeBehavioralMetrics(session.messages)

    await supabase
      .from('sessions')
      .update({
        leakage_score: score,
        behavioral_metrics: behavioral
      })
      .eq('id', id)

    return NextResponse.json({
      sessionId: session.sessionId,
      condition: session.condition,
      score,
      behavioral,
duration: session.endTime 
  ? new Date(session.endTime) - new Date(session.startTime)
  : 0,      messageCount: session.messages?.length || 0,
      messages: session.messages
    })
  } catch (err) {
    console.error('End session error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}