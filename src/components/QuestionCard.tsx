import { BuzzerPanel } from './BuzzerPanel'
import { QuestionMedia } from './QuestionMedia'
import type { CSSProperties } from 'react'
import type { BuzzerEntry, Question, Team } from '../types/game'

type QuestionCardProps = {
  question: Question
  displayValue: number
  teams: Team[]
  showAnswer: boolean
  wrongAnswerCostsPoints: boolean
  buzzerQueue: BuzzerEntry[]
  buzzerLocked: boolean
  onShowAnswer: () => void
  onAward: (teamId: string, correct: boolean) => void
  onNoAnswer: () => void
  onBackToBoard: () => void
  onBuzz: (teamId: string) => void
  onResetBuzzers: () => void
  onToggleBuzzerLock: () => void
}

export function QuestionCard({
  question,
  displayValue,
  teams,
  showAnswer,
  wrongAnswerCostsPoints,
  buzzerQueue,
  buzzerLocked,
  onShowAnswer,
  onAward,
  onNoAnswer,
  onBackToBoard,
  onBuzz,
  onResetBuzzers,
  onToggleBuzzerLock,
}: QuestionCardProps) {
  return (
    <section className="question-stage" aria-label="Aktuelle Frage">
      <div className="question-card">
        <p className="eyebrow">
          {question.category} - {displayValue}
        </p>
        <h1>{question.question}</h1>
        <QuestionMedia src={question.questionImage} alt={`Bild zur Frage ${question.id}`} />

        {!showAnswer ? (
          <button className="primary-button" type="button" onClick={onShowAnswer}>
            Antwort anzeigen
          </button>
        ) : (
          <div className="answer-block">
            <p className="eyebrow">Antwort</p>
            <h2>{question.answer}</h2>
            <QuestionMedia src={question.answerImage} alt={`Bild zur Antwort ${question.id}`} />
            {question.explanation ? <p>{question.explanation}</p> : null}
          </div>
        )}
      </div>

      <BuzzerPanel
        teams={teams}
        queue={buzzerQueue}
        locked={buzzerLocked}
        onBuzz={onBuzz}
        onReset={onResetBuzzers}
        onToggleLock={onToggleBuzzerLock}
      />

      {showAnswer ? (
        <section className="host-panel" aria-label="Host-Steuerung">
          <div>
            <p className="eyebrow">Punkte vergeben</p>
            <h2>{wrongAnswerCostsPoints ? 'Falsch = halber Punktwert minus' : 'Falsche Antworten kosten nichts'}</h2>
          </div>
          <div className="award-grid">
            {teams.map((team) => (
              <div className="award-card" key={team.id} style={{ '--team-color': team.color } as CSSProperties}>
                <strong>{team.name}</strong>
                <div>
                  <button type="button" onClick={() => onAward(team.id, true)}>
                    Richtig
                  </button>
                  <button type="button" onClick={() => onAward(team.id, false)}>
                    Falsch
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="host-actions">
            <button className="secondary-button" type="button" onClick={onNoAnswer}>
              Niemand richtig
            </button>
            <button className="secondary-button" type="button" onClick={onBackToBoard}>
              Zurueck zum Board
            </button>
          </div>
        </section>
      ) : null}
    </section>
  )
}
