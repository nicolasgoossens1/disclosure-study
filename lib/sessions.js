import { v4 as uuidv4 } from 'uuid'
import { getRandomSecret } from './secrets'
import supabase from './supabase'

const CONDITIONS = ['neutral', 'friendly', 'persuasive']

async function assignCondition() {
  const { data } = await supabase
    .from('sessions')
    .select('condition')

  const counts = { neutral: 0, friendly: 0, persuasive: 0 }
  if (data) {
    data.forEach(s => {
      if (counts[s.condition] !== undefined) counts[s.condition]++
    })
  }

  const min = Math.min(...Object.values(counts))
  const candidates = CONDITIONS.filter(c => counts[c] === min)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function createSession() {
  const id = uuidv4()
  const condition = await assignCondition()
  const secret = getRandomSecret()

  const session = {
    id,
    condition,
    secret,
    messages: [],
    start_time: Date.now(),
    end_time: null,
    leakage_score: null
  }

  await supabase.from('sessions').insert({
    id: session.id,
    condition: session.condition,
    secret: session.secret,
    messages: session.messages,
    start_time: session.start_time,
    end_time: session.end_time,
    leakage_score: session.leakage_score
  })

  return {
    sessionId: id,
    condition,
    secret,
    messages: [],
    startTime: session.start_time
  }
}

export async function getSession(id) {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) return null

  return {
    sessionId: data.id,
    condition: data.condition,
    secret: data.secret,
    messages: data.messages,
    startTime: data.start_time,
    endTime: data.end_time,
    leakageScore: data.leakage_score
  }
}

export async function addMessage(id, role, content) {
  const session = await getSession(id)
  if (!session) return null

  const messages = [
    ...session.messages,
    { role, content, timestamp: Date.now() }
  ]

  await supabase
    .from('sessions')
    .update({ messages })
    .eq('id', id)

  return { ...session, messages }
}

export async function endSession(id) {
  const { data } = await supabase
    .from('sessions')
    .update({ end_time: Date.now() })
    .eq('id', id)
    .select()
    .single()

  if (!data) return null

  return {
    sessionId: data.id,
    condition: data.condition,
    secret: data.secret,
    messages: data.messages,
    startTime: data.start_time,
    endTime: data.end_time,
    leakageScore: data.leakage_score
  }
}