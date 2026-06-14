import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const API = 'http://localhost:3001'

const s = {
  page: { fontFamily: 'sans-serif', maxWidth: 600, margin: '40px auto', padding: '0 16px' },
  col: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'flex', gap: 8 },
  input: { padding: '8px 12px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', flex: 1 },
  btn: { padding: '10px 20px', fontSize: 16, borderRadius: 6, cursor: 'pointer', background: '#222', color: '#fff', border: 'none' },
  btnDis: { padding: '10px 20px', fontSize: 16, borderRadius: 6, background: '#aaa', color: '#fff', border: 'none' },
  card: { background: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 8 },
  msg: { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '10px 14px' },
  nameBtn: { padding: '20px 32px', fontSize: 20, borderRadius: 10, cursor: 'pointer', border: '2px solid #222', background: '#fff', width: '100%' },
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function App() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [room, setRoom] = useState(null)
  const [gameId, setGameId] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [playerOrder, setPlayerOrder] = useState([])
  const [messages, setMessages] = useState([])
  const [myWord, setMyWord] = useState('')
  const [error, setError] = useState('')

  const gameIdRef = useRef(null)
  const userRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => { gameIdRef.current = gameId }, [gameId])
  useEffect(() => { userRef.current = user }, [user])

  useEffect(() => {
    fetch(`${API}/users?limit=10`).then(r => r.json()).then(d => setUsers(d.data || []))
    fetch(`${API}/rooms?limit=10`).then(r => r.json()).then(d => {
      const rooms = d.data || []
      if (rooms.length > 0) setRoom(rooms[0])
    })
  }, [])

  async function fetchMessages(gId) {
    const res = await fetch(`${API}/messages?game_id=${gId}&limit=50`).then(r => r.json())
    setMessages(res.data || [])
  }

  async function fetchGameState(gId, uid) {
    const gs = await fetch(`${API}/games/${gId}/state?userId=${uid}`).then(r => r.json())
    if (gs?.players) {
      setGameState(gs)
      setPlayerOrder(prev => prev.length === 0 ? shuffle(gs.players) : prev)
    }
  }

  async function selectUser(u) {
    setError('')
    if (!room) { setError('Nenhuma sala encontrada. A API esta rodando?'); return }
    await fetch(`${API}/rooms/${room.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id }),
    })
    setUser(u)
    userRef.current = u
    setupSocket(room.id)
    const games = await fetch(`${API}/games?room_id=${room.id}&limit=10`).then(r => r.json())
    const active = (games.data || []).find(g => !g.finishedAt)
    if (active) {
      setGameId(active.id)
      gameIdRef.current = active.id
      await fetchGameState(active.id, u.id)
      await fetchMessages(active.id)
    }
  }

  function setupSocket(roomId) {
    if (socketRef.current) socketRef.current.disconnect()
    const sock = io(API)
    socketRef.current = sock
    sock.on('connect', () => sock.emit('join_room', { roomId }))
    sock.on('game_updated', async (data) => {
      const gId = data.id ?? gameIdRef.current
      if (!gId) return
      setGameId(gId)
      gameIdRef.current = gId
      setPlayerOrder([])
      await fetchGameState(gId, userRef.current?.id)
      await fetchMessages(gId)
    })
    sock.on('message_sent', async () => {
      const gId = gameIdRef.current
      if (gId) await fetchMessages(gId)
    })
  }

  async function createGame() {
    setError('')
    const r = await fetch(`${API}/games/room/${room.id}`, { method: 'POST' })
    if (!r.ok) { const e = await r.json(); setError(e.message); return }
    const g = await r.json()
    setGameId(g.id)
    gameIdRef.current = g.id
    socketRef.current?.emit('start_game', { gameId: g.id, roomId: room.id })
  }

  async function submitWord() {
    if (!myWord.trim()) return
    const myPlayer = gameState?.players?.find(p => p.userId === user.id)
    if (!myPlayer) { setError('Aguarde o jogo carregar.'); return }
    const r = await fetch(`${API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, playerId: myPlayer.id, content: myWord.trim() }),
    })
    if (!r.ok) { const e = await r.json(); setError(e.message); return }
    setMyWord('')
    await fetchMessages(gameId)
    socketRef.current?.emit('message_sent', { roomId: room.id })
  }

  const status = gameState?.status
  const myPlayer = gameState?.players?.find(p => p.userId === user?.id)

  const playersSentIds = new Set(messages.map(m => m.playerId))
  const orderedPlayers = playerOrder.length > 0 ? playerOrder : (gameState?.players || [])

  function playerName(playerId) {
    const player = gameState?.players?.find(p => p.id === playerId)
    return users.find(u => u.id === player?.userId)?.name ?? `Jogador ${playerId}`
  }

  if (!user) {
    return (
      <div style={s.page}>
        <h1 style={{ textAlign: 'center' }}>Impostor Game</h1>
        <p style={{ textAlign: 'center', color: '#666' }}>Quem e voce?</p>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <div style={s.col}>
          {users.length === 0 && <p style={{ textAlign: 'center', color: '#aaa' }}>Carregando jogadores...</p>}
          {users.map(u => (
            <button key={u.id} style={s.nameBtn} onClick={() => selectUser(u)}>{u.name}</button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>{user.name}</h2>
        <div style={s.row}>
          {gameState?.myRole && (
            <span style={{
              padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 'bold',
              background: gameState.myRole === 'IMPOSTOR' ? '#c0392b' : '#27ae60', color: '#fff',
            }}>
              {gameState.myRole}
            </span>
          )}
          <span style={{ fontSize: 13, color: '#666', alignSelf: 'center' }}>Sala #{room?.id}</span>
        </div>
      </div>

      {gameState?.myWord && (
        <div style={{ ...s.card, marginBottom: 4, background: gameState.myRole === 'IMPOSTOR' ? '#fdecea' : '#eaf4fb' }}>
          {gameState.myRole === 'IMPOSTOR'
            ? <>Sua dica: <b>{gameState.myWord}</b></>
            : <>Sua palavra: <b>{gameState.myWord}</b></>
          }
        </div>
      )}

      {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}

      {!gameId && (
        <div style={{ ...s.card, textAlign: 'center' }}>
          <p>Sala #{room?.id} — aguardando os 3 jogadores entrarem</p>
          <button style={s.btn} onClick={createGame}>Iniciar Jogo</button>
        </div>
      )}

      {status === 'WAITING' && (
        <div style={{ ...s.card, textAlign: 'center' }}>
          <p>Jogo criado. Aguardando inicio...</p>
          <button style={s.btn} onClick={() => socketRef.current?.emit('start_game', { gameId, roomId: room.id })}>
            Iniciar
          </button>
        </div>
      )}

      {status === 'CLUE' && (
        <div style={s.col}>

          {orderedPlayers.length > 0 && (
            <div style={s.card}>
              <b style={{ fontSize: 14 }}>Ordem:</b>
              {orderedPlayers.map((p, i) => {
                const nome = playerName(p.id)
                const sent = playersSentIds.has(p.id)
                return (
                  <div key={p.id} style={{ fontSize: 14, marginTop: 4, color: sent ? '#27ae60' : '#333' }}>
                    {i + 1}. {nome}{sent ? ' - enviou' : ' - aguardando'}
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ ...s.card, ...s.col }}>
              <div style={s.row}>
                <input
                  style={s.input}
                  placeholder="Digite sua palavra..."
                  value={myWord}
                  onChange={e => setMyWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitWord()}
                  autoFocus
                />
                <button style={s.btn} onClick={submitWord}>Enviar</button>
              </div>
            </div>

          <div style={s.col}>
            {messages.map((m, i) => (
              <div key={i} style={s.msg}>
                <b>{playerName(m.playerId)}{m.playerId === myPlayer?.id ? ' (voce)' : ''}:</b> {m.content}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
