import type { CSSProperties } from 'react'
import type { Team } from '../types/game'

type ScoreboardProps = {
  teams: Team[]
}

export function Scoreboard({ teams }: ScoreboardProps) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const leadScore = sortedTeams[0]?.score ?? 0

  return (
    <aside className="scoreboard" aria-label="Punktestand">
      {sortedTeams.map((team, index) => (
        <div
          className={`team-score ${team.score === leadScore ? 'is-leading' : ''}`}
          key={team.id}
          style={{ '--team-color': team.color } as CSSProperties}
        >
          <span className="team-rank">{index + 1}</span>
          <span className="team-name">{team.name}</span>
          <strong className="score-value" aria-live="polite">
            {team.score}
          </strong>
        </div>
      ))}
    </aside>
  )
}
