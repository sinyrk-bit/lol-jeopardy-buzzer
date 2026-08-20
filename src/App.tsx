import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { ChatPanel } from './components/ChatPanel'
import { GameBoard } from './components/GameBoard'
import { GameOverScreen } from './components/GameOverScreen'
import { HostRoomPanel } from './components/HostRoomPanel'
import { LobbyOverlay } from './components/LobbyOverlay'
import { PlayerView } from './components/PlayerView'
import { QuestionStartOverlay } from './components/QuestionStartOverlay'
import { QuestionCard } from './components/QuestionCard'
import { Scoreboard } from './components/Scoreboard'
import { SetupScreen } from './components/SetupScreen'
import { TurnControl } from './components/TurnControl'
import { questions } from './data/questions'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useRoom } from './hooks/useRoom'
import type { ChatMessage, ChatScope, GameState, Player, PlayerMessage, Question, Screen, Team } from './types/game'

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
  activeTeamId: null,
  requestedQuestionId: null,
  requestedByTeamId: null,
  estimateSubmissions: [],
  chatMessages: [],
  wrongTeamIds: [],
  lastQuestionState: null,
}

function getNextTeamId(teams: Team[], currentTeamId: string | null) {
  if (teams.length === 0) {
    return null
  }

  const currentIndex = teams.findIndex((team) => team.id === currentTeamId)
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % teams.length
  return teams[nextIndex]?.id ?? null
}

