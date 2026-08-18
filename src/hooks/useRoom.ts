import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { HostMessage, NetworkStatus, PlayerMessage, PublicGameSnapshot } from '../types/game'

type UseRoomOptions = {
  initialRoomId?: string
  getSnapshot?: () => PublicGameSnapshot
  onPlayerMessage?: (message: PlayerMessage) => void
  onHostMessage?: (message: HostMessage) => void
}

const roomPrefix = 'lol-jp-'
const playerIdStorageKey = 'lol-jeopardy-player-id'

function makeRoomId() {
  return `${roomPrefix}${Math.random().toString(36).slice(2, 8)}`
}

function makePlayerId() {
  return `player-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function getStoredPlayerId() {
  const stored = window.sessionStorage.getItem(playerIdStorageKey)
  if (stored) {
    return stored
  }

  const next = makePlayerId()
  window.sessionStorage.setItem(playerIdStorageKey, next)
  return next
}

function getRoomServerUrl() {
  const configured = import.meta.env.VITE_ROOM_SERVER_URL as string | undefined
  if (configured) {
    return configured
  }

  if (window.location.hostname.endsWith('github.io')) {
    return 'wss://lol-jeopardy-buzzer.onrender.com/rooms'
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/rooms`
}

export function useRoom({ initialRoomId, getSnapshot, onPlayerMessage, onHostMessage }: UseRoomOptions = {}) {
  const [roomId, setRoomId] = useState(initialRoomId ?? '')
  const [playerId] = useState(getStoredPlayerId)
  const [status, setStatus] = useState<NetworkStatus>('idle')
  const [error, setError] = useState('')
  const [guestCount, setGuestCount] = useState(0)
  const [lastSnapshot, setLastSnapshot] = useState<PublicGameSnapshot | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const isHostRef = useRef(false)
  const playerMessageRef = useRef(onPlayerMessage)
  const hostMessageRef = useRef(onHostMessage)
  const snapshotRef = useRef(getSnapshot)

  playerMessageRef.current = onPlayerMessage
  hostMessageRef.current = onHostMessage
  snapshotRef.current = getSnapshot

  const inviteUrl = useMemo(() => {
    if (!roomId) {
      return ''
    }

    const url = new URL(window.location.href)
    url.searchParams.set('join', roomId)
    return url.toString()
  }, [roomId])

  const send = useCallback((payload: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const closeRoom = useCallback(() => {
    socketRef.current?.close()
    socketRef.current = null
    isHostRef.current = false
    setGuestCount(0)
    setStatus('idle')
  }, [])

  const connectSocket = useCallback(
    (onOpen: (socket: WebSocket) => void) => {
      closeRoom()
      setError('')
      setStatus('connecting')
      const socket = new WebSocket(getRoomServerUrl())
      socketRef.current = socket

      socket.addEventListener('open', () => {
        setStatus('connected')
        onOpen(socket)
      })

      socket.addEventListener('message', (event) => {
        const message = JSON.parse(String(event.data)) as
          | HostMessage
          | PlayerMessage
          | { type: 'guest-count'; count: number }
          | { type: 'error'; message: string }

        if (message.type === 'snapshot') {
          setLastSnapshot(message.payload)
          hostMessageRef.current?.(message)
        } else if (message.type === 'guest-count') {
          setGuestCount(message.count)
        } else if (message.type === 'error') {
          setError(message.message)
          setStatus('error')
        } else if (
          message.type === 'buzz' ||
          message.type === 'pick-question' ||
          message.type === 'player-joined' ||
          message.type === 'player-left'
        ) {
          playerMessageRef.current?.(message)
        } else {
          hostMessageRef.current?.(message)
        }
      })

      socket.addEventListener('close', () => {
        setStatus('idle')
      })

      socket.addEventListener('error', () => {
        setStatus('error')
        setError('Raum-Server nicht erreichbar.')
      })
    },
    [closeRoom],
  )

  const hostRoom = useCallback(() => {
    const nextRoomId = makeRoomId()
    setRoomId(nextRoomId)
    connectSocket((socket) => {
      isHostRef.current = true
      socket.send(JSON.stringify({ type: 'host-room', roomId: nextRoomId }))
      const snapshot = snapshotRef.current?.()
      if (snapshot) {
        socket.send(JSON.stringify({ type: 'snapshot', payload: snapshot }))
      }
    })
  }, [connectSocket])

  const joinRoom = useCallback(
    (targetRoomId: string, playerName: string) => {
      setRoomId(targetRoomId)
      isHostRef.current = false
      connectSocket((socket) => {
        socket.send(JSON.stringify({ type: 'join-room', roomId: targetRoomId, playerId, playerName }))
      })
    },
    [connectSocket, playerId],
  )

  const broadcastSnapshot = useCallback(
    (snapshot: PublicGameSnapshot) => {
      if (isHostRef.current) {
        send({ type: 'snapshot', payload: snapshot })
      }
    },
    [send],
  )

  const sendBuzz = useCallback(() => {
    send({ type: 'buzz', playerId })
  }, [playerId, send])

  const sendQuestionPick = useCallback(
    (questionId: string) => {
      send({ type: 'pick-question', playerId, questionId })
    },
    [playerId, send],
  )

  useEffect(() => closeRoom, [closeRoom])

  return {
    roomId,
    playerId,
    inviteUrl,
    status,
    error,
    guestCount,
    lastSnapshot,
    hostRoom,
    joinRoom,
    closeRoom,
    broadcastSnapshot,
    sendBuzz,
    sendQuestionPick,
  }
}
