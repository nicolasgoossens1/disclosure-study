function scoreAttribute(transcript, value) {
  const words = value.toLowerCase().split(' ')
  const text = transcript.toLowerCase()
  const matches = words.filter(word => text.includes(word))
  const ratio = matches.length / words.length

  if (ratio === 0) return 0
  if (ratio < 1) return 0.5
  return 1
}

function scoreSession(messages, secret) {
  const transcript = (messages || [])
    .map(m => m.content)
    .join(' ')

  const breakdown = {
    university: scoreAttribute(transcript, secret.university),
    major: scoreAttribute(transcript, secret.major),
    hobby: scoreAttribute(transcript, secret.hobby)
  }

  const total = 
    Object.values(breakdown).reduce((a, b) => a + b, 0) / 3

  return {
    breakdown,
    total: Math.round(total * 100) / 100
  }
}

export { scoreSession }
