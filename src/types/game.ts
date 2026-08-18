export type Difficulty = 'easy' | 'medium' | 'hard'

export type Question = {
  id: string
  category: string
  value: number
  question: string
  answer: string
  mode?: 'standard' | 'estimate'
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

export type Player = {
  id: string
  name: string
  teamId: string | null
  connected: boolean
}

export type BuzzerEntry = {
  teamId: string
  order: number
  timestamp: number
}

export type EstimateSubmission = {
  teamId: string
  playerId: string
  playerName: string
  value: number
  finalized: boolean
  timestamp: number
}

export type ChatScope = 'public' | 'team'

export type ChatMessage = {
  id: string
  scope: ChatScope
  teamId: string | null
  authorId: string
  authorName: string
  text: string
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
  players: Player[]
  activeTeamId: string | null
  requestedQuestionId: string | null
  requestedByTeamId: string | null
  estimateSubmissions: EstimateSubmission[]
  chatMessages: ChatMessage[]
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
      type: 'player-joined'
      player: Player
    }
  | {
      type: 'player-left'
      playerId: string
    }
  | {
      type: 'buzz'
      playerId: string
    }
  | {
      type: 'pick-question'
      playerId: string
      questionId: string
    }
  | {
      type: 'submit-estimate'
      playerId: string
      value: number
      finalized: boolean
    }
  | {
      type: 'send-chat'
      playerId: string
      scope: ChatScope
      text: string
    }
