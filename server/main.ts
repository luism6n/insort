const path = require("path");
const http = require("http");
import express, { Request as ExpressReq } from "express";
import { Server as SocketServer } from "socket.io";
import { Deck, Match, RoomState } from "../types/types";
import { decks } from "./decks";

function admin(state: RoomState) {
  return state.playerIds[0];
}

const rooms = new Map<string, RoomState>();
const socketToRoom = new Map<string, string>();

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || "3000";

const gameModes = ["Individual", "Teams", "Coop"];

let app = express();

const clientSideRoutes = ["/r/:roomId", "/cards-demo"];

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
    gameModeOptions: gameModes,
    scores: {},
    playerNames: {},
    currentPlayerId: null,
  };

  return state;
}

function nextPlayer(roomState: RoomState) {
  let currentPlayerIndex = roomState.playerIds.indexOf(
    roomState.currentPlayerId
  );
  let nextPlayerIndex = (currentPlayerIndex + 1) % roomState.playerIds.length;
  return roomState.playerIds[nextPlayerIndex];
}

function newMatch(
  oldState: RoomState | null,
  selectedDeck: number,
  selectedGameMode: number
): RoomState {
  const deck = decks[selectedDeck];

  let firstCard = Math.floor(deck.cards.length / 2);
  let allCards = [...Array(deck.cards.length).keys()];
  let remainingCards = allCards.filter((i) => i !== firstCard);
  let nextCard = randomChoice(remainingCards);
  if (nextCard === null) {
    nextCard = -1;
  }

  let sorted = allCards.sort(
    (i, j) => deck.cards[j].value - deck.cards[i].value
  );
  let pos = 0;
  let correctFinalPositions = new Map();
  for (let i of sorted) {
    correctFinalPositions.set(i, pos++);
  }

  const matchScores = oldState
    ? Object.fromEntries(oldState.playerIds.map((id) => [id, 0]))
    : {};

  let teams: { [playerId: string]: string } = {};
  if (oldState.match?.teams) {
    teams = oldState.match.teams;
  } else {
    const options = ["red", "blue"];
    let i = 0;
    for (let playerId of oldState.playerIds) {
      teams[playerId] = options[i % 2];
      i++;
    }
  }

  const state = {
    deckOptions: decks.map((d) => d.name),
    gameModeOptions: gameModes,
    playerIds: oldState ? oldState.playerIds : [],
    scores: oldState ? oldState.scores : {},
    playerNames: oldState ? oldState.playerNames : {},
    currentPlayerId: oldState ? oldState.currentPlayerId : null,
    match: {
      gameMode: gameModes[selectedGameMode],
      teams: teams,
      scores: matchScores,
      deck,
      placedCards: [firstCard],
      correctFinalPositions,
      remainingCards,
      nextCard,
      placeNextAfter: -1,
      concluded: false,
      suspense: false,
    },
  } as RoomState;

  return state;
}

function updateState(roomId: string, state: RoomState) {
  console.log("state update", state);
  rooms.set(roomId, state);
  io.to(roomId).emit("roomState", state);
}

function correctPlace(match: Match) {
  if (match === null) {
    console.error("correctPlace called with null match");
    return null;
  }

  let pos = 0;

  for (let i of match.placedCards) {
    if (
      match.correctFinalPositions.get(i) >
      match.correctFinalPositions.get(match.nextCard)
    ) {
      break;
    }
    pos++;
  }
  return pos - 1;
}

function teamWithLeastPlayers(state: RoomState) {
  function count(team: string) {
    return state.playerIds.reduce((id) => {
      return state.match.teams[id] === team ? 1 : 0;
    }, 0);
  }

  let redCount = count("red");
  let blueCount = count("blue");

  if (redCount < blueCount) {
    return "red";
  } else if (blueCount < redCount) {
    return "blue";
  } else {
    return randomChoice(["red", "blue"]);
  }
}

