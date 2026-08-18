import type { Team } from '../types/game'

type TurnControlProps = {
  teams: Team[]
  activeTeamId: string | null
  requestedQuestionId?: string | null
  onSetActiveTeam: (teamId: string) => void
}

export function TurnControl({ teams, activeTeamId, requestedQuestionId = null, onSetActiveTeam }: TurnControlProps) {
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]

  return (
    <section className={`turn-control ${requestedQuestionId ? 'has-request' : ''}`} aria-label="Team am Zug">
      <div>
        <p className="eyebrow">Auswahlrecht</p>
        <strong>
          {requestedQuestionId
            ? 'Frage gewählt. Host klickt die markierte Kachel.'
            : activeTeam
              ? `${activeTeam.name} sucht die nächste Frage aus`
              : 'Kein Team ausgewählt'}
        </strong>
      </div>
      <div className="turn-team-buttons">
        {teams.map((team, index) => (
          <button
            className={team.id === activeTeamId ? 'is-active' : ''}
            key={team.id}
            onClick={() => onSetActiveTeam(team.id)}
            type="button"
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  )
}
