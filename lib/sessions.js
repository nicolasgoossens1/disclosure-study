import { v4 as uuidv4 } from 'uuid'
import supabase from './supabase'

const CONDITIONS = ['minimal', 'rapport', 'authority']

async function assignCondition() {
  const { data } = await supabase
    .from('sessions')
    .select('condition')

  const counts = { minimal: 0, rapport: 0, authority: 0 }
  if (data) {
    data.forEach(s => {
      if (counts[s.condition] !== undefined) counts[s.condition]++
    })
  }

  const min = Math.min(...Object.values(counts))
  const candidates = CONDITIONS.filter(c => counts[c] === min)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function createSession(forceCondition = null) {
  const id = uuidv4()
  const condition = forceCondition || await assignCondition()

  await supabase.from('sessions').insert({
    id,
    condition,
    messages: [],
    start_time: new Date().toISOString(),
    end_time: null,
    leakage_score: null
  })

  return {
    sessionId: id,
    condition,
    messages: [],
    startTime: new Date().toISOString()
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
    messages: data.messages || [],
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
  await supabase
    .from('sessions')
    .update({ end_time: new Date().toISOString() })
    .eq('id', id)

  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) return null

  return {
    sessionId: data.id,
    condition: data.condition,
    messages: data.messages || [],
    startTime: data.start_time,
    endTime: data.end_time,
    leakageScore: data.leakage_score
  }
}