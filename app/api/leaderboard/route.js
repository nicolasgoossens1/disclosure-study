import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('leakage', { ascending: true })
    .limit(10)

  return NextResponse.json(data || [])
}

export async function POST(request) {
  const body = await request.json()

  await supabase.from('leaderboard').insert({
    nickname: body.nickname,
    leakage: body.leakage,
    message_count: body.messageCount,
    duration: body.duration
  })

  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('leakage', { ascending: true })
    .limit(10)

  return NextResponse.json(data || [])
}