import type { NetworkStatus } from '../types/game'

type HostRoomPanelProps = {
  inviteUrl: string
  status: NetworkStatus
  guestCount: number
  error: string
  onStartRoom: () => void
  onOpenLobby: () => void
}

export function HostRoomPanel({ inviteUrl, status, guestCount, error, onStartRoom, onOpenLobby }: HostRoomPanelProps) {
  const copyInvite = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl)
    }
  }

  return (
    <section className="room-panel" aria-label="Freunde einladen">
      <div>
        <p className="eyebrow">Host Room</p>
        <strong>{status === 'connected' ? `${guestCount} verbunden` : 'Offline'}</strong>
      </div>
      {inviteUrl ? <input readOnly value={inviteUrl} aria-label="Einladungslink" /> : null}
      <div className="room-actions">
        <button className="secondary-button" type="button" onClick={inviteUrl ? copyInvite : onStartRoom}>
          {inviteUrl ? 'Link kopieren' : 'Link erstellen'}
        </button>
        <button className="secondary-button" type="button" onClick={onOpenLobby}>
          Lobby
        </button>
      </div>
      {error ? <small>{error}</small> : null}
    </section>
  )
}
