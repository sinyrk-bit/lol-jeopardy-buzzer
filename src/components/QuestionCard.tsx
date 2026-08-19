import { BuzzerPanel } from './BuzzerPanel'
import { QuestionMedia } from './QuestionMedia'
import { useEffect, useState, type CSSProperties } from 'react'
import type { BuzzerEntry, EstimateSubmission, Question, Team } from '../types/game'

type QuestionCardProps = {
  question: Question
  displayValue: number
  teams: Team[]
  showAnswer: boolean
  wrongAnswerCostsPoints: boolean
  buzzerQueue: BuzzerEntry[]
  buzzerLocked: boolean
  estimateSubmissions: EstimateSubmission[]
  onShowAnswer: () => void
  onAward: (teamIds: string | string[], correct: boolean) => void
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
  wrongAnswerCostsPoints: _wrongAnswerCostsPoints,
  buzzerQueue,
  buzzerLocked,
  estimateSubmissions,
  onShowAnswer,
  onAward,
  onNoAnswer,
  onBackToBoard,
  onBuzz,
  onResetBuzzers,
  onToggleBuzzerLock,
}: QuestionCardProps) {
  const isEstimateQuestion = question.mode === 'estimate'
  const hasAnswerText = question.answer.trim().length > 0
  const [selectedEstimateWinnerIds, setSelectedEstimateWinnerIds] = useState<string[]>([])
  const finalizedEstimateCount = teams.filter((team) =>
    estimateSubmissions.some((submission) => submission.teamId === team.id && submission.finalized),
  ).length

  useEffect(() => {
    setSelectedEstimateWinnerIds([])
  }, [question.id])

  const toggleEstimateWinner = (teamId: string) => {
    setSelectedEstimateWinnerIds((current) =>
      current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId],
    )
  }

  return (
    <section className="question-stage" aria-label="Aktuelle Frage">
      <div className="question-card">
        <p className="eyebrow">
          {question.category} - {displayValue}
        </p>
        <h1>{question.question}</h1>
        <QuestionMedia src={question.questionImage} alt={`Bild zur Frage ${question.id}`} />

        <div className="host-answer-preview">
          <p className="eyebrow">Nur Host sieht die Antwort</p>
          {hasAnswerText ? <h2>{question.answer}</h2> : null}
          <QuestionMedia src={question.answerImage} alt={`Bild zur Antwort ${question.id}`} />
          {question.explanation ? <p>{question.explanation}</p> : null}
        </div>

        <div className="screen-actions">
          <button className="primary-button" disabled={showAnswer} type="button" onClick={onShowAnswer}>
            {showAnswer ? 'Antwort ist aufgedeckt' : 'Antwort für Spieler aufdecken'}
          </button>
        </div>

        {showAnswer ? (
          <div className="answer-block public-answer">
            <p className="eyebrow">Jetzt sichtbar für Spieler</p>
            {hasAnswerText ? <h2>{question.answer}</h2> : null}
            <QuestionMedia src={question.answerImage} alt={`Bild zur Antwort ${question.id}`} />
            {question.explanation ? <p>{question.explanation}</p> : null}
          </div>
        ) : null}
      </div>

      {isEstimateQuestion ? (
        <section className="buzzer-panel estimate-panel" aria-label="Schätzungen">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Team-Schätzungen</p>
              <h2>
                {finalizedEstimateCount}/{teams.length} abgegeben
              </h2>
            </div>
          </div>
          <div className="estimate-grid">
            {teams.map((team) => {
              const submission = estimateSubmissions.find((entry) => entry.teamId === team.id)

              return (
                <div
                  className={`estimate-card ${submission?.finalized ? 'is-finalized' : ''}`}
                  key={team.id}
                  style={{ '--team-color': team.color } as CSSProperties}
                >
                  <span>{team.name}</span>
                  <strong>{submission ? submission.value : 'Wartet'}</strong>
                  <small>{submission ? `von ${submission.playerName}` : 'Noch keine finale Schätzung'}</small>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <BuzzerPanel
          teams={teams}
          queue={buzzerQueue}
          locked={buzzerLocked}
          onBuzz={onBuzz}
          onReset={onResetBuzzers}
          onToggleLock={onToggleBuzzerLock}
        />
      )}

      {showAnswer ? (
        <section className="host-panel" aria-label="Host-Steuerung">
          <div>
            <p className="eyebrow">Punkte vergeben</p>
            <h2>
              {isEstimateQuestion
                ? 'Das Team mit der nächsten Schätzung bekommt die Punkte'
                : 'Falsch = halber Punktwert minus'}
            </h2>
          </div>
          <div className="award-grid">
            {teams.map((team) => (
              <div className="award-card" key={team.id} style={{ '--team-color': team.color } as CSSProperties}>
                <strong>{team.name}</strong>
                {isEstimateQuestion ? (
                  <button
                    className={selectedEstimateWinnerIds.includes(team.id) ? 'is-selected' : ''}
                    type="button"
                    aria-pressed={selectedEstimateWinnerIds.includes(team.id)}
                    onClick={() => toggleEstimateWinner(team.id)}
                  >
                    {selectedEstimateWinnerIds.includes(team.id) ? 'Ausgewählt' : 'Am nächsten'}
                  </button>
                ) : (
                  <div>
                    <button type="button" onClick={() => onAward(team.id, true)}>
                      Richtig
                    </button>
                    <button type="button" onClick={() => onAward(team.id, false)}>
                      Falsch
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="host-actions">
            {isEstimateQuestion ? (
              <button
                className="primary-button"
                disabled={selectedEstimateWinnerIds.length === 0}
                type="button"
                onClick={() => onAward(selectedEstimateWinnerIds, true)}
              >
                Punkte an Auswahl vergeben
              </button>
            ) : null}
            <button className="secondary-button" type="button" onClick={onNoAnswer}>
              Niemand richtig
            </button>
            <button className="secondary-button" type="button" onClick={onBackToBoard}>
              Zurück zum Board
            </button>
          </div>
        </section>
      ) : null}
    </section>
  )
}
