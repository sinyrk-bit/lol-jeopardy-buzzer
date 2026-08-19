import { useEffect, useState } from 'react'
import { ChatPanel } from './ChatPanel'
import { GameBoard } from './GameBoard'
import { QuestionMedia } from './QuestionMedia'
import { Scoreboard } from './Scoreboard'
import type { CSSProperties } from 'react'
import type { ChatScope, GameState, NetworkStatus, Question } from '../types/game'
import { questions } from '../data/questions'

type PlayerViewProps = {
  gameState: GameState
  playerId: string
  status: NetworkStatus
  error: string
  onBuzz: () => void
  onPickQuestion: (questionId: string) => void
  onSubmitEstimate: (value: number, finalized?: boolean) => void
  onSendChat: (scope: ChatScope, text: string) => void
}

export function PlayerView({
  gameState,
  playerId,
  status,
  error,
  onBuzz,
  onPickQuestion,
  onSubmitEstimate,
  onSendChat,
}: PlayerViewProps) {
  const [estimateValue, setEstimateValue] = useState('')
  const currentQuestion = gameState.currentQuestion
  const remaining = questions.length - gameState.usedQuestions.length
  const displayValue = currentQuestion?.mode === 'estimate' ? 300 : currentQuestion && remaining <= 5 ? currentQuestion.value * 2 : currentQuestion?.value
  const currentPlayer = (gameState.players ?? []).find((player) => player.id === playerId)
  const assignedTeam = gameState.teams.find((team) => team.id === currentPlayer?.teamId)
  const activeTeamId = gameState.activeTeamId ?? gameState.teams[0]?.id ?? null
  const activeTeam = gameState.teams.find((team) => team.id === activeTeamId)
  const isPickingTeam = Boolean(assignedTeam && assignedTeam.id === activeTeamId)
  const requestedByTeam = gameState.teams.find((team) => team.id === gameState.requestedByTeamId)
  const queued = assignedTeam ? gameState.buzzerQueue.find((entry) => entry.teamId === assignedTeam.id) : null
  const ownEstimate = assignedTeam
    ? (gameState.estimateSubmissions ?? []).find((submission) => submission.teamId === assignedTeam.id)
    : null
  const isEstimateQuestion = currentQuestion?.mode === 'estimate'
  const hasAnswerText = currentQuestion ? currentQuestion.answer.trim().length > 0 : false
  const estimateTeamsWithPlayers = gameState.teams.filter((team) =>
    (gameState.players ?? []).some((player) => player.teamId === team.id && player.connected),
  )
  const finalizedEstimateCount = estimateTeamsWithPlayers.filter((team) =>
    (gameState.estimateSubmissions ?? []).some((submission) => submission.teamId === team.id && submission.finalized),
  ).length

  useEffect(() => {
    setEstimateValue(ownEstimate ? String(ownEstimate.value) : '')
  }, [currentQuestion?.id, ownEstimate])

  return (
    <main className="player-layout">
      <header className="player-header">
        <div>
          <p className="eyebrow">Spieleransicht</p>
          <h1>League Jeopardy</h1>
        </div>
        <strong className={`connection-pill is-${status}`}>{status}</strong>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      <Scoreboard
        teams={gameState.teams}
        players={gameState.players ?? []}
        activeTeamId={activeTeamId}
      />
      <section className="player-team-strip">
        <div>
          <p className="eyebrow">Dein Team</p>
          <strong>{assignedTeam ? assignedTeam.name : 'Warte auf Zuweisung durch den Host'}</strong>
        </div>
        {!currentQuestion ? (
          <span className={`picker-pill ${isPickingTeam ? 'is-active' : ''}`}>
            {gameState.requestedQuestionId
              ? `${requestedByTeam?.name ?? 'Team'} hat gewählt`
              : isPickingTeam
                ? 'Ihr sucht aus'
                : `${activeTeam?.name ?? 'Der Host'} sucht aus`}
          </span>
        ) : null}
      </section>

      {currentQuestion ? (
        <section className="player-question">
          <p className="eyebrow">
            {currentQuestion.category} - {displayValue}
          </p>
          <h2>{currentQuestion.question}</h2>
          <QuestionMedia src={currentQuestion.questionImage} alt={`Bild zur Frage ${currentQuestion.id}`} />
          {gameState.showAnswer ? (
            <div className="answer-block">
              <p className="eyebrow">Antwort</p>
              {hasAnswerText ? <h2>{currentQuestion.answer}</h2> : null}
              <QuestionMedia src={currentQuestion.answerImage} alt={`Bild zur Antwort ${currentQuestion.id}`} />
            </div>
          ) : null}
          {isEstimateQuestion ? (
            <form
              className="estimate-form"
              onSubmit={(event) => {
                event.preventDefault()
                const numericEstimate = Number(estimateValue.replace(',', '.'))
                if (Number.isFinite(numericEstimate)) {
                  onSubmitEstimate(numericEstimate, true)
                }
              }}
            >
              <div>
                <p className="eyebrow">Schätzung abgeben</p>
                <strong>
                  {ownEstimate?.finalized
                    ? `${assignedTeam?.name ?? 'Dein Team'} hat final ${ownEstimate.value} abgegeben`
                    : `${finalizedEstimateCount}/${estimateTeamsWithPlayers.length} Teams haben abgegeben`}
                </strong>
              </div>
              <div className="estimate-input-row">
                <input
                  disabled={!assignedTeam || ownEstimate?.finalized}
                  inputMode="decimal"
                  onChange={(event) => setEstimateValue(event.target.value)}
                  placeholder="Zahl"
                  type="number"
                  value={estimateValue}
                />
                <button className="primary-button" disabled={!assignedTeam || ownEstimate?.finalized || !estimateValue} type="submit">
                  Final bestätigen
                </button>
              </div>
            </form>
          ) : assignedTeam ? (
            <button
              className={`player-buzz-button ${queued ? 'has-buzzed' : ''}`}
              disabled={gameState.buzzerLocked || Boolean(queued)}
              onClick={onBuzz}
              style={{ '--team-color': assignedTeam.color } as CSSProperties}
              type="button"
            >
              <span>{queued ? `#${queued.order}` : 'Buzz'}</span>
              <strong>{assignedTeam.name}</strong>
            </button>
          ) : (
            <div className="buzz-waiting">
              <p className="eyebrow">Buzzer gesperrt</p>
              <strong>Der Host weist dich gleich einem Team zu.</strong>
            </div>
          )}
        </section>
      ) : (
        <GameBoard
          questions={questions}
          usedQuestions={gameState.usedQuestions}
          getQuestionValue={(question) =>
            question.mode === 'estimate' ? 300 : questions.length - gameState.usedQuestions.length <= 5 ? question.value * 2 : question.value
          }
          selectedQuestionId={gameState.requestedQuestionId ?? null}
          selectionLabel={gameState.requestedQuestionId ? 'Gewählt' : null}
          canSelectQuestion={isPickingTeam && !gameState.requestedQuestionId}
          onSelectQuestion={(question: Question) => onPickQuestion(question.id)}
        />
      )}

      <ChatPanel
        messages={gameState.chatMessages ?? []}
        teams={gameState.teams}
        role="player"
        currentTeamId={assignedTeam?.id ?? null}
        onSend={(messageScope, messageText) => onSendChat(messageScope, messageText)}
      />
    </main>
  )
}
