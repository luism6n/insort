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
import {Deck, GameState} from "../types/types"

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
  const [gameState, setGameState] = useState<GameState|null>(null);
  let [socket, setSocket] = useState<Socket|null>(null);
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

  if (!gameState) {
    return <p>Loading...</p>;
  }

  let scores = <Fragment>
    {Object.keys(gameState.scores).map(playerId => {
      const score = gameState.scores[playerId];
      return (<Fragment key={playerId}>
        <p>
          {playerId}: {score}
        </p>
        <br/>
      </Fragment>);
    })}
  </Fragment>

  if (gameState.nextCard === -1) {
    return (
      <Fragment>
        <h3>Game ended</h3>
        <ul>
          {gameState.placedCards.map((i) => {
            let card = gameState.deck[i];
            return (
              <li key={card.text}>
                {card.value}: {card.text}
              </li>
            );
          })}
        </ul>
        {scores}
        <button onClick={newGame}>New Game</button>
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
      </Fragment>
    );
  }

  return (
    <Fragment>
      <p>
        You're in room {roomId} (players: {gameState.numPlayers})
      </p>
      <h3>Sorted cards:</h3>
      <ul>
        {gameState.placeNextAfter === -1 ? <li key={nanoid()}>here</li> : null}
        {gameState.placedCards.map((indexInDeck, i) => {
          let card = gameState.deck[indexInDeck];
          return (
            <Fragment key={indexInDeck}>
              <li>
                {card.value}: {card.text}
              </li>
              {i === gameState.placeNextAfter ? (
                <li>here</li> // This always rerenders
              ) : null}
            </Fragment>
          );
        })}
      </ul>
      {scores}
      <p>
        Where does{" "}
        <span style={{ textDecoration: "underline" }}>
          {gameState.deck[gameState.nextCard].text}
        </span>{" "}
        go?
      </p>
      <button onClick={() => changeNextPlacement(-1)}>Before</button>
      <button onClick={() => changeNextPlacement(+1)}>After</button>
      <button onClick={() => placeCard()}>Place</button>
      <h3>Cards to sort:</h3>
      <ul>
        {gameState.remainingCards.map((i) => {
          let card = gameState.deck[i];
          return (
            <li
              key={i}
              style={{
                textDecoration: i === gameState.nextCard ? "underline" : "none",
              }}
            >
              {card.text}
            </li>
          );
        })}
      </ul>
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
