import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [isMinimized, setIsMinimized] = useState(false)
  const [seenMessageCount, setSeenMessageCount] = useState(messages.length)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const targetTeamId = role === 'host' ? hostTeamId : currentTeamId
  const selectedTeam = teams.find((team) => team.id === targetTeamId)
  const visibleMessages = useMemo(
    () =>
      messages
        .filter((message) =>
          scope === 'public'
            ? message.scope === 'public'
            : message.scope === 'team' && (role === 'host' ? message.teamId === hostTeamId : message.teamId === currentTeamId),
        )
        .slice(-30),
    [currentTeamId, hostTeamId, messages, role, scope],
  )
  const unreadCount = isMinimized ? Math.max(0, visibleMessages.length - seenMessageCount) : 0

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

  useEffect(() => {
    if (!isMinimized) {
      setSeenMessageCount(visibleMessages.length)
    }
  }, [isMinimized, visibleMessages.length])

  useEffect(() => {
    if (!isMinimized && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [isMinimized, visibleMessages.length])

  return (
    <section className={`chat-panel ${isMinimized ? 'is-minimized' : ''}`} aria-label="Spielchat">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Chat</p>
          <strong>{scope === 'team' ? selectedTeam?.name ?? 'Teamchat' : 'Allgemein'}</strong>
        </div>
        <div className="chat-header-actions">
          {!isMinimized ? (
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
          ) : null}
          <button className="chat-minimize-button" type="button" onClick={() => setIsMinimized((current) => !current)}>
            {isMinimized ? `Öffnen${unreadCount ? ` (${unreadCount})` : ''}` : 'Minimieren'}
          </button>
        </div>
      </div>

      {!isMinimized && role === 'host' && scope === 'team' ? (
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

      {!isMinimized ? (
        <>
          <div className="chat-messages" ref={messagesRef}>
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
        </>
      ) : null}
    </section>
  )
}
