import { categories, values } from '../data/questions'
import type { Question } from '../types/game'

type GameBoardProps = {
  questions: Question[]
  usedQuestions: string[]
  onSelectQuestion: (question: Question) => void
}

export function GameBoard({ questions, usedQuestions, onSelectQuestion }: GameBoardProps) {
  const findQuestion = (category: string, value: number) =>
    questions.find((question) => question.category === category && question.value === value)

  return (
    <section className="board-shell" aria-label="Jeopardy-Spielbrett">
      <div className="board-grid">
        {categories.map((category) => (
          <div className="category-cell" key={category}>
            {category}
          </div>
        ))}

        {values.flatMap((value) =>
          categories.map((category) => {
            const question = findQuestion(category, value)
            const isUsed = question ? usedQuestions.includes(question.id) : true

            return (
              <button
                className={`question-tile ${isUsed ? 'is-used' : ''}`}
                disabled={!question || isUsed}
                key={`${category}-${value}`}
                onClick={() => question && onSelectQuestion(question)}
                type="button"
                aria-label={`${category} fuer ${value} Punkte`}
              >
                <span>{isUsed ? 'Gespielt' : value}</span>
              </button>
            )
          }),
        )}
      </div>
    </section>
  )
}
