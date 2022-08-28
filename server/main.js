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
    text: "Thriller - Michael Jackson",
    value: "50.2M",
  },
  {
    text: "Back in Black - AC/DC",
    value: "30.1M",
  },
  {
    text: "The Bodyguard - Whitney Houston / various artists",
    value: "28.7M",
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

function updateState(roomId, state) {
  console.log("state update", state);
  rooms.set(roomId, state);
  io.to(roomId).emit("gameState", state);
}

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    console.log(`got join, socketId=${socket.id}`);
    socketToRoom.set(socket.id, data.roomId);

    let state = rooms.get(data.roomId);
    if (!state) {
      let firstCard = Math.floor(deck.length / 2);
      let remainingCards = [...Array(deck.length).keys()].filter(
        (i) => i !== firstCard
      );
      let nextCard = randomChoice(remainingCards);

      state = {
        numPlayers: 1,
        deck,
        placedCards: [firstCard],
        remainingCards,
        nextCard,
        placeNextAfter: 0,
      };
    } else {
      state.numPlayers++;
    }

    socket.join(data.roomId);
    console.log(`user joined, socketId=${socket.id}, roomId=${data.roomId}`);
    updateState(data.roomId, state);
  });

  socket.on(`changeNextPlacement`, ({ increment }) => {
    console.log(`got changeNextPlacement, socketId=${socket.id}`);

    let roomId = socketToRoom.get(socket.id);
    let state = rooms.get(roomId);
    console.log({ state, roomId });
    state.placeNextAfter = Math.min(
      state.placedCards.length - 1,
      Math.max(-1, state.placeNextAfter + increment)
    );

    updateState(roomId, state);
  });

  socket.on("placeCard", () => {
    let roomId = socketToRoom.get(socket.id);
    let state = rooms.get(roomId);

    state.placedCards.splice(state.placeNextAfter, 0, state.nextCard);

    console.log(state);

    state.remainingCards = state.remainingCards.filter(
      (c) => c !== state.nextCard
    );

    if (state.remainingCards.length === 0) {
      state.nextCard = -1;
    } else {
      state.nextCard = randomChoice(state.remainingCards);
    }

    updateState(roomId, state);
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
      io.to(roomId).emit(`gameState`, state);
    }

    console.log(
      `user left, socketId=${socket.id}, roomId=${roomId}, numPlayers=${state.numPlayers}`
    );
  });
});

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`server is up on http://localhost:${port}`);
});
