const { io } = require('socket.io-client');

const socket = io('http://localhost:3001/', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('connected:', socket.id);

  socket.emit('join_room', { roomId: 1 });

  socket.emit('start_game', {
    gameId: 1,
    roomId: 1,
  });

  socket.emit('vote', {
    gameId: 1,
    userId: 1,
    targetId: 2,
    roomId: 1,
  });
});

socket.on('game_updated', (data) => {
  console.log('GAME UPDATE:', data);
});

socket.on('connect_error', (err) => {
  console.log('connection error:', err.message);
});
