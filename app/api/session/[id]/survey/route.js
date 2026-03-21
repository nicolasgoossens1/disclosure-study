import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const { id } = await params
  const body = await request.json()

  const { error } = await supabase
    .from('survey_results')
    .insert({
      session_id: id,
      name: body.nickname,
      estimated_leakage: body.estimatedLeakage,
      trust: body.trust,
      comfort: body.comfort,
      control: body.control
    })

  if (error) {
    console.error('Survey save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}