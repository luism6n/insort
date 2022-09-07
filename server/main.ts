const path = require("path")
const http = require("http")
import express, {Request as ExpressReq} from "express"
import {Server as SocketServer} from "socket.io"
import {Deck, RoomState} from "../types/types"


function admin(state: RoomState) {
  return state.playerIds[0];
}

const rooms = new Map<string, RoomState>();
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

const clientSideRoutes = [
  "/r/:roomId",
  "/cards-demo",
]

for (let route of clientSideRoutes) {
  app.get(route, (req: ExpressReq, res: any) => {
    res.sendFile(path.join(publicPath, "/index.html"));
  });
}

let server = http.createServer(app);
let io = new SocketServer(server);

function randomChoice<T>(arr: T[]): T | null {
  if (arr.length === 0) {
    return null;
  }

  return arr[Math.floor(Math.random() * arr.length)];
}

function newRoomState() {
  const state: RoomState = {
    match: null,
    playerIds: [],
    deckOptions: decks.map((d) => d.name),
    scores: {},
    playerNames: {},
    currentPlayerId: null,
  };

  return state
}

function nextPlayer(roomState: RoomState) {
  let currentPlayerIndex = roomState.playerIds.indexOf(roomState.currentPlayerId);
  let nextPlayerIndex = (currentPlayerIndex + 1) % roomState.playerIds.length;
  return roomState.playerIds[nextPlayerIndex];
}

function newMatch(oldState: RoomState | null, selectedDeck: number): RoomState {
    const deck = decks[selectedDeck]

    let firstCard = Math.floor(deck.cards.length / 2);
    let allCards = [...Array(deck.cards.length).keys()];
    let remainingCards = allCards.filter((i) => i !== firstCard);
    let nextCard = randomChoice(remainingCards);
    if (nextCard === null) {
      nextCard = -1;
    }
  
    let sorted = allCards.sort((i, j) => deck.cards[j].value - deck.cards[i].value);
    let pos = 0;
    let correctFinalPositions = new Map();
    for (let i of sorted) {
      correctFinalPositions.set(i, pos++);
    }

  const state = {
    deckOptions: decks.map((d) => d.name),
    playerIds: oldState ? oldState.playerIds : [],
    scores: oldState ? oldState.scores : {},
    playerNames: oldState ? oldState.playerNames : {},
    currentPlayerId: oldState ? oldState.currentPlayerId : null,
    match: {
      deck,
      placedCards: [firstCard],
      correctFinalPositions,
      remainingCards,
      nextCard,
      placeNextAfter: 0,
      concluded: false,
    },
  };

  console.log(state);

  return state;
}

function updateState(roomId: string, state: RoomState) {
  console.log("state update", state);
  rooms.set(roomId, state);
  io.to(roomId).emit("roomState", state);
}

function correctPlace(state: RoomState) {
  let pos = 0;

  for (let i of state.match.placedCards) {
    if (
      state.match.correctFinalPositions.get(i) >
      state.match.correctFinalPositions.get(state.match.nextCard)
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
  socket.on("join", (data: {roomId: string, playerName: string}) => {
    console.log(`got join, socketId=${socket.id}`);
    socketToRoom.set(socket.id, data.roomId);

    let state = rooms.get(data.roomId);
    if (!state) {
      state = newRoomState();
      state.currentPlayerId = socket.id;
    }

    state.scores[socket.id] = 0;
    state.playerIds.push(socket.id);
    state.playerNames = {...state.playerNames, [socket.id]: data.playerName};

    socket.join(data.roomId);
    io.to(data.roomId).emit("notification", `${data.playerName} joined the room`);
    console.log(`user joined, socketId=${socket.id}, roomId=${data.roomId}`);

    updateState(data.roomId, state);
  });

  socket.on(`changeNextCardPosition`, (data: {increment: number}) => {
    console.log(`got changeNextCardPosition, socketId=${socket.id}`);

    let roomId = socketToRoom.get(socket.id);
    let state = rooms.get(roomId);

    if (state.currentPlayerId !== socket.id) {
      socket.emit('warning', 'Oops, not your turn yet.');
      return;
    }

    console.log({ state, roomId });
    state.match.placeNextAfter = Math.min(
      state.match.placedCards.length - 1,
      Math.max(-1, state.match.placeNextAfter + data.increment)
    );

    updateState(roomId, state);
  });

  socket.on("placeCard", () => {
    let roomId = socketToRoom.get(socket.id);
    let state = rooms.get(roomId);

    if (state.currentPlayerId !== socket.id) {
      socket.emit('warning', 'Oops, not your turn yet.');
      return;
    }

    let corrected = correctPlace(state);
    if (corrected === state.match.placeNextAfter) {
      state.scores[socket.id] += 1;
    }

    state.match.placedCards.splice(corrected + 1, 0, state.match.nextCard);

    state.match.remainingCards = state.match.remainingCards.filter(
      (c) => c !== state.match.nextCard
    );

    if (state.match.remainingCards.length === 0) {
      state.match.concluded = true;
      state.match.placeNextAfter = state.match.deck.cards.length/2 - 1;
    } else {
      state.match.nextCard = randomChoice(state.match.remainingCards);
      state.match.placeNextAfter = corrected;
    }

    state.currentPlayerId = nextPlayer(state)

    updateState(roomId, state);
  });

  socket.on("chooseNewDeck", () => {
    let roomId = socketToRoom.get(socket.id);
    let state = rooms.get(roomId);

    if (socket.id !== admin(state)) {
      socket.emit("warning", "Only the admin can choose a new deck");
      return;
    }

    state.match = null

    return updateState(roomId, state)
  });

  socket.on("newGame", (data: {selectedDeck: number}) => {
    console.log(`got newGame, data=${JSON.stringify(data)}`);
    let roomId = socketToRoom.get(socket.id);

    if (!roomId) {
      console.warn(`newGame on invalid room, socketId=${socket.id}`);
      return;
    }

    let state = rooms.get(roomId);

    if (socket.id !== admin(state)) {
      socket.emit("warning", "Only the admin can start a new game");
      return;
    }

    state = newMatch(state, data.selectedDeck);

    updateState(roomId, state);
  });

  socket.on("disconnect", () => {
    let roomId = socketToRoom.get(socket.id);

    if (!roomId) {
      console.warn(`disconnect with no room, socketId=${socket.id}`);
      return;
    }

    let state = rooms.get(roomId);
    state.playerIds = state.playerIds.filter((id) => id !== socket.id);

    if (state.playerIds.length === 0) {
      rooms.delete(roomId);
    } else {
      state.currentPlayerId = nextPlayer(state);
      state.scores = Object.fromEntries(
        Object.entries(state.scores).filter(([id, _]) => id !== socket.id)
      );
      updateState(roomId, state);
    }

    console.log(
      `user left, socketId=${socket.id}, roomId=${roomId}, numPlayers=${state.playerIds.length}`
    );
  });
});

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`server is up on http://localhost:${port}`);
});
