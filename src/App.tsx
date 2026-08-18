import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { GameBoard } from './components/GameBoard'
import { GameOverScreen } from './components/GameOverScreen'
import { HostRoomPanel } from './components/HostRoomPanel'
import { LobbyOverlay } from './components/LobbyOverlay'
import { PlayerView } from './components/PlayerView'
import { QuestionStartOverlay } from './components/QuestionStartOverlay'
import { QuestionCard } from './components/QuestionCard'
import { Scoreboard } from './components/Scoreboard'
import { SetupScreen } from './components/SetupScreen'
import { questions } from './data/questions'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useRoom } from './hooks/useRoom'
import type { GameState, Player, PlayerMessage, Question, Screen, Team } from './types/game'

const emptyGameState: GameState = {
  teams: [],
  usedQuestions: [],
  currentQuestion: null,
  showAnswer: false,
  gameFinished: false,
  wrongAnswerCostsPoints: true,
  buzzerQueue: [],
  buzzerLocked: true,
  players: [],
}

function App() {
  const joinRoomId = useMemo(() => new URLSearchParams(window.location.search).get('join') ?? '', [])
  const [screen, setScreen] = useLocalStorage<Screen>('lol-jeopardy-screen', joinRoomId ? 'game' : 'home')
  const [gameState, setGameState] = useLocalStorage<GameState>('lol-jeopardy-state', emptyGameState)
  const [playerName, setPlayerName] = useState('')
  const [playerMode, setPlayerMode] = useState(Boolean(joinRoomId))
  const [showLobby, setShowLobby] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState<Question | null>(null)
  const players = useMemo(() => gameState.players ?? [], [gameState.players])
  const hasSavedGame = gameState.teams.length > 0 && !gameState.gameFinished
  const getQuestionValue = (question: Question, usedCount = gameState.usedQuestions.length) =>
    questions.length - usedCount <= 5 ? question.value * 2 : question.value

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

  const {
    roomId,
    inviteUrl,
    status,
    error,
    guestCount,
    lastSnapshot,
    playerId,
    hostRoom,
    joinRoom,
    broadcastSnapshot,
    sendBuzz,
  } = useRoom({
    initialRoomId: joinRoomId,
    getSnapshot: () => ({
      state: { ...gameState, players },
      screen,
      questionsTotal: questions.length,
    }),
    onPlayerMessage: (message: PlayerMessage) => {
      if (message.type === 'buzz') {
        const player = players.find((candidate) => candidate.id === message.playerId)
        if (player?.teamId) {
          buzz(player.teamId)
        }
      }

      if (message.type === 'player-joined') {
        setGameState((current) => {
          const currentPlayers = current.players ?? []
          const knownPlayer = currentPlayers.find((player) => player.id === message.player.id)
          const nextPlayer: Player = {
            ...message.player,
            teamId: knownPlayer?.teamId ?? message.player.teamId ?? null,
            connected: true,
          }

          return {
            ...current,
            players: knownPlayer
              ? currentPlayers.map((player) => (player.id === message.player.id ? nextPlayer : player))
              : [...currentPlayers, nextPlayer],
          }
        })
      }

      if (message.type === 'player-left') {
        setGameState((current) => ({
          ...current,
          players: (current.players ?? []).map((player) =>
            player.id === message.playerId ? { ...player, connected: false } : player,
          ),
        }))
      }
    },
  })

  useEffect(() => {
    if (playerMode && lastSnapshot) {
      setGameState(lastSnapshot.state)
      setScreen(lastSnapshot.screen)
    }
  }, [lastSnapshot, playerMode, setGameState, setScreen])

  useEffect(() => {
    if (playerMode || !inviteUrl) {
      return
    }

    broadcastSnapshot({
      state: { ...gameState, players },
      screen,
      questionsTotal: questions.length,
    })
  }, [broadcastSnapshot, gameState, guestCount, inviteUrl, playerMode, players, screen])

  const startGame = (teams: Team[], wrongAnswerCostsPoints: boolean) => {
    setGameState({
      ...emptyGameState,
      teams,
      wrongAnswerCostsPoints,
    })
    setPlayerMode(false)
    setScreen('game')
  }

  const assignPlayer = (assignedPlayerId: string, teamId: string | null) => {
    setGameState((current) => ({
      ...current,
      players: (current.players ?? []).map((player) => (player.id === assignedPlayerId ? { ...player, teamId } : player)),
    }))
  }

  const newGame = () => {
    if (hasSavedGame && !window.confirm('Laufendes Spiel wirklich verwerfen?')) {
      return
    }

    setGameState(emptyGameState)
    setPlayerMode(false)
    setScreen('setup')
  }

  const openQuestion = (question: Question) => {
    setPendingQuestion(question)
  }

  const startPendingQuestion = (useBuzzer: boolean) => {
    if (!pendingQuestion) {
      return
    }

    setGameState((current) => ({
      ...current,
      currentQuestion: pendingQuestion,
      showAnswer: false,
      buzzerQueue: [],
      buzzerLocked: !useBuzzer,
    }))
    setPendingQuestion(null)
  }

  const finishQuestion = (teamId?: string, correct?: boolean) => {
    setGameState((current) => {
      if (!current.currentQuestion) {
        return current
      }

      const effectiveValue = getQuestionValue(current.currentQuestion, current.usedQuestions.length)
      const delta =
        teamId && correct
          ? effectiveValue
          : teamId && current.wrongAnswerCostsPoints
            ? -Math.ceil(effectiveValue / 2)
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
        buzzerLocked: true,
      }
    })
  }

  if (playerMode) {
    if (!lastSnapshot) {
      return (
        <main className="join-screen">
          <section className="home-content join-card">
            <p className="eyebrow">Room {roomId || joinRoomId}</p>
            <h1>Join the Rift</h1>
            <label>
              Name
              <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Dein Name" />
            </label>
            <button className="primary-button" type="button" onClick={() => joinRoom(joinRoomId, playerName || 'Player')}>
              Verbinden
            </button>
            <p>{status === 'connected' ? 'Verbunden. Warte auf den Host.' : 'Verbinde mit Host...'}</p>
            {error ? <p className="error-text">{error}</p> : null}
          </section>
        </main>
      )
    }

    return (
      <PlayerView
        gameState={{ ...gameState, players }}
        playerId={playerId}
        status={status}
        error={error}
        onBuzz={sendBuzz}
      />
    )
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
          <HostRoomPanel
            inviteUrl={inviteUrl}
            status={status}
            guestCount={guestCount}
            error={error}
            onStartRoom={hostRoom}
            onOpenLobby={() => setShowLobby(true)}
          />
          <button className="secondary-button" type="button" onClick={newGame}>
            Neues Spiel
          </button>
        </header>

        <Scoreboard teams={gameState.teams} players={players} />

        {gameState.currentQuestion ? (
          <QuestionCard
            question={gameState.currentQuestion}
            displayValue={getQuestionValue(gameState.currentQuestion)}
            teams={gameState.teams}
            showAnswer={gameState.showAnswer}
            wrongAnswerCostsPoints={gameState.wrongAnswerCostsPoints}
            buzzerQueue={gameState.buzzerQueue}
            buzzerLocked={gameState.buzzerLocked}
            onShowAnswer={() => setGameState((current) => ({ ...current, showAnswer: true, buzzerLocked: true }))}
            onAward={(teamId, correct) => finishQuestion(teamId, correct)}
            onNoAnswer={() => finishQuestion()}
            onBackToBoard={() => setGameState((current) => ({ ...current, currentQuestion: null, buzzerLocked: true }))}
            onBuzz={buzz}
            onResetBuzzers={() => setGameState((current) => ({ ...current, buzzerQueue: [], buzzerLocked: true }))}
            onToggleBuzzerLock={() => setGameState((current) => ({ ...current, buzzerLocked: !current.buzzerLocked }))}
          />
        ) : (
          <GameBoard
            questions={questions}
            usedQuestions={gameState.usedQuestions}
            getQuestionValue={getQuestionValue}
            onSelectQuestion={openQuestion}
          />
        )}

        {pendingQuestion ? (
          <QuestionStartOverlay
            question={pendingQuestion}
            displayValue={getQuestionValue(pendingQuestion)}
            teams={gameState.teams}
            players={players}
            onStartWithBuzzer={() => startPendingQuestion(true)}
            onStartWithoutBuzzer={() => startPendingQuestion(false)}
            onCancel={() => setPendingQuestion(null)}
          />
        ) : null}

        {showLobby ? (
          <LobbyOverlay
            inviteUrl={inviteUrl}
            status={status}
            players={players}
            teams={gameState.teams}
            onAssignPlayer={assignPlayer}
            onClose={() => setShowLobby(false)}
            onStartRoom={hostRoom}
          />
        ) : null}
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
        <p className="eyebrow">Project Neon Rift</p>
        <h1>League of Legends Jeopardy</h1>
        <p>Cyberpunk-Showboard mit Host-Link, Live-Buzzer, Teams, Punkten und kompletter Fragenkontrolle.</p>
        <div className="screen-actions">
          <button className="primary-button" type="button" onClick={() => (hasSavedGame ? setScreen('game') : setScreen('setup'))}>
            {hasSavedGame ? 'Spiel fortsetzen' : 'Host-Spiel starten'}
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
