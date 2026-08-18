import type { Player, Question, Team } from '../types/game'
import { QuestionMedia } from './QuestionMedia'
import { Scoreboard } from './Scoreboard'

type QuestionStartOverlayProps = {
  question: Question
  displayValue: number
  teams: Team[]
  players: Player[]
  onStartWithBuzzer: () => void
  onStartWithoutBuzzer: () => void
  onCancel: () => void
}

export function QuestionStartOverlay({
  question,
  displayValue,
  teams,
  players,
  onStartWithBuzzer,
  onStartWithoutBuzzer,
  onCancel,
}: QuestionStartOverlayProps) {
  return (
    <div className="overlay-backdrop" role="presentation">
      <section className="question-start-overlay" aria-label="Frage starten">
        <Scoreboard teams={teams} players={players} />

        <div className="question-start-panel">
          <div>
            <p className="eyebrow">Host entscheidet vor dem Aufdecken</p>
            <h2>
              {question.category} - {displayValue}
            </h2>
          </div>

          <div className="question-start-preview">
            <h1>{question.question}</h1>
            <QuestionMedia src={question.questionImage} alt={`Bild zur Frage ${question.id}`} />
          </div>

          <div className="question-start-actions">
            <button className="primary-button" type="button" onClick={onStartWithBuzzer}>
              Mit Buzzer starten
            </button>
            <button className="secondary-button" type="button" onClick={onStartWithoutBuzzer}>
              Ohne Buzzer zeigen
            </button>
            <button className="secondary-button" type="button" onClick={onCancel}>
              Abbrechen
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
