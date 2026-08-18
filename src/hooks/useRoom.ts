import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Peer, type DataConnection } from 'peerjs'
import type { HostMessage, NetworkStatus, PlayerMessage, PublicGameSnapshot } from '../types/game'

type UseRoomOptions = {
  initialRoomId?: string
  getSnapshot?: () => PublicGameSnapshot
  onPlayerMessage?: (message: PlayerMessage) => void
  onHostMessage?: (message: HostMessage) => void
}

const roomPrefix = 'lol-jp-'

function makeRoomId() {
  return `${roomPrefix}${Math.random().toString(36).slice(2, 8)}`
}

export function useRoom({ initialRoomId, getSnapshot, onPlayerMessage, onHostMessage }: UseRoomOptions = {}) {
  const [roomId, setRoomId] = useState(initialRoomId ?? '')
  const [status, setStatus] = useState<NetworkStatus>('idle')
  const [error, setError] = useState('')
  const [guestCount, setGuestCount] = useState(0)
  const [lastSnapshot, setLastSnapshot] = useState<PublicGameSnapshot | null>(null)
  const peerRef = useRef<Peer | null>(null)
  const hostConnectionRef = useRef<DataConnection | null>(null)
  const guestConnectionsRef = useRef<DataConnection[]>([])
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

  const closeRoom = useCallback(() => {
    guestConnectionsRef.current.forEach((connection) => connection.close())
    hostConnectionRef.current?.close()
    peerRef.current?.destroy()
    guestConnectionsRef.current = []
    hostConnectionRef.current = null
    peerRef.current = null
    setGuestCount(0)
    setStatus('idle')
  }, [])

  const hostRoom = useCallback(() => {
    closeRoom()
    const nextRoomId = makeRoomId()
    const peer = new Peer(nextRoomId)
    peerRef.current = peer
    setRoomId(nextRoomId)
    setError('')
    setStatus('connecting')

    peer.on('open', () => {
      setStatus('connected')
    })

    peer.on('connection', (connection) => {
      guestConnectionsRef.current = [...guestConnectionsRef.current, connection]
      setGuestCount(guestConnectionsRef.current.length)

      connection.on('data', (data) => {
        const message = data as PlayerMessage
        playerMessageRef.current?.(message)
        if (message.type === 'join') {
          const snapshot = snapshotRef.current?.()
          if (snapshot && connection.open) {
            connection.send({ type: 'snapshot', payload: snapshot } satisfies HostMessage)
          }
        }
      })

      connection.on('close', () => {
        guestConnectionsRef.current = guestConnectionsRef.current.filter((guest) => guest !== connection)
        setGuestCount(guestConnectionsRef.current.length)
      })
    })

    peer.on('error', (peerError) => {
      setStatus('error')
      setError(peerError.message)
    })
  }, [closeRoom])

  const joinRoom = useCallback((targetRoomId: string, playerName: string) => {
    closeRoom()
    const peer = new Peer()
    peerRef.current = peer
    setRoomId(targetRoomId)
    setError('')
    setStatus('connecting')

    peer.on('open', () => {
      const connection = peer.connect(targetRoomId, { reliable: true })
      hostConnectionRef.current = connection

      connection.on('open', () => {
        setStatus('connected')
        connection.send({ type: 'join', playerName } satisfies PlayerMessage)
      })

      connection.on('data', (data) => {
        const message = data as HostMessage
        hostMessageRef.current?.(message)
        if (message.type === 'snapshot') {
          setLastSnapshot(message.payload)
        }
      })

      connection.on('close', () => {
        setStatus('idle')
      })
    })

    peer.on('error', (peerError) => {
      setStatus('error')
      setError(peerError.message)
    })
  }, [closeRoom])

  const broadcastSnapshot = useCallback((snapshot: PublicGameSnapshot) => {
    guestConnectionsRef.current.forEach((connection) => {
      if (connection.open) {
        connection.send({ type: 'snapshot', payload: snapshot } satisfies HostMessage)
      }
    })
  }, [])

  const sendBuzz = useCallback((teamId: string) => {
    const connection = hostConnectionRef.current
    if (connection?.open) {
      connection.send({ type: 'buzz', teamId } satisfies PlayerMessage)
    }
  }, [])

  useEffect(() => closeRoom, [closeRoom])

  return {
    roomId,
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
  }
}
