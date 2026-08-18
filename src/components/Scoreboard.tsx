import type { CSSProperties } from 'react'
import type { Player, Team } from '../types/game'

type ScoreboardProps = {
  teams: Team[]
  players?: Player[]
}

export function Scoreboard({ teams, players = [] }: ScoreboardProps) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const leadScore = sortedTeams[0]?.score ?? 0

  return (
    <aside className="scoreboard" aria-label="Punktestand">
      {sortedTeams.map((team, index) => {
        const teamPlayers = players.filter((player) => player.teamId === team.id)

        return (
          <div
            className={`team-score ${team.score === leadScore ? 'is-leading' : ''}`}
            key={team.id}
            style={{ '--team-color': team.color } as CSSProperties}
          >
            <span className="team-rank">{index + 1}</span>
            <div className="team-score-main">
              <span className="team-name">{team.name}</span>
              {teamPlayers.length > 0 ? (
                <span className="team-players">{teamPlayers.map((player) => player.name).join(' / ')}</span>
              ) : null}
            </div>
            <strong className="score-value" aria-live="polite">
              {team.score}
            </strong>
          </div>
        )
      })}
    </aside>
  )
}
