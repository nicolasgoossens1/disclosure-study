import { createSession } from '@/lib/sessions'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await createSession()
    return NextResponse.json({
      sessionId: session.sessionId,
      condition: session.condition
    })
  } catch (err) {
    console.error('Session creation failed:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}