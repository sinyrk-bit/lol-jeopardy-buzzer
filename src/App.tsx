import './App.css'
import { GameBoard } from './components/GameBoard'
import { GameOverScreen } from './components/GameOverScreen'
import { QuestionCard } from './components/QuestionCard'
import { Scoreboard } from './components/Scoreboard'
import { SetupScreen } from './components/SetupScreen'
import { questions } from './data/questions'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { GameState, Question, Screen, Team } from './types/game'

const emptyGameState: GameState = {
  teams: [],
  usedQuestions: [],
  currentQuestion: null,
  showAnswer: false,
  gameFinished: false,
  wrongAnswerCostsPoints: true,
  buzzerQueue: [],
  buzzerLocked: false,
}

function App() {
  const [screen, setScreen] = useLocalStorage<Screen>('lol-jeopardy-screen', 'home')
  const [gameState, setGameState] = useLocalStorage<GameState>('lol-jeopardy-state', emptyGameState)
  const hasSavedGame = gameState.teams.length > 0 && !gameState.gameFinished

  const startGame = (teams: Team[], wrongAnswerCostsPoints: boolean) => {
    setGameState({
      ...emptyGameState,
      teams,
      wrongAnswerCostsPoints,
    })
    setScreen('game')
  }

  const newGame = () => {
    if (hasSavedGame && !window.confirm('Laufendes Spiel wirklich verwerfen?')) {
      return
    }

    setGameState(emptyGameState)
    setScreen('setup')
  }

  const openQuestion = (question: Question) => {
    setGameState((current) => ({
      ...current,
      currentQuestion: question,
      showAnswer: false,
      buzzerQueue: [],
      buzzerLocked: false,
    }))
  }

  const finishQuestion = (teamId?: string, correct?: boolean) => {
    setGameState((current) => {
      if (!current.currentQuestion) {
        return current
      }

      const delta =
        teamId && correct
          ? current.currentQuestion.value
          : teamId && current.wrongAnswerCostsPoints
            ? -current.currentQuestion.value
            : 0
      const usedQuestions = Array.from(new Set([...current.usedQuestions, current.currentQuestion.id]))
      const gameFinished = usedQuestions.length === questions.length

      if (gameFinished) {
        setScreen('gameOver')
      }

      return {
        ...current,
        teams: current.teams.map((team) => (team.id === teamId ? { ...team, score: team.score + delta } : team)),
        usedQuestions,
        currentQuestion: null,
        showAnswer: false,
        gameFinished,
        buzzerQueue: [],
        buzzerLocked: false,
      }
    })
  }

  const buzz = (teamId: string) => {
    setGameState((current) => {
      if (current.buzzerLocked || current.buzzerQueue.some((entry) => entry.teamId === teamId)) {
        return current
      }

      return {
        ...current,
        buzzerQueue: [
          ...current.buzzerQueue,
          {
            teamId,
            order: current.buzzerQueue.length + 1,
            timestamp: Date.now(),
          },
        ],
      }
    })
  }

  if (screen === 'setup') {
    return <SetupScreen onStart={startGame} onBack={() => setScreen('home')} />
  }

  if (screen === 'gameOver' || gameState.gameFinished) {
    return <GameOverScreen teams={gameState.teams} onNewGame={newGame} />
  }

  if (screen === 'game' && gameState.teams.length > 0) {
    return (
      <main className="game-layout">
        <header className="top-bar">
          <button className="brand-button" type="button" onClick={() => setScreen('home')}>
            League Jeopardy
          </button>
          <button className="secondary-button" type="button" onClick={newGame}>
            Neues Spiel
          </button>
        </header>

        <Scoreboard teams={gameState.teams} />

        {gameState.currentQuestion ? (
          <QuestionCard
            question={gameState.currentQuestion}
            teams={gameState.teams}
            showAnswer={gameState.showAnswer}
            wrongAnswerCostsPoints={gameState.wrongAnswerCostsPoints}
            buzzerQueue={gameState.buzzerQueue}
            buzzerLocked={gameState.buzzerLocked}
            onShowAnswer={() => setGameState((current) => ({ ...current, showAnswer: true, buzzerLocked: true }))}
            onAward={(teamId, correct) => finishQuestion(teamId, correct)}
            onNoAnswer={() => finishQuestion()}
            onBackToBoard={() => setGameState((current) => ({ ...current, currentQuestion: null }))}
            onBuzz={buzz}
            onResetBuzzers={() => setGameState((current) => ({ ...current, buzzerQueue: [], buzzerLocked: false }))}
            onToggleBuzzerLock={() => setGameState((current) => ({ ...current, buzzerLocked: !current.buzzerLocked }))}
          />
        ) : (
          <GameBoard questions={questions} usedQuestions={gameState.usedQuestions} onSelectQuestion={openQuestion} />
        )}
      </main>
    )
  }

  return (
    <main className="home-screen">
      <div className="home-scene" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <section className="home-content">
        <p className="eyebrow">Runeterra Quiz Arena</p>
        <h1>League of Legends Jeopardy</h1>
        <p>
          Ein spielbereites Host-Board mit Teams, Punkten, Buzzer-Reihenfolge und Fragen von 100 bis 500.
        </p>
        <div className="screen-actions">
          <button className="primary-button" type="button" onClick={() => (hasSavedGame ? setScreen('game') : setScreen('setup'))}>
            {hasSavedGame ? 'Spiel fortsetzen' : 'Spiel starten'}
          </button>
          <button className="secondary-button" type="button" onClick={() => setScreen('setup')}>
            Spiel konfigurieren
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
