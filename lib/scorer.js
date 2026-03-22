function normalize(text) {
  if (!text) return ''
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function scoreAttribute(transcript, value) {
  const normVal = normalize(value)
  if (!normVal) return 0
  const words = Array.from(new Set(normVal.split(' ').filter(Boolean)))
  if (words.length === 0) return 0
  const normTranscript = normalize(transcript)
  const matches = words.filter(word => normTranscript.includes(word))
  const ratio = matches.length / words.length
  if (ratio === 0) return 0
  if (ratio < 1) return 0.5
  return 1
}

function scoreSession(messages = [], secret = {}) {
  const transcript = (messages || []).map(m => (m && m.content) || '').join(' ')
  const keys = ['university', 'major', 'hobby']
  const breakdown = {}
  let sum = 0
  keys.forEach(k => {
    const s = scoreAttribute(transcript, secret[k])
    breakdown[k] = s
    sum += s
  })
  const total = Math.round((sum / keys.length) * 100) / 100
  return { breakdown, total }
}

export { scoreSession }
