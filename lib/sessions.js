const { v4: uuidv4 } = require('uuid')
const { getRandomSecret } = require('./secrets')

const CONDITIONS = ['neutral', 'friendly', 'persuasive']

// In-memory store
const sessions = {}

function createSession() {
  const id = uuidv4()
  const condition = 
    CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)]
  const secret = getRandomSecret()

  sessions[id] = {
    sessionId: id,
    condition,
    secret,
    messages: [],
    startTime: Date.now(),
    endTime: null,
    leakageScore: null
  }

  return sessions[id]
}

function getSession(id) {
  return sessions[id] || null
}

function addMessage(id, role, content) {
  if (!sessions[id]) return null
  sessions[id].messages.push({ role, content, timestamp: Date.now() })
  return sessions[id]
}

function endSession(id) {
  if (!sessions[id]) return null
  sessions[id].endTime = Date.now()
  return sessions[id]
}

export { addMessage, createSession, endSession, getSession }
