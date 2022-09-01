import ReactDOM from "react-dom/client";
import React, { Fragment, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { nanoid } from "nanoid";
import { io, Socket } from "socket.io-client";
import { GameState } from "../types/types";

function Home() {
  return (
    <p>
      {/* This has to be and anchor tag, not a Link,
          so that we actually hit the server */}
      Get a <a href={`/r/${nanoid()}`}>room</a>
    </p>
  );
}

function Room() {
  let { roomId } = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  let [socket, setSocket] = useState<Socket | null>(null);
  const [selectedDeck, setSelectedDeck] = useState(0);

  useEffect(() => {
    if (!socket) {
      setSocket(io());
    }

    if (socket) {
      socket.emit("join", { roomId });

      socket.on(`gameState`, (data) => {
        setGameState(data);
      });
    }
  }, [socket]);

  function changeNextPlacement(inc: number) {
    console.log(`emmitting changeNextPlacement`, { inc });
    socket!.emit(`changeNextPlacement`, {
      increment: inc,
    });
  }

  function placeCard() {
    console.log(`emmitting placeCard`);
    socket!.emit("placeCard");
  }

  function newGame() {
    console.log("emitting newGame", { selectedDeck });
    socket!.emit("newGame", { selectedDeck });
  }

  function chooseNewDeck() {
    console.log("emitting chooseNewDeck");
    socket!.emit("chooseNewDeck");
  }

  if (!socket || !gameState) {
    return <p>Loading...</p>;
  }

  const scores = (
    <ul>
      {gameState.playerIds.map((id) => {
        return (
          <li
            style={{ textDecoration: id === socket.id ? "underline" : "" }}
            key={id}
          >
            {id}: {gameState.scores[id]}
          </li>
        );
      })}
    </ul>
  );

  if (gameState.match === null) {
    return (
      <Fragment>
        <h3>Choose Deck</h3>
        <select
          value={selectedDeck}
          onChange={(e) => setSelectedDeck(Number.parseInt(e.target.value))}
        >
          {gameState.deckOptions.map((deck, i) => {
            return (
              <option value={i} key={deck}>
                {deck}
              </option>
            );
          })}
        </select>
        <button onClick={() => newGame()}>Play</button>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <p>
        You're in room {roomId} (players: {gameState.playerIds.length})
      </p>
      <h3>Sorted cards:</h3>
      <ul>
        {gameState.match.placeNextAfter === -1 ? (
          <li key={nanoid()}>here</li>
        ) : null}
        {gameState.match.placedCards.map((indexInDeck, i) => {
          let card = gameState.match.deck[indexInDeck];
          return (
            <Fragment>
              <li key={indexInDeck}>
                {card.value}: {card.text}
              </li>
              {!gameState.match.concluded &&
              i === gameState.match.placeNextAfter ? (
                <li key={nanoid()}>here</li> // This always rerenders
              ) : null}
            </Fragment>
          );
        })}
      </ul>
      {scores}
      {gameState.match.concluded ? (
        <Fragment>
          <button onClick={() => newGame()}>Again</button>
          <button onClick={() => chooseNewDeck()}>New Deck</button>
        </Fragment>
      ) : (
        <Fragment>
          {" "}
          <p>
            Where does{" "}
            <span style={{ textDecoration: "underline" }}>
              {gameState.match.deck[gameState.match.nextCard].text}
            </span>{" "}
            go?
          </p>
          <button onClick={() => changeNextPlacement(-1)}>Before</button>
          <button onClick={() => changeNextPlacement(+1)}>After</button>
          <button onClick={() => placeCard()}>Place</button>
          <h3>Cards to sort:</h3>
          <ul>
            {gameState.match.remainingCards.map((i) => {
              let card = gameState.match.deck[i];
              return (
                <li
                  key={i}
                  style={{
                    textDecoration:
                      i === gameState.match.nextCard ? "underline" : "none",
                  }}
                >
                  {card.text}
                </li>
              );
            })}
          </ul>
        </Fragment>
      )}
    </Fragment>
  );
}

function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/r/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("App") as Element);
root.render(<App />);