io.on(
  "connection",
  (socket: {
    emit: (event: string, data: any) => void;
    on: (event: string, callback: (data: any) => void) => void;
    join: (channel: string) => void;
    id: string;
  }) => {
    socket.on("join", (data: { roomId: string; playerName: string }) => {
      console.log(`got join, socketId=${socket.id}`);
      socketToRoom.set(socket.id, data.roomId);

      let state = rooms.get(data.roomId);
      if (!state) {
        state = newRoomState();
        state.currentPlayerId = socket.id;
      }

      if (state.match?.gameMode === "Teams") {
        state.match.teams = {
          ...state.match.teams,
          [socket.id]: teamWithLeastPlayers(state),
        };
      }

      if (state.match) {
        state.match.scores = {
          ...state.match.scores,
          [socket.id]: 0,
        };
      }

      state.scores[socket.id] = 0;
      state.playerIds.push(socket.id);
      state.playerNames = {
        ...state.playerNames,
        [socket.id]: data.playerName,
      };

      socket.join(data.roomId);
      io.to(data.roomId).emit(
        "notification",
        `${data.playerName} joined the room`
      );
      console.log(`user joined, socketId=${socket.id}, roomId=${data.roomId}`);

      updateState(data.roomId, state);
    });

    socket.on("chatMessage", (data: { text: string }) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(`${socket.id} called "chatMessage" in non-existing room`);
        socket.emit(
          "notification",
          "You are not in a room, how did you get here? Please, refresh the page."
        );
        return;
      }

      io.to(roomId).emit("chatMessage", {
        text: data.text,
        senderId: socket.id,
      });
    });

    socket.on("changeTeams", () => {
      console.log(`got changeTeams, socketId=${socket.id}`);

      let roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(`${socket.id} called "changeTeams" in non-existing room`);
        return;
      }

      let state = rooms.get(roomId);
      if (!state || !state.match || state.match.gameMode !== "Teams") {
        console.warn(
          `${socket.id} called "changeTeams" in non-team game: null_state=${
            state === null
          }, null_match=${state?.match === null}, gameMode=${
            state?.match?.gameMode
          }`
        );
        socket.emit(
          "warning",
          "You're not in a team match, how did you get here? Refresh the page to rejoin the room."
        );
        return;
      }

      let team = state.match.teams[socket.id];
      let newTeam: string = team === "red" ? "blue" : "red";
      state.match.teams = { ...state.match.teams, [socket.id]: newTeam };
      updateState(roomId, state);
    });

    socket.on("changeNextCardPosition", (data: { increment: number }) => {
      console.log(`got changeNextCardPosition, socketId=${socket.id}`);

      let roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(
          `${socket.id} called "changeNextCardPosition" in non-existing room`
        );
        socket.emit(
          "warning",
          "You're not in a room, how did you get here? Refresh the page to rejoin the room."
        );
        return;
      }
      let state = rooms.get(roomId);
      if (!state || !state.match) {
        console.warn(
          `${
            socket.id
          } called "changeNextCardPosition" in non-existing match: null_state=${
            state === null
          }, null_match=${state?.match === null}`
        );
        socket.emit(
          "warning",
          "You're not in a match, how did you get here? Refresh the page to rejoin the room."
        );
        return;
      }

      if (state.currentPlayerId !== socket.id) {
        socket.emit("warning", "Oops, not your turn yet.");
        return;
      }

      if (state.match.suspense) {
        socket.emit("warning", "Should not get here...");
        return;
      }

      state.match.placeNextAfter = Math.min(
        state.match.placedCards.length - 1,
        Math.max(-1, state.match.placeNextAfter + data.increment)
      );

      updateState(roomId, state);
    });

    socket.on("cancelSuspense", () => {
      console.log(`got cancelSuspense, socketId=${socket.id}`);

      let roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(
          `${socket.id} called "cancelSuspense" in non-existing room`
        );
        return;
      }

      let state = rooms.get(roomId);
      if (!state || !state.match) {
        console.warn(
          `${
            socket.id
          } called "cancelSuspense" in non-existing match: null_state=${
            state === null
          }, null_match=${state?.match === null}`
        );
        return;
      }

      if (state.currentPlayerId !== socket.id) {
        socket.emit("warning", "Oops, not your turn yet.");
        return;
      }

      if (!state.match.suspense) {
        socket.emit("warning", "Should not get here");
        return;
      }

      state.match.suspense = false;
      updateState(roomId, state);
    });

    socket.on("placeCard", () => {
      let roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(`${socket.id} called "" in non-existing room`);
        return;
      }
      let state = rooms.get(roomId);

      if (!state || !state.match) {
        console.warn(
          `${socket.id} called "placeCard" in non-existing match: null_state=${
            state === null
          }, null_match=${state?.match === null}`
        );
        socket.emit(
          "warning",
          "You're not in a match, how did you get here? Refresh the page to rejoin the room."
        );
        return;
      }

      if (
        state.currentPlayerId !== socket.id &&
        !(state.match.gameMode === "Coop")
      ) {
        socket.emit("warning", "Oops, not your turn yet.");
        return;
      }

      if (!state.match.suspense) {
        state.match.suspense = true;
        updateState(roomId, state);
        return;
      } else {
        state.match.suspense = false;
      }

      let corrected = correctPlace(state.match);
      let cards = state.match.deck.cards;
      let p = state.match.placeNextAfter;
      let n = state.match.nextCard;
      let placedCards = state.match.placedCards;
      console.log(cards[placedCards[p]], cards[n], cards[placedCards[p + 1]]);
      if (
        (cards[placedCards[p]]?.value || Infinity) >= cards[n].value &&
        cards[n].value >= (cards[placedCards[p + 1]]?.value || -Infinity)
      ) {
        if (!(state.match.gameMode === "Coop")) {
          state.scores[socket.id] += 1;
          state.match.scores[socket.id] += 1;
        }
        io.to(roomId).emit("notification", "Correct!");
      } else {
        io.to(roomId).emit("warning", "Wrong!");
      }

      state.match.placedCards.splice(corrected + 1, 0, state.match.nextCard);

      state.match.remainingCards = state.match.remainingCards.filter(
        (c) => c !== state.match.nextCard
      );

      if (state.match.remainingCards.length === 0) {
        state.match.concluded = true;
        state.match.placeNextAfter = state.match.deck.cards.length / 2 - 1;
      } else {
        state.match.nextCard = randomChoice(state.match.remainingCards);
        state.match.placeNextAfter = corrected;
      }

      state.currentPlayerId = nextPlayer(state);

      updateState(roomId, state);
    });

    socket.on("changeRoomSettings", () => {
      let roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(
          `${socket.id} called "changeRoomSettings" in non-existing room`
        );
        socket.emit(
          "warning",
          "You're not in a room, how did you get here? Refresh the page to rejoin the room."
        );
        return;
      }
      let state = rooms.get(roomId);

      if (socket.id !== admin(state)) {
        socket.emit("warning", "Only the admin can choose a new deck");
        return;
      }

      state.match = null;

      return updateState(roomId, state);
    });

    socket.on(
      "newGame",
      (data: { selectedDeck: number; selectedGameMode: number }) => {
        console.log(`got newGame, data=${JSON.stringify(data)}`);
        let roomId = socketToRoom.get(socket.id);
        if (!roomId) {
          console.warn(`${socket.id} called "newGame" in non-existing room`);
          socket.emit(
            "warning",
            "You're not in a room, how did you get here? Refresh the page to rejoin the room."
          );
          return;
        }

        if (!roomId) {
          console.warn(`newGame on invalid room, socketId=${socket.id}`);
          return;
        }

        let state = rooms.get(roomId);

        if (socket.id !== admin(state)) {
          socket.emit("warning", "Only the admin can start a new game");
          return;
        }

        state = newMatch(state, data.selectedDeck, data.selectedGameMode);

        updateState(roomId, state);
      }
    );

    socket.on("disconnect", () => {
      let roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(`${socket.id} called "" in non-existing room`);
        return;
      }

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

        if (state.match?.gameMode === "Teams") {
          state.match.teams = Object.fromEntries(
            Object.entries(state.match.teams).filter(
              ([id, _]) => id !== socket.id
            )
          );
        }

        if (state.match) {
          state.match.scores = Object.fromEntries(
            Object.entries(state.match.scores).filter(
              ([id, _]) => id !== socket.id
            )
          );
        }

        io.to(roomId).emit(
          "notification",
          `${state.playerNames[socket.id]} left the room`
        );
        updateState(roomId, state);
      }

      console.log(
        `user left, socketId=${socket.id}, roomId=${roomId}, numPlayers=${state.playerIds.length}`
      );
    });
  }
);

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`server is up on http://localhost:${port}`);
});
