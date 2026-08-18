export type Difficulty = 'easy' | 'medium' | 'hard'

export type Question = {
  id: string
  category: string
  value: number
  question: string
  answer: string
  questionImage?: string
  answerImage?: string
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

export type NetworkRole = 'host' | 'player'

export type NetworkStatus = 'idle' | 'connecting' | 'connected' | 'error'

export type PublicGameSnapshot = {
  state: GameState
  screen: Screen
  questionsTotal: number
}

export type HostMessage =
  | {
      type: 'snapshot'
      payload: PublicGameSnapshot
    }
  | {
      type: 'host-ready'
      roomId: string
    }

export type PlayerMessage =
  | {
      type: 'join'
      playerName: string
    }
  | {
      type: 'buzz'
      teamId: string
    }
