import { categories, values } from '../data/questions'
import type { Question } from '../types/game'

type GameBoardProps = {
  questions: Question[]
  usedQuestions: string[]
  getQuestionValue?: (question: Question) => number
  selectedQuestionId?: string | null
  selectionLabel?: string | null
  lockedToSelection?: boolean
  canSelectQuestion?: boolean
  onSelectQuestion: (question: Question) => void
}

export function GameBoard({
  questions,
  usedQuestions,
  getQuestionValue,
  selectedQuestionId = null,
  selectionLabel = null,
  lockedToSelection = false,
  canSelectQuestion = true,
  onSelectQuestion,
}: GameBoardProps) {
  const questionsByCategory = new Map<string, Question[]>()

  for (const question of questions) {
    questionsByCategory.set(question.category, [...(questionsByCategory.get(question.category) ?? []), question])
  }

  return (
    <section className="board-shell" aria-label="Jeopardy-Spielbrett">
      <div className="board-grid">
        {categories.map((category) => (
          <div className="category-cell" key={category}>
            {category}
          </div>
        ))}

        {values.flatMap((value, rowIndex) =>
            categories.map((category) => {
              const question = questionsByCategory.get(category)?.[rowIndex]
              const isUsed = question ? usedQuestions.includes(question.id) : true
              const isSelected = Boolean(question && selectedQuestionId === question.id)
              const isLockedByTurn = Boolean(question && !isUsed && !canSelectQuestion)
              const isLockedToOtherSelection = Boolean(question && lockedToSelection && selectedQuestionId !== question.id)
              const isDisabled = !question || isUsed || isLockedByTurn || isLockedToOtherSelection
              const displayValue = question && getQuestionValue ? getQuestionValue(question) : value
              const tileClassName = [
                'question-tile',
                isUsed ? 'is-used' : '',
                isSelected ? 'is-selected' : '',
                isLockedByTurn || isLockedToOtherSelection ? 'is-disabled-by-turn' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  className={tileClassName}
                  disabled={isDisabled}
                  key={`${category}-${value}`}
                  onClick={() => question && onSelectQuestion(question)}
                  type="button"
                  aria-label={`${category} für ${displayValue} Punkte`}
                >
                  <span>{isUsed ? 'Gespielt' : displayValue}</span>
                  {!isUsed && isSelected && selectionLabel ? <em>{selectionLabel}</em> : null}
                  {!isUsed && !isSelected && question && getQuestionValue && getQuestionValue(question) > question.value ? <em>Bonus</em> : null}
                </button>
              )
            }),
        )}
      </div>
    </section>
  )
}
