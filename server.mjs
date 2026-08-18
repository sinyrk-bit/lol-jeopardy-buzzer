import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'

const root = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(root, 'dist')
const port = Number(process.env.PORT ?? 10000)
const rooms = new Map()

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
])

function send(socket, payload) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload))
  }
}

function getRoom(roomId) {
  const room = rooms.get(roomId) ?? { host: null, guests: new Set(), lastSnapshot: null }
  rooms.set(roomId, room)
  return room
}

function broadcastGuestCount(roomId) {
  const room = rooms.get(roomId)
  if (room?.host) {
    send(room.host, { type: 'guest-count', count: room.guests.size })
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`)
  const unsafePath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname
  const filePath = normalize(join(distDir, unsafePath))
  const safePath = filePath.startsWith(distDir) ? filePath : join(distDir, 'index.html')

  try {
    const bytes = await readFile(safePath)
    response.writeHead(200, { 'content-type': mimeTypes.get(extname(safePath)) ?? 'application/octet-stream' })
    response.end(bytes)
  } catch {
    const index = await readFile(join(distDir, 'index.html'))
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(index)
  }
})

const wss = new WebSocketServer({ server, path: '/rooms' })

wss.on('connection', (socket) => {
  let currentRoomId = ''
  let isHost = false

  socket.on('message', (raw) => {
    let message
    try {
      message = JSON.parse(String(raw))
    } catch {
      send(socket, { type: 'error', message: 'Invalid room message.' })
      return
    }

    if (message.type === 'host-room') {
      currentRoomId = message.roomId
      isHost = true
      const room = getRoom(currentRoomId)
      room.host = socket
      send(socket, { type: 'host-ready', roomId: currentRoomId })
      broadcastGuestCount(currentRoomId)
      return
    }

    if (message.type === 'join-room') {
      currentRoomId = message.roomId
      isHost = false
      const room = getRoom(currentRoomId)
      if (!room.host) {
        send(socket, { type: 'error', message: 'Host ist nicht online. Lass den Host den Raum-Link neu erstellen.' })
        return
      }

      room.guests.add(socket)
      send(room.host, { type: 'join', playerName: message.playerName ?? 'Player' })
      if (room.lastSnapshot) {
        send(socket, { type: 'snapshot', payload: room.lastSnapshot })
      }
      broadcastGuestCount(currentRoomId)
      return
    }

    const room = rooms.get(currentRoomId)
    if (!room) {
      return
    }

    if (message.type === 'snapshot' && isHost) {
      room.lastSnapshot = message.payload
      room.guests.forEach((guest) => send(guest, { type: 'snapshot', payload: message.payload }))
      return
    }

    if (message.type === 'buzz' && !isHost && room.host) {
      send(room.host, { type: 'buzz', teamId: message.teamId })
    }
  })

  socket.on('close', () => {
    const room = rooms.get(currentRoomId)
    if (!room) {
      return
    }

    if (isHost && room.host === socket) {
      room.host = null
      room.guests.forEach((guest) => send(guest, { type: 'error', message: 'Host hat den Raum verlassen.' }))
    } else {
      room.guests.delete(socket)
    }

    broadcastGuestCount(currentRoomId)
    if (!room.host && room.guests.size === 0) {
      rooms.delete(currentRoomId)
    }
  })
})

server.listen(port, () => {
  console.log(`League Jeopardy server listening on ${port}`)
})
