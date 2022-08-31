const path = require("path")
const http = require("http")
import express, {Request as ExpressReq} from "express"
import {Server as SocketServer} from "socket.io"
import {Deck, GameState} from "../types/types"

const rooms = new Map<string, GameState>();
const socketToRoom = new Map<string, string>();

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || '3000';
const decks: Deck[] = [
  {
    name: "albums",
    unit: "M of copies",
    cards: [
      {
        text: "Back in Black - AC/DC",
        value: 30.1,
      },
      {
        text: "Thriller - Michael Jackson",
        value: 50.2,
      },
      {
        text: "The Bodyguard - Whitney Houston / various artists",
        value: 28.7,
      },
      {
        text: "The Dark Side of the Moon - Pink Floyd",
        value: 24.8,
      },
    ],
  },
  {
    name: "planets",
    unit: "UA",
    cards: [
      { text: "Mercury", value: 0.39 },
      { text: "Venus", value: 0.72 },
      { text: "Earth", value: 1 },
      { text: "Mars", value: 1.52 },
      { text: "Jupiter", value: 5.2 },
      { text: "Saturn", value: 9.54 },
      { text: "Uranus", value: 19.2 },
      { text: "Neptune", value: 30.06 },
    ],
  },
];

let app = express();

app.get("/r/:roomId", (req: ExpressReq, res) => {
  // This is here only for the player join event. After
  // that, communication is socket only.
  res.sendFile(path.join(publicPath, "/index.html"));
});

let server = http.createServer(app);
let io = new SocketServer(server);

function randomChoice<T>(arr: T[]): T | null {
  if (arr.length === 0) {
    return null;
  }

  return arr[Math.floor(Math.random() * arr.length)];
}

function newState(numPlayers: number, selectedDeck: number): GameState {
  const deck = decks[selectedDeck].cards;

  let firstCard = Math.floor(deck.length / 2);
  let allCards = [...Array(deck.length).keys()];
  let remainingCards = allCards.filter((i) => i !== firstCard);
  let nextCard = randomChoice(remainingCards);
  if (!nextCard) {
    nextCard = -1;
  }

  let sorted = allCards.sort((i, j) => deck[j].value - deck[i].value);
  let pos = 0;
  let correctFinalPositions = new Map();
  for (let i of sorted) {
    correctFinalPositions.set(i, pos++);
  }

  const state = {
    numPlayers: numPlayers,
    deckOptions: decks.map((d) => d.name),
    deck,
    placedCards: [firstCard],
    correctFinalPositions,
    remainingCards,
    nextCard,
    placeNextAfter: 0,
    scored: false,
  };

  console.log(state);

  return state;
}

function updateState(roomId: string, state: GameState) {
  console.log("state update", state);
  rooms.set(roomId, state);
  io.to(roomId).emit("gameState", state);
}

function correctPlace(state: GameState) {
  let pos = 0;

  for (let i of state.placedCards) {
    if (
      state.correctFinalPositions.get(i) >
      state.correctFinalPositions.get(state.nextCard)
    ) {
      break;
    }
    pos++;
  }
  return pos - 1;
}

io.on("connection", (socket: {
  emit: (event: string, data: any) => void,
  on: (event: string, callback: (data: any) => void) => void,
  join: (channel: string) => void,
  id: string
}) => {
  socket.on("join", (data: {roomId: string}) => {
    console.log(`got join, socketId=${socket.id}`);
    socketToRoom.set(socket.id, data.roomId);

    let state = rooms.get(data.roomId);
    if (!state) {
      state = newState(0, 0);
    }

    state.numPlayers++;

    socket.join(data.roomId);
    console.log(`user joined, socketId=${socket.id}, roomId=${data.roomId}`);
    updateState(data.roomId, state);
  });

  socket.on(`changeNextPlacement`, ({ increment }: {increment: number}) => {
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

    let corrected = correctPlace(state);
    if (corrected === state.placeNextAfter) {
      state.scored = true;
    } else {
      state.scored = false;
    }

    state.placedCards.splice(corrected + 1, 0, state.nextCard);

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

  socket.on("newGame", (data) => {
    let roomId = socketToRoom.get(socket.id);

    if (!roomId) {
      console.warn(`newGame on invalid room, socketId=${socket.id}`);
      return;
    }

    let state = rooms.get(roomId);
    state = newState(state.numPlayers, data.selectedDeck);

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
