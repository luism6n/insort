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
  let [socket, setSocket] = useState(null);

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

  function changeNextPlacement(inc) {
    console.log(`emmitting changeNextPlacement`, { inc });
    socket.emit(`changeNextPlacement`, {
      increment: inc,
    });
  }

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
        {gameState.placeNextAfter === -1 ? <li key={nanoid()}>here</li> : null}
        {gameState.placedCards.map((indexInDeck, i) => {
          let card = gameState.deck[indexInDeck];
          return (
            <Fragment>
              <li key={indexInDeck}>
                {card.text}: {card.value}
              </li>
              {i === gameState.placeNextAfter ? (
                <li key={nanoid()}>here</li> // This always rerenders
              ) : null}
            </Fragment>
          );
        })}
      </ul>
      <p>
        Where does{" "}
        <span style={{ textDecoration: "underline" }}>
          {gameState.deck[gameState.nextCard].text}
        </span>{" "}
        go?
      </p>
      <button onClick={() => changeNextPlacement(-1)}>Before</button>
      <button onClick={() => changeNextPlacement(+1)}>After</button>
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

const root = ReactDOM.createRoot(document.getElementById("App"));
root.render(<App />);
