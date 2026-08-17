import type { CSSProperties } from 'react'
import type { BuzzerEntry, Team } from '../types/game'

type BuzzerPanelProps = {
  teams: Team[]
  queue: BuzzerEntry[]
  locked: boolean
  onBuzz: (teamId: string) => void
  onReset: () => void
  onToggleLock: () => void
}

export function BuzzerPanel({
  teams,
  queue,
  locked,
  onBuzz,
  onReset,
  onToggleLock,
}: BuzzerPanelProps) {
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const orderedQueue = [...queue].sort((a, b) => a.order - b.order)
  const firstTeam = orderedQueue[0] ? teamById.get(orderedQueue[0].teamId) : null

  return (
    <section className={`buzzer-panel ${locked ? 'is-locked' : ''}`} aria-label="Buzzer-System">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Buzzer</p>
          <h2>{firstTeam ? `${firstTeam.name} war zuerst` : 'Bereit zum Buzzern'}</h2>
        </div>
        <div className="buzzer-actions">
          <button className="secondary-button" type="button" onClick={onToggleLock}>
            {locked ? 'Buzzer entsperren' : 'Buzzer sperren'}
          </button>
          <button className="secondary-button" type="button" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="buzzer-buttons">
        {teams.map((team) => {
          const entry = queue.find((queued) => queued.teamId === team.id)
          return (
            <button
              className={`buzzer-button ${entry ? 'has-buzzed' : ''}`}
              disabled={locked || Boolean(entry)}
              key={team.id}
              onClick={() => onBuzz(team.id)}
              style={{ '--team-color': team.color } as CSSProperties}
              type="button"
            >
              <span>{entry ? `#${entry.order}` : 'Buzz'}</span>
              <strong>{team.name}</strong>
            </button>
          )
        })}
      </div>

      <ol className="buzzer-queue" aria-live="polite">
        {orderedQueue.length === 0 ? (
          <li>Noch niemand gebuzzert.</li>
        ) : (
          orderedQueue.map((entry) => {
            const team = teamById.get(entry.teamId)
            return <li key={entry.teamId}>{team?.name ?? 'Unbekanntes Team'}</li>
          })
        )}
      </ol>
    </section>
  )
}
