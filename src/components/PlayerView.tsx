import { GameBoard } from './GameBoard'
import { QuestionMedia } from './QuestionMedia'
import { Scoreboard } from './Scoreboard'
import type { CSSProperties } from 'react'
import type { GameState, NetworkStatus, Question } from '../types/game'
import { questions } from '../data/questions'

type PlayerViewProps = {
  gameState: GameState
  playerId: string
  status: NetworkStatus
  error: string
  onBuzz: () => void
  onPickQuestion: (questionId: string) => void
}

export function PlayerView({ gameState, playerId, status, error, onBuzz, onPickQuestion }: PlayerViewProps) {
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
              <h2>{currentQuestion.answer}</h2>
              <QuestionMedia src={currentQuestion.answerImage} alt={`Bild zur Antwort ${currentQuestion.id}`} />
            </div>
          ) : null}
          {assignedTeam ? (
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
    </main>
  )
}
