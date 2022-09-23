const path = require("path");
const http = require("http");
import bodyParser from "body-parser";
import express, { Request as ExpressReq } from "express";
import { Server as SocketServer } from "socket.io";
import { GameMode } from "./../types/enums";
import { Deck, Match, RoomState } from "../types/types";
import {
  insertDeck,
  incrementDeckLikeCount,
  retreiveDeckOptions as retrieveDeckOptions,
  retrieveDeckByShortId,
  DBUniqueConstraintError,
  insertFeedback,
  getLastCardPlacementStats,
  updateCardPlacementStats,
} from "./db";

function admin(state: RoomState) {
  return state.playerIds[0];
}

const rooms = new Map<string, RoomState>();
const socketToRoom = new Map<string, string>();

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || "3000";

const gameModes = ["Individual", "Teams", "Coop"];

let app = express();

const clientSideRoutes = ["/r/:roomId", "/cards-demo", "/build-deck"];

for (let route of clientSideRoutes) {
  app.get(route, (req: ExpressReq, res: any) => {
    res.sendFile(path.join(publicPath, "/index.html"));
  });
}

function validateDeck(deck: Deck): string | null {
  if (deck.cards.length < 2) {
    return "Deck must have at least 2 cards";
  }

  if (deck.cards.length > 100) {
    return "Deck must have at most 100 cards";
  }

  return null;
}

app.post("/decks", bodyParser.json(), async (req: ExpressReq, res: any) => {
  const deck = req.body;

  let status = 200;
  let message = "";

  let errorMessage = validateDeck(deck);
  if (errorMessage) {
    status = 400;
    message = errorMessage;
  } else {
    try {
      insertDeck(deck);
    } catch (e) {
      if (e instanceof DBUniqueConstraintError) {
        status = 409;
      } else {
        status = 500;
      }
      message = e.message;
    }
  }

  res.status(status).send({ message: message });
});

app.post(
  "/decks/:deckId/likes",
  bodyParser.json(),
  (req: ExpressReq, res: any) => {
    incrementDeckLikeCount(req.params.deckId);
    res.sendStatus(200);
  }
);

// get decks endpoint
app.get("/decks", async (req: ExpressReq, res: any) => {
  let deckOptions;
  try {
    deckOptions = await retrieveDeckOptions();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Server error, please try again later." });
    return;
  }

  res.send(deckOptions);
});

app.post("/feedbacks", bodyParser.json(), async (req: ExpressReq, res: any) => {
  try {
    await insertFeedback(req.body);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Server error, please try again later." });
    return;
  }

  res.send({ message: "Feedback received" });
});

let server = http.createServer(app);
let io = new SocketServer(server, { allowEIO3: true });

if (process.env.ENVIRONMENT === "development") {
  let status = require("express-status-monitor");
  app.use(status({ websocket: io }));
}

function randomChoice<T>(arr: T[]): T | null {
  if (arr.length === 0) {
    return null;
  }

  return arr[Math.floor(Math.random() * arr.length)];
}

