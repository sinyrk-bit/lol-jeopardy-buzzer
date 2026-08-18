import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ChatMessage, ChatScope, Team } from '../types/game'

type ChatPanelProps = {
  messages: ChatMessage[]
  teams: Team[]
  role: 'host' | 'player'
  currentTeamId: string | null
  onSend: (scope: ChatScope, text: string, teamId?: string | null) => void
}

export function ChatPanel({ messages, teams, role, currentTeamId, onSend }: ChatPanelProps) {
  const [scope, setScope] = useState<ChatScope>('public')
  const [hostTeamId, setHostTeamId] = useState<string | null>(currentTeamId ?? teams[0]?.id ?? null)
  const [text, setText] = useState('')
  const targetTeamId = role === 'host' ? hostTeamId : currentTeamId
  const selectedTeam = teams.find((team) => team.id === targetTeamId)
  const visibleMessages = useMemo(
    () =>
      messages
        .filter((message) => message.scope === 'public' || role === 'host' || message.teamId === currentTeamId)
        .slice(-30),
    [currentTeamId, messages, role],
  )

  const submitMessage = () => {
    const trimmed = text.trim()
    if (!trimmed || (scope === 'team' && !targetTeamId)) {
      return
    }

    onSend(scope, trimmed, targetTeamId)
    setText('')
  }

  useEffect(() => {
    if (role === 'host' && currentTeamId && !teams.some((team) => team.id === hostTeamId)) {
      setHostTeamId(currentTeamId)
    }
  }, [currentTeamId, hostTeamId, role, teams])

  return (
    <section className="chat-panel" aria-label="Spielchat">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Chat</p>
          <strong>{scope === 'team' ? selectedTeam?.name ?? 'Teamchat' : 'Allgemein'}</strong>
        </div>
        <div className="chat-tabs">
          <button className={scope === 'public' ? 'is-active' : ''} type="button" onClick={() => setScope('public')}>
            Alle
          </button>
          <button
            className={scope === 'team' ? 'is-active' : ''}
            disabled={role === 'player' && !currentTeamId}
            type="button"
            onClick={() => setScope('team')}
          >
            Team
          </button>
        </div>
      </div>

      {role === 'host' && scope === 'team' ? (
        <select
          aria-label="Team für Teamchat auswählen"
          className="chat-team-select"
          value={hostTeamId ?? ''}
          onChange={(event) => setHostTeamId(event.target.value || null)}
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      ) : null}

      <div className="chat-messages">
        {visibleMessages.length === 0 ? (
          <p className="chat-empty">Noch keine Nachrichten.</p>
        ) : (
          visibleMessages.map((message) => {
            const team = teams.find((candidate) => candidate.id === message.teamId)

            return (
              <article
                className={`chat-message ${message.scope === 'team' ? 'is-team' : 'is-public'}`}
                key={message.id}
                style={{ '--team-color': team?.color ?? '#00eaff' } as CSSProperties}
              >
                <span>{message.scope === 'team' ? team?.name ?? 'Team' : 'Alle'}</span>
                <strong>{message.authorName}</strong>
                <p>{message.text}</p>
              </article>
            )
          })
        )}
      </div>

      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault()
          submitMessage()
        }}
      >
        <input
          maxLength={300}
          onChange={(event) => setText(event.target.value)}
          placeholder={scope === 'team' ? 'Teamnachricht schreiben' : 'Nachricht an alle'}
          value={text}
        />
        <button className="primary-button" disabled={!text.trim() || (scope === 'team' && !targetTeamId)} type="submit">
          Senden
        </button>
      </form>
    </section>
  )
}
