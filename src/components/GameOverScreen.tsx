import type { CSSProperties } from 'react'
import type { Player, Team } from '../types/game'

type GameOverScreenProps = {
  teams: Team[]
  players: Player[]
  onNewGame: () => void
}

export function GameOverScreen({ teams, players, onNewGame }: GameOverScreenProps) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score).slice(0, 4)
  const winner = sortedTeams[0]
  const winnerPlayers = players.filter((player) => player.teamId === winner?.id)

  return (
    <main className="game-over">
      <p className="eyebrow">Spiel vorbei</p>
      <h1>Siegerehrung</h1>

      <section className="winner-podium" aria-label="Sieger">
        <span className="winner-place">Platz 1</span>
        <h2>{winner?.name ?? 'Kein Sieger'}</h2>
        <p className="winner-score">{winner?.score ?? 0} Punkte</p>
        <p className="winner-players">
          {winnerPlayers.length > 0 ? winnerPlayers.map((player) => player.name).join(' / ') : 'Keine Spieler im Team'}
        </p>
      </section>

      <ol className="ranking-list" aria-label="Platzierungen">
        {sortedTeams.slice(1).map((team, index) => {
          const teamPlayers = players.filter((player) => player.teamId === team.id)

          return (
            <li key={team.id} style={{ '--rank-delay': `${(index + 1) * 140}ms` } as CSSProperties}>
              <span className="ranking-place">Platz {index + 2}</span>
              <div className="ranking-team">
                <span>{team.name}</span>
                <small>{teamPlayers.length > 0 ? teamPlayers.map((player) => player.name).join(' / ') : 'Keine Spieler im Team'}</small>
              </div>
              <strong>{team.score}</strong>
            </li>
          )
        })}
      </ol>

      <button className="primary-button" type="button" onClick={onNewGame}>
        Neues Spiel
      </button>
    </main>
  )
}
