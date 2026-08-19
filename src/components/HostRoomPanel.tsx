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
  const isOnline = status === 'connected'
  const copyInvite = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl)
    }
  }

  return (
    <section className="room-panel" aria-label="Freunde einladen">
      <div>
        <p className="eyebrow">Host-Raum</p>
        <strong>{isOnline ? `${guestCount} verbunden` : 'Offline'}</strong>
      </div>
      {inviteUrl ? <input readOnly value={inviteUrl} aria-label="Einladungslink" /> : null}
      <div className="room-actions">
        <button className="secondary-button" type="button" onClick={inviteUrl && isOnline ? copyInvite : onStartRoom}>
          {inviteUrl ? (isOnline ? 'Link kopieren' : 'Host verbinden') : 'Link erstellen'}
        </button>
        <button className="secondary-button" type="button" onClick={onOpenLobby}>
          Lobby
        </button>
      </div>
      {error ? <small>{error}</small> : null}
    </section>
  )
}
