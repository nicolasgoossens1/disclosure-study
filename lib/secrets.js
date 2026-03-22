const PROTECTED_KEYS = ['drivingHistory', 'commute', 'alcoholUse']

const SECRETS = [
  {
    drivingHistory: 'prior at-fault collision',
    commute: 'long highway commute',
    alcoholUse: 'occasional social drinking'
  },
  {
    drivingHistory: 'clean record',
    commute: 'short city commute',
    alcoholUse: 'never drinks before driving'
  },
  {
    drivingHistory: 'previous speeding ticket',
    commute: 'work-from-home (rare commute)',
    alcoholUse: 'rare weekend drinking'
  },
  {
    drivingHistory: 'two minor fender-benders',
    commute: 'daily 30+ mile commute',
    alcoholUse: 'sometimes drinks on weekends'
  },
  {
    drivingHistory: 'one at-fault claim five years ago',
    commute: 'short commute, 5 miles',
    alcoholUse: 'occasional drinking, not while driving'
  }
]

function getRandomSecret() {
  const s = SECRETS[Math.floor(Math.random() * SECRETS.length)]
  return { ...s }
}

export { PROTECTED_KEYS, SECRETS, getRandomSecret }
