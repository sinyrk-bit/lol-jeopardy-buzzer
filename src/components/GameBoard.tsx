import { categories, values } from '../data/questions'
import type { Question } from '../types/game'

type GameBoardProps = {
  questions: Question[]
  usedQuestions: string[]
  getQuestionValue?: (question: Question) => number
  onSelectQuestion: (question: Question) => void
}

export function GameBoard({ questions, usedQuestions, getQuestionValue, onSelectQuestion }: GameBoardProps) {
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
                <span>{isUsed ? 'Gespielt' : question && getQuestionValue ? getQuestionValue(question) : value}</span>
                {!isUsed && question && getQuestionValue && getQuestionValue(question) > question.value ? <em>Bonus</em> : null}
              </button>
            )
          }),
        )}
      </div>
    </section>
  )
}