function makeChatId() {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function getUndoState(state: GameState) {
  return {
    teams: state.teams,
    usedQuestions: state.usedQuestions,
    currentQuestion: state.currentQuestion,
    showAnswer: state.showAnswer,
    buzzerQueue: state.buzzerQueue,
    buzzerLocked: state.buzzerLocked,
    activeTeamId: state.activeTeamId,
    requestedQuestionId: state.requestedQuestionId,
    requestedByTeamId: state.requestedByTeamId,
    estimateSubmissions: state.estimateSubmissions,
    wrongTeamIds: state.wrongTeamIds ?? [],
  }
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
  const activeTeamId = gameState.activeTeamId ?? gameState.teams[0]?.id ?? null
  const hasSavedGame = gameState.teams.length > 0 && !gameState.gameFinished
  const getQuestionValue = (question: Question, usedCount = gameState.usedQuestions.length) => {
    if (question.mode === 'estimate') {
      return 300
    }

    return questions.length - usedCount <= 5 ? question.value * 2 : question.value
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
    sendQuestionPick,
    sendEstimate,
    sendChat,
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

      if (message.type === 'pick-question') {
        const player = players.find((candidate) => candidate.id === message.playerId)
        const pickedQuestion = questions.find((question) => question.id === message.questionId)
        const canPick =
          player?.teamId &&
          player.teamId === activeTeamId &&
          pickedQuestion &&
          !gameState.currentQuestion &&
          !gameState.usedQuestions.includes(pickedQuestion.id)

        if (canPick) {
          setGameState((current) => ({
            ...current,
            requestedQuestionId: pickedQuestion.id,
            requestedByTeamId: player.teamId,
          }))
        }
      }

      if (message.type === 'submit-estimate') {
        const player = players.find((candidate) => candidate.id === message.playerId)
        const teamId = player?.teamId
        const estimateValue = Number(message.value)

        if (teamId && gameState.currentQuestion?.mode === 'estimate' && Number.isFinite(estimateValue)) {
          setGameState((current) => {
            if (current.currentQuestion?.mode !== 'estimate') {
              return current
            }

            const currentSubmissions = current.estimateSubmissions ?? []
            const existingSubmission = currentSubmissions.find((submission) => submission.teamId === teamId)
            if (existingSubmission?.finalized) {
              return current
            }

            const nextSubmission = {
              teamId,
              playerId: player.id,
              playerName: player.name,
              value: estimateValue,
              finalized: message.finalized,
              timestamp: Date.now(),
            }

            return {
              ...current,
              estimateSubmissions: existingSubmission
                ? currentSubmissions.map((submission) => (submission.teamId === teamId ? nextSubmission : submission))
                : [...currentSubmissions, nextSubmission],
            }
          })
        }
      }

      if (message.type === 'send-chat') {
        const player = players.find((candidate) => candidate.id === message.playerId)
        const text = message.text.trim().slice(0, 300)

        if (player && text) {
          const scope: ChatScope = message.scope === 'team' && player.teamId ? 'team' : 'public'
          const chatMessage: ChatMessage = {
            id: makeChatId(),
            scope,
            teamId: scope === 'team' ? player.teamId : null,
            authorId: player.id,
            authorName: player.name,
            text,
            timestamp: Date.now(),
          }

          setGameState((current) => ({
            ...current,
            chatMessages: [...(current.chatMessages ?? []), chatMessage].slice(-120),
          }))
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

  useEffect(() => {
    if (playerMode || screen !== 'game' || gameState.teams.length === 0 || status === 'connected' || status === 'connecting') {
      return
    }

    hostRoom()
  }, [gameState.teams.length, hostRoom, playerMode, screen, status])

  const startGame = (teams: Team[], wrongAnswerCostsPoints: boolean) => {
    setGameState({
      ...emptyGameState,
      teams,
      wrongAnswerCostsPoints,
      activeTeamId: teams[0]?.id ?? null,
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

  const sendHostChat = (scope: ChatScope, text: string, teamId?: string | null) => {
    const trimmed = text.trim().slice(0, 300)
    if (!trimmed) {
      return
    }

    const messageScope: ChatScope = scope === 'team' && teamId ? 'team' : 'public'
    const chatMessage: ChatMessage = {
      id: makeChatId(),
      scope: messageScope,
      teamId: messageScope === 'team' ? teamId ?? null : null,
      authorId: 'host',
      authorName: 'Host',
      text: trimmed,
      timestamp: Date.now(),
    }

    setGameState((current) => ({
      ...current,
      chatMessages: [...(current.chatMessages ?? []), chatMessage].slice(-120),
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
    if (gameState.requestedQuestionId && gameState.requestedQuestionId !== question.id) {
      return
    }

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
      estimateSubmissions: [],
      wrongTeamIds: [],
      requestedQuestionId: null,
      requestedByTeamId: null,
    }))
    setPendingQuestion(null)
  }

  const adjustTeamScore = (teamId: string, delta: number) => {
    setGameState((current) => ({
      ...current,
      teams: current.teams.map((team) => (team.id === teamId ? { ...team, score: team.score + delta } : team)),
    }))
  }

  const restoreLastQuestion = () => {
    setGameState((current) => {
      if (!current.lastQuestionState) {
        return current
      }

      return {
        ...current,
        ...current.lastQuestionState,
        gameFinished: false,
        chatMessages: current.chatMessages ?? [],
        players: current.players ?? [],
        wrongAnswerCostsPoints: current.wrongAnswerCostsPoints,
        lastQuestionState: null,
      }
    })
    setScreen('game')
  }

  const closeQuestionWithoutAward = () => {
    setGameState((current) => {
      if (!current.currentQuestion) {
        return current
      }

      const usedQuestions = Array.from(new Set([...current.usedQuestions, current.currentQuestion.id]))
      const gameFinished = usedQuestions.length === questions.length

      if (gameFinished) {
        setScreen('gameOver')
      }

      return {
        ...current,
        lastQuestionState: getUndoState(current),
        usedQuestions,
        activeTeamId: getNextTeamId(current.teams, current.activeTeamId),
        currentQuestion: null,
        showAnswer: false,
        gameFinished,
        buzzerQueue: [],
        buzzerLocked: true,
        estimateSubmissions: [],
        wrongTeamIds: [],
        requestedQuestionId: null,
        requestedByTeamId: null,
      }
    })
  }

  const markWrongAnswer = (teamId: string) => {
    setGameState((current) => {
      if (!current.currentQuestion || current.currentQuestion.mode === 'estimate') {
        return current
      }

      const effectiveValue = getQuestionValue(current.currentQuestion, current.usedQuestions.length)
      const nextWrongTeamIds = Array.from(new Set([...(current.wrongTeamIds ?? []), teamId]))
      const nextQueue = (current.buzzerQueue ?? []).filter((entry) => entry.teamId !== teamId)
      const shouldCloseQuestion = nextQueue.length === 0
      const usedQuestions = shouldCloseQuestion
        ? Array.from(new Set([...current.usedQuestions, current.currentQuestion.id]))
        : current.usedQuestions
      const gameFinished = shouldCloseQuestion && usedQuestions.length === questions.length

      if (gameFinished) {
        setScreen('gameOver')
      }

      return {
        ...current,
        lastQuestionState: shouldCloseQuestion ? getUndoState(current) : current.lastQuestionState,
        teams: current.teams.map((team) =>
          team.id === teamId ? { ...team, score: team.score - Math.ceil(effectiveValue / 2) } : team,
        ),
        usedQuestions,
        activeTeamId: shouldCloseQuestion ? getNextTeamId(current.teams, current.activeTeamId) : current.activeTeamId,
        currentQuestion: shouldCloseQuestion ? null : current.currentQuestion,
        showAnswer: shouldCloseQuestion ? false : current.showAnswer,
        gameFinished,
        buzzerQueue: nextQueue.map((entry, index) => ({ ...entry, order: index + 1 })),
        buzzerLocked: shouldCloseQuestion ? true : current.buzzerLocked,
        estimateSubmissions: shouldCloseQuestion ? [] : current.estimateSubmissions,
        wrongTeamIds: shouldCloseQuestion ? [] : nextWrongTeamIds,
        requestedQuestionId: shouldCloseQuestion ? null : current.requestedQuestionId,
        requestedByTeamId: shouldCloseQuestion ? null : current.requestedByTeamId,
      }
    })
  }

  const finishQuestion = (teamIds?: string | string[], correct?: boolean) => {
    setGameState((current) => {
      if (!current.currentQuestion) {
        return current
      }

      const awardedTeamIds = new Set(Array.isArray(teamIds) ? teamIds : teamIds ? [teamIds] : [])
      const effectiveValue = getQuestionValue(current.currentQuestion, current.usedQuestions.length)
      const usedQuestions = Array.from(new Set([...current.usedQuestions, current.currentQuestion.id]))
      const gameFinished = usedQuestions.length === questions.length

      if (gameFinished) {
        setScreen('gameOver')
      }

      return {
        ...current,
        lastQuestionState: getUndoState(current),
        teams: current.teams.map((team) => {
          if (!awardedTeamIds.has(team.id)) {
            return team
          }

          const delta = correct
            ? effectiveValue
            : current.currentQuestion?.mode !== 'estimate'
              ? -Math.ceil(effectiveValue / 2)
              : 0

          return { ...team, score: team.score + delta }
        }),
        usedQuestions,
        activeTeamId: getNextTeamId(current.teams, current.activeTeamId),
        currentQuestion: null,
        showAnswer: false,
        gameFinished,
        buzzerQueue: [],
        buzzerLocked: true,
        estimateSubmissions: [],
        wrongTeamIds: [],
        requestedQuestionId: null,
        requestedByTeamId: null,
      }
    })
  }

  if (playerMode) {
    if (!lastSnapshot) {
      return (
        <main className="join-screen">
          <section className="home-content join-card">
            <p className="eyebrow">Raum {roomId || joinRoomId}</p>
            <h1>Der Kluft beitreten</h1>
            <label>
              Name
              <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Dein Name" />
            </label>
            <button className="primary-button" type="button" onClick={() => joinRoom(joinRoomId, playerName || 'Spieler')}>
              Verbinden
            </button>
            <p>{status === 'connected' ? 'Verbunden. Warte auf den Host.' : 'Verbinde mit dem Host...'}</p>
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
        onPickQuestion={sendQuestionPick}
        onSubmitEstimate={sendEstimate}
        onSendChat={sendChat}
      />
    )
  }

  if (screen === 'setup') {
    return <SetupScreen onStart={startGame} onBack={() => setScreen('home')} />
  }

  if (screen === 'gameOver' || gameState.gameFinished) {
    return <GameOverScreen teams={gameState.teams} players={players} onNewGame={newGame} />
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

        <Scoreboard teams={gameState.teams} players={players} activeTeamId={activeTeamId} />
        <TurnControl
          teams={gameState.teams}
          activeTeamId={activeTeamId}
          requestedQuestionId={gameState.requestedQuestionId ?? null}
          onSetActiveTeam={(teamId) =>
            setGameState((current) => ({
              ...current,
              activeTeamId: teamId,
              requestedQuestionId: null,
              requestedByTeamId: null,
            }))
          }
        />
        {gameState.currentQuestion ? (
          <QuestionCard
            question={gameState.currentQuestion}
            displayValue={getQuestionValue(gameState.currentQuestion)}
            teams={gameState.teams}
            showAnswer={gameState.showAnswer}
            wrongAnswerCostsPoints={gameState.wrongAnswerCostsPoints}
            buzzerQueue={gameState.buzzerQueue}
            buzzerLocked={gameState.buzzerLocked}
            estimateSubmissions={gameState.estimateSubmissions ?? []}
            wrongTeamIds={gameState.wrongTeamIds ?? []}
            canRestoreLastQuestion={Boolean(gameState.lastQuestionState)}
            onShowAnswer={() => setGameState((current) => ({ ...current, showAnswer: true, buzzerLocked: true }))}
            onAward={(teamId, correct) => finishQuestion(teamId, correct)}
            onWrongAttempt={markWrongAnswer}
            onNoAnswer={closeQuestionWithoutAward}
            onBackToBoard={() =>
              setGameState((current) => ({
                ...current,
                currentQuestion: null,
                buzzerLocked: true,
                estimateSubmissions: [],
                requestedQuestionId: null,
                requestedByTeamId: null,
              }))
            }
            onRestoreLastQuestion={restoreLastQuestion}
            onAdjustScore={adjustTeamScore}
            onBuzz={buzz}
            onResetBuzzers={() => setGameState((current) => ({ ...current, buzzerQueue: [], buzzerLocked: true }))}
            onToggleBuzzerLock={() => setGameState((current) => ({ ...current, buzzerLocked: !current.buzzerLocked }))}
          />
        ) : (
          <GameBoard
            questions={questions}
            usedQuestions={gameState.usedQuestions}
            getQuestionValue={getQuestionValue}
            selectedQuestionId={gameState.requestedQuestionId ?? null}
            selectionLabel={
              gameState.requestedQuestionId
                ? `${gameState.teams.find((team) => team.id === gameState.requestedByTeamId)?.name ?? 'Team'} hat gewählt`
                : null
            }
            lockedToSelection={Boolean(gameState.requestedQuestionId)}
            onSelectQuestion={openQuestion}
          />
        )}

        {pendingQuestion ? (
          <QuestionStartOverlay
            question={pendingQuestion}
            displayValue={getQuestionValue(pendingQuestion)}
            teams={gameState.teams}
            players={players}
            activeTeamId={activeTeamId}
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
            activeTeamId={activeTeamId}
            onSetActiveTeam={(teamId) => setGameState((current) => ({ ...current, activeTeamId: teamId }))}
            onAssignPlayer={assignPlayer}
            onClose={() => setShowLobby(false)}
            onStartRoom={hostRoom}
          />
        ) : null}

        <ChatPanel
          messages={gameState.chatMessages ?? []}
          teams={gameState.teams}
          role="host"
          currentTeamId={activeTeamId}
          onSend={sendHostChat}
        />
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
        <p className="eyebrow">Projekt Neon-Kluft</p>
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
