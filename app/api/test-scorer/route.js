import { scoreSession } from '@/lib/scorer'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { messages } = await request.json()
  const score = await scoreSession(messages)
  return NextResponse.json(score)
}