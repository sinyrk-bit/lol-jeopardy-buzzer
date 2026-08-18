import type { Player, Team, NetworkStatus } from '../types/game'
import { Scoreboard } from './Scoreboard'

type LobbyOverlayProps = {
  inviteUrl: string
  status: NetworkStatus
  players: Player[]
  teams: Team[]
  onAssignPlayer: (playerId: string, teamId: string | null) => void
  onClose: () => void
  onStartRoom: () => void
}

export function LobbyOverlay({
  inviteUrl,
  status,
  players,
  teams,
  onAssignPlayer,
  onClose,
  onStartRoom,
}: LobbyOverlayProps) {
  const copyInvite = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl)
    }
  }

  return (
    <div className="overlay-backdrop" role="presentation">
      <section className="lobby-overlay" aria-label="Host Lobby">
        <div className="overlay-score-strip">
          <Scoreboard teams={teams} players={players} />
        </div>

        <div className="lobby-header">
          <div>
            <p className="eyebrow">Host-Steuerung</p>
            <h2>Lobby & Teams</h2>
          </div>
          <button className="secondary-button" type="button" onClick={onClose}>
            Schließen
          </button>
        </div>

        <div className="invite-console">
          <div>
            <p className="eyebrow">Einladungslink</p>
            <strong>{status === 'connected' ? 'Raum online' : 'Raum offline'}</strong>
          </div>
          {inviteUrl ? <input readOnly value={inviteUrl} aria-label="Einladungslink" /> : null}
          <button className="primary-button" type="button" onClick={inviteUrl ? copyInvite : onStartRoom}>
            {inviteUrl ? 'Link kopieren' : 'Link erstellen'}
          </button>
        </div>

        <div className="player-roster">
          {players.length === 0 ? (
            <div className="empty-roster">
              <p className="eyebrow">Noch keine Spieler</p>
              <strong>Schick den Link, dann erscheinen sie hier.</strong>
            </div>
          ) : (
            players.map((player) => (
              <article className={`player-row ${player.connected ? 'is-online' : 'is-offline'}`} key={player.id}>
                <div>
                  <span className="connection-dot" />
                  <strong>{player.name}</strong>
                  <small>{player.connected ? 'online' : 'offline'}</small>
                </div>
                <select
                  aria-label={`${player.name} einem Team zuweisen`}
                  value={player.teamId ?? ''}
                  onChange={(event) => onAssignPlayer(player.id, event.target.value || null)}
                >
                  <option value="">Kein Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
