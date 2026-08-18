import type { NetworkStatus } from '../types/game'

type HostRoomPanelProps = {
  inviteUrl: string
  status: NetworkStatus
  guestCount: number
  error: string
  onStartRoom: () => void
}

export function HostRoomPanel({ inviteUrl, status, guestCount, error, onStartRoom }: HostRoomPanelProps) {
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
      <button className="secondary-button" type="button" onClick={inviteUrl ? copyInvite : onStartRoom}>
        {inviteUrl ? 'Link kopieren' : 'Link erstellen'}
      </button>
      {error ? <small>{error}</small> : null}
    </section>
  )
}