async function newRoomState() {
  const state: RoomState = {
    match: null,
    playerIds: [],
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

async function newMatch(
  oldState: RoomState | null,
  selectedDeckShortId: string,
  selectedGameMode: string
): Promise<RoomState> {
  const deck = await retrieveDeckByShortId(selectedDeckShortId);

  if (!deck) {
    return null;
  }

  let allCards = [...Array(deck.cards.length).keys()];
  let firstCard = randomChoice(allCards);
  let remainingCards = allCards.filter((i) => i !== firstCard);
  let nextCard = randomChoice(remainingCards);
  if (nextCard === null) {
    nextCard = -1;
  }

  let sorted = allCards.sort(
    (i, j) => deck.cards[i].value - deck.cards[j].value
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

  return {
    playerIds: oldState ? oldState.playerIds : [],
    scores: oldState ? oldState.scores : {},
    playerNames: oldState ? oldState.playerNames : {},
    currentPlayerId: oldState ? oldState.currentPlayerId : null,
    match: {
      gameMode: selectedGameMode,
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
  };
}

function updateState(roomId: string, state: RoomState) {
  console.log("state update", state);
  rooms.set(roomId, state);
  if (state.match?.deck?.creatorEmail) {
    // Hide creator e-mail from clients
    state.match.deck.creatorEmail = "";
  }
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

function scoringState(match: Match) {
  let cards = match.deck.cards;
  let p = match.placeNextAfter;
  let n = match.nextCard;
  let placedCards = match.placedCards;

  return (
    (cards[placedCards[p]]?.value || -Infinity) <= cards[n].value &&
    cards[n].value <= (cards[placedCards[p + 1]]?.value || Infinity)
  );
}

async function collectStatisticsOnCardPlacement(state: RoomState) {
  console.log("collectStatisticsOnCardPlacement");
  let match = state.match;

  let {
    deck: { cards },
    nextCard,
    placedCards,
    placeNextAfter,
  } = match;

  let inferredPlayerGuessValue;
  if (scoringState(match)) {
    inferredPlayerGuessValue = cards[nextCard].value;
  } else {
    let p = placeNextAfter;
    let valueToTheLeft = cards[placedCards[p]]?.value ?? null;
    let valueToTheRight = cards[placedCards[p + 1]]?.value ?? null;

    if (!valueToTheLeft) {
      valueToTheLeft = valueToTheRight;
    } else if (!valueToTheRight) {
      valueToTheRight = valueToTheLeft;
    }

    inferredPlayerGuessValue = (valueToTheLeft + valueToTheRight) / 2;
  }

  let placedCardId = cards[nextCard].id;

  let stats = await getLastCardPlacementStats(placedCardId);
  stats.numSamples = stats.numSamples + 1;
  stats.avg = stats.avg
    ? (stats.avg * (stats.numSamples - 1)) / stats.numSamples +
      inferredPlayerGuessValue / stats.numSamples
    : inferredPlayerGuessValue;

  console.log("stats", stats);
  await updateCardPlacementStats(stats);
}

io.on(
  "connection",
  (socket: {
    emit: (event: string, data: any) => void;
    on: (event: string, callback: (data: any) => void) => void;
    join: (channel: string) => void;
    id: string;
  }) => {
    socket.on("join", async (data: { roomId: string; playerName: string }) => {
      console.log(`got join, socketId=${socket.id}`);
      socketToRoom.set(socket.id, data.roomId);

      let state = rooms.get(data.roomId);
      if (!state) {
        state = await newRoomState();
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

      console.log(state);
      if (
        state.currentPlayerId !== socket.id &&
        state.match.gameMode !== "Coop"
      ) {
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

      if (
        state.currentPlayerId !== socket.id &&
        state.match.gameMode !== "Coop"
      ) {
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
        console.warn(`${socket.id} called "placeCard" in non-existing room`);
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

      if (state.match.concluded) {
        console.warn(`"placeCard" called in a match that's concluded`);
        return;
      }

      if (
        state.currentPlayerId !== socket.id &&
        state.match.gameMode !== "Coop"
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

      collectStatisticsOnCardPlacement(state);

      let corrected;
      if (scoringState(state.match)) {
        corrected = state.match.placeNextAfter;
        state.scores[socket.id] += 1;
        state.match.scores[socket.id] += 1;
        io.to(roomId).emit("notification", "Correct!");
      } else {
        corrected = correctPlace(state.match);
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
      async (data: { selectedDeck: string; selectedGameMode: string }) => {
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

        state = await newMatch(state, data.selectedDeck, data.selectedGameMode);

        if (!state) {
          console.error(
            `can't generate new match: room=${roomId}, socket=${socket.id}`
          );
          socket.emit(
            "warning",
            "Sorry, server error, cannot start new match. Please create another room."
          );
          return;
        }

        updateState(roomId, state);
      }
    );

    socket.on("disconnect", () => {
      let roomId = socketToRoom.get(socket.id);
      if (!roomId) {
        console.warn(`${socket.id} called "disconnect" in non-existing room`);
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

        state.playerNames = Object.fromEntries(
          Object.entries(state.playerNames).filter(
            ([id, _]) => id !== socket.id
          )
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
