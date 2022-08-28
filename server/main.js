const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const rooms = new Map();
const socketToRoom = new Map();

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3000;
const deck = [
  {
    text: "a",
    value: "1",
  },
  {
    text: "b",
    value: "2",
  },
  {
    text: "c",
    value: "3",
  },
];

let app = express();

app.get("/r/:roomId", (req, res) => {
  // This is here only for the player join event. After
  // that, communication is socket only.
  res.sendFile(path.join(publicPath, "/index.html"));
});

let server = http.createServer(app);
let io = socketIO(server);

function randomChoice(arr) {
  if (arr.length === 0) {
    return null;
  }

  return arr[Math.floor(Math.random() * arr.length)];
}

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    socketToRoom.set(socket.id, data.roomId);

    let currentState = rooms.get(data.roomId);
    if (!currentState) {
      let firstCard = Math.floor(deck.length / 2);
      let remainingCards = [...Array(deck.length).keys()].filter(
        (i) => i !== firstCard
      );
      let currentCard = randomChoice(remainingCards);

      currentState = {
        numPlayers: 1,
        deck,
        placedCards: [firstCard],
        remainingCards,
        currentCard,
      };
    } else {
      currentState.numPlayers++;
    }

    rooms.set(data.roomId, currentState);

    console.log(`user joined, socketId=${socket.id}, roomId=${data.roomId}`);
    io.emit(`gameState-${data.roomId}`, currentState);
  });

  socket.on("disconnect", () => {
    let roomId = socketToRoom.get(socket.id);

    if (!roomId) {
      console.warn(`disconnect with no room, socketId=${socket.id}`);
      return;
    }

    let state = rooms.get(roomId);
    state.numPlayers--;

    if (state.numPlayers === 0) {
      rooms.delete(roomId);
    } else {
      rooms.set(roomId, state);
    }

    console.log(
      `user left, socketId=${socket.id}, roomId=${roomId}, numPlayers=${state.numPlayers}`
    );
    io.emit(`gameState-${roomId}`, state);
  });
});

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`server is up on http://localhost:${port}`);
});
