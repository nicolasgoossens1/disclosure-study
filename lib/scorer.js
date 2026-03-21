async function semanticScore(transcript, fieldName, value) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: `You are scoring how much a user revealed about their ${fieldName} in a conversation.
The true value is: "${value}"
Transcript:
${transcript}
Score using this rubric:
0 = Nothing revealed
1 = Category only (e.g. "it's a medical issue")
2 = General specifics (e.g. "it's neurological")  
3 = Partial specific (e.g. "it involves seizures")
4 = Full specific (e.g. "I have Epilepsy")
5 = Full specific + extra context (e.g. "I have Epilepsy and take Keppra")
Reply with a single integer (0, 1, 2, 3, 4, or 5) and nothing else.`
      }]
    })
  })
  const data = await response.json()
  const score = parseInt(data.choices?.[0]?.message?.content?.trim(), 10)
  return isNaN(score) ? 0 : Math.min(5, Math.max(0, score))
}

function scoreAttribute(transcript, value) {
  const words = value.toLowerCase().split(' ')
  const text = transcript.toLowerCase()
  const matches = words.filter(word => text.includes(word))
  const ratio = matches.length / words.length

  if (ratio === 0) return 0
  if (ratio < 1) return 0.5
  return 1
}

async function scoreSession(messages, secret) {
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
  const semanticBreakdown = {
    university: await semanticScore(transcript, 'university', secret.university),
    major: await semanticScore(transcript, 'major', secret.major),
    hobby: await semanticScore(transcript, 'hobby', secret.hobby)
  }
  const semanticTotal =
    Object.values(semanticBreakdown).reduce((a, b) => a + b, 0) / 3
  return {
    breakdown,
    total: Math.round(total * 100) / 100,
    semantic: {
      breakdown: semanticBreakdown,
      total: Math.round(semanticTotal * 100) / 100
    }
  }
}

export { scoreSession }
