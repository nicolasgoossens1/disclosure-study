import supabase from './supabase'

export async function addScore(entry) {
  await supabase.from('leaderboard').insert({
    nickname: entry.nickname,
    leakage: entry.leakage,
    message_count: entry.messageCount,
    duration: entry.duration
  })

  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('leakage', { ascending: true })
    .limit(10)

  return data || []
}

export async function getScores() {
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('leakage', { ascending: true })
    .limit(10)

  return data || []
}