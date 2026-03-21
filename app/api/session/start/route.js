import { createSession } from '@/lib/sessions'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = createSession()
  return NextResponse.json({
    sessionId: session.sessionId,
    secret: session.secret
  })
}