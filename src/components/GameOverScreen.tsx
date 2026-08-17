import type { Team } from '../types/game'

type GameOverScreenProps = {
  teams: Team[]
  onNewGame: () => void
}

export function GameOverScreen({ teams, onNewGame }: GameOverScreenProps) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const winner = sortedTeams[0]

  return (
    <main className="game-over">
      <p className="eyebrow">Game Over</p>
      <h1>{winner?.name ?? 'Kein Sieger'}</h1>
      <p className="winner-score">{winner?.score ?? 0} Punkte</p>

      <ol className="ranking-list">
        {sortedTeams.map((team) => (
          <li key={team.id}>
            <span>{team.name}</span>
            <strong>{team.score}</strong>
          </li>
        ))}
      </ol>

      <button className="primary-button" type="button" onClick={onNewGame}>
        Neues Spiel
      </button>
    </main>
  )
}
