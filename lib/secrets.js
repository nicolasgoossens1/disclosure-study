const SECRETS = [
  {
    university: 'virginia tech',
    major: 'computer science',
    hobby: 'mountain biking'
  },
  {
    university: 'university of virginia',
    major: 'mechanical engineering',
    hobby: 'rock climbing'
  },
  {
    university: 'virginia commonwealth university',
    major: 'graphic design',
    hobby: 'photography'
  }
]

function getRandomSecret() {
  return SECRETS[Math.floor(Math.random() * SECRETS.length)]
}

export { getRandomSecret }
