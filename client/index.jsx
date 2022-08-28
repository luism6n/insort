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
  const [gameState, setGameState] = useState(null);
  let socket = io();

  useEffect(() => {
    socket.emit("join", { roomId });

    socket.on(`gameState-${roomId}`, (data) => {
      setGameState(data);
    });
  }, []);

  if (!gameState) {
    return <p>Loading...</p>;
  }

  return (
    <Fragment>
      <p>
        You're in room {roomId} (players: {gameState.numPlayers})
      </p>
      <h3>Sorted cards:</h3>
      <ul>
        {gameState.placedCards.map((i) => {
          let card = gameState.deck[i];
          return (
            <li>
              {card.text}: {card.value}
            </li>
          );
        })}
      </ul>
      <h3>Cards to sort:</h3>
      <ul>
        {gameState.remainingCards.map((i) => {
          let card = gameState.deck[i];
          return (
            <>
              <li
                style={{
                  textDecoration:
                    i === gameState.currentCard ? "underline" : "none",
                }}
              >
                {card.text}
              </li>
            </>
          );
        })}
      </ul>
      <p>
        Where does{" "}
        <span style={{ textDecoration: "underline" }}>
          {gameState.deck[gameState.currentCard].text}
        </span>{" "}
        go?
      </p>
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

const root = ReactDOM.createRoot(document.getElementById("App"));
root.render(<App />);
