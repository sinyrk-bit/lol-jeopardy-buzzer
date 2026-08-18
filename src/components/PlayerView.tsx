import { GameBoard } from './GameBoard'
import { QuestionMedia } from './QuestionMedia'
import { Scoreboard } from './Scoreboard'
import type { CSSProperties } from 'react'
import type { GameState, NetworkStatus, Question } from '../types/game'
import { questions } from '../data/questions'

type PlayerViewProps = {
  gameState: GameState
  status: NetworkStatus
  error: string
  onBuzz: (teamId: string) => void
}

export function PlayerView({ gameState, status, error, onBuzz }: PlayerViewProps) {
  const currentQuestion = gameState.currentQuestion
  const remaining = questions.length - gameState.usedQuestions.length
  const displayValue = currentQuestion && remaining <= 5 ? currentQuestion.value * 2 : currentQuestion?.value

  return (
    <main className="player-layout">
      <header className="player-header">
        <div>
          <p className="eyebrow">Player View</p>
          <h1>League Jeopardy</h1>
        </div>
        <strong className={`connection-pill is-${status}`}>{status}</strong>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      <Scoreboard teams={gameState.teams} />

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
          <div className="buzzer-buttons">
            {gameState.teams.map((team) => {
              const queued = gameState.buzzerQueue.find((entry) => entry.teamId === team.id)
              return (
                <button
                  className={`buzzer-button ${queued ? 'has-buzzed' : ''}`}
                  disabled={gameState.buzzerLocked || Boolean(queued)}
                  key={team.id}
                  onClick={() => onBuzz(team.id)}
                  style={{ '--team-color': team.color } as CSSProperties}
                  type="button"
                >
                  <span>{queued ? `#${queued.order}` : 'Buzz'}</span>
                  <strong>{team.name}</strong>
                </button>
              )
            })}
          </div>
        </section>
      ) : (
        <GameBoard
          questions={questions}
          usedQuestions={gameState.usedQuestions}
          getQuestionValue={(question) => (questions.length - gameState.usedQuestions.length <= 5 ? question.value * 2 : question.value)}
          onSelectQuestion={(_: Question) => undefined}
        />
      )}
    </main>
  )
}
