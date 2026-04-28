import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://26.154.169.75:3001", {
  transports: ["websocket"],
});

export default function App() {
  const [screen, setScreen] = useState("login");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [game, setGame] = useState(null);
  const [messages, setMessages] = useState([]);

  const userId = Math.floor(Math.random() * 1000);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("game_updated", (data) => {
      setGame(data);
    });

    socket.on("chat", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("new_clue", (clue) => {
      setMessages((prev) => [...prev, clue]);
    });

    return () => socket.off();
  }, []);

  const joinRoom = () => {
    socket.emit("join_room", { roomId });
    setScreen("room");
  };

  const startGame = () => {
    socket.emit("start_game", {
      gameId: 1,
      roomId,
    });
    setScreen("game");
  };

  const vote = (targetId) => {
    socket.emit("vote", {
      gameId: 1,
      userId,
      targetId,
      roomId,
    });
  };

  const sendChat = (text) => {
    socket.emit("chat", {
      roomId,
      userId,
      message: text,
    });
  };

  const sendClue = (text) => {
    socket.emit("send_clue", {
      roomId,
      userId,
      text,
    });
  };

  // 🔹 LOGIN
  if (screen === "login") {
    return (
      <div>
        <h1>Login</h1>
        <input
          placeholder="Seu nome"
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={() => setScreen("lobby")}>
          Entrar
        </button>
      </div>
    );
  }

  // 🔹 LOBBY
  if (screen === "lobby") {
    return (
      <div>
        <h1>Lobby</h1>

        <input
          placeholder="Room ID"
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button onClick={joinRoom}>
          Entrar na Sala
        </button>
      </div>
    );
  }

  // 🔹 ROOM
  if (screen === "room") {
    return (
      <div>
        <h1>Sala {roomId}</h1>

        <button onClick={startGame}>
          Iniciar Jogo
        </button>

        {game?.players?.map((p) => (
          <div key={p.id}>
            Player {p.userId}
          </div>
        ))}
      </div>
    );
  }

  // 🔹 GAME
  return (
    <div>
      <h1>Game</h1>

      <h2>Status: {game?.status}</h2>
      <h3>Round: {game?.roundNumber}</h3>

      {/* CLUE */}
      {game?.status === "CLUE" && (
        <input
          placeholder="Dica"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendClue(e.target.value);
              e.target.value = "";
            }
          }}
        />
      )}

      {/* CHAT */}
      <input
        placeholder="Mensagem"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendChat(e.target.value);
            e.target.value = "";
          }
        }}
      />

      <div>
        {messages.map((m, i) => (
          <div key={i}>
            {m.userId}: {m.message || m.text}
          </div>
        ))}
      </div>

      {/* PLAYERS */}
      <h3>Players</h3>
      {game?.players?.map((p) => (
        <div key={p.id}>
          {p.userId} - {p.isAlive ? "🟢" : "🔴"}

          {game.status === "VOTING" && p.isAlive && (
            <button onClick={() => vote(p.userId)}>
              Votar
            </button>
          )}
        </div>
      ))}

      {/* WIN */}
      {game?.winner && (
        <h1>Vencedor: {game.winner}</h1>
      )}
    </div>
  );
}