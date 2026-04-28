import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3002';
const ROOM_ID = Number(process.env.ROOM_ID ?? '1');
const GAME_ID = Number(process.env.GAME_ID ?? '1');
const USER_ID = Number(process.env.USER_ID ?? '2');
const TARGET_ID = Number(process.env.TARGET_ID ?? '3');

const socket: Socket = io(SERVER_URL, {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Conectado:', socket.id);
  console.log('Entrando na sala:', ROOM_ID);

  socket.emit('join_room', { roomId: ROOM_ID });
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado:', reason);
});

socket.on('game_updated', (data) => {
  console.log('game_updated recebido:');
  console.dir(data, { depth: 4 });
});

socket.on('connect_error', (error) => {
  console.error('Erro de conexão:', error.message);
});

socket.on('error', (error) => {
  console.error('Erro do socket:', error);
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await delay(3000);

  console.log('Tentando enviar start_game...');
  socket.emit('start_game', { gameId: GAME_ID, roomId: ROOM_ID });

  await delay(3000);

  console.log('Tentando enviar vote...');
  socket.emit('vote', {
    gameId: GAME_ID,
    userId: USER_ID,
    targetId: TARGET_ID,
    roomId: ROOM_ID,
  });
}

main().catch((err) => {
  console.error('Erro no script:', err);
  process.exit(1);
});
