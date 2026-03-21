import { createSession } from '@/lib/sessions'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await createSession()
    console.log('Created session:', session)
    return NextResponse.json({
      sessionId: session.sessionId,
      secret: session.secret
    })
  } catch (err) {
    console.error('Session creation failed:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}