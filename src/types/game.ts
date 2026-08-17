export type Difficulty = 'easy' | 'medium' | 'hard'

export type Question = {
  id: string
  category: string
  value: number
  question: string
  answer: string
  difficulty?: Difficulty
  explanation?: string
}

export type Team = {
  id: string
  name: string
  color: string
  score: number
}

export type BuzzerEntry = {
  teamId: string
  order: number
  timestamp: number
}

export type GameState = {
  teams: Team[]
  usedQuestions: string[]
  currentQuestion: Question | null
  showAnswer: boolean
  gameFinished: boolean
  wrongAnswerCostsPoints: boolean
  buzzerQueue: BuzzerEntry[]
  buzzerLocked: boolean
}

export type Screen = 'home' | 'setup' | 'game' | 'gameOver'
