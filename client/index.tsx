import ReactDOM from "react-dom/client";
import React, { Fragment, useEffect, useState, ReactNode } from "react";
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
import "./styles.css";

function Home() {
  return (
    <div className="h-full flex flex-col justify-center">
      <p>
        {/* This has to be and anchor tag, not a Link,
          so that we actually hit the server */}
        Get a <a href={`/r/${nanoid()}`}>room</a>
      </p>
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h3 className="m-1 mb-2 text-lg text-blue-400">{children}</h3>;
}

function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button className="p-1 m-1 h-7 bg-gray-200" onClick={onClick}>
      {children}
    </button>
  );
}

function Select(props: {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  options: string[];
}) {
  return (
    <select
      className="m-1"
      value={props.selected}
      onChange={(e) => props.setSelected(Number.parseInt(e.target.value))}
    >
      {props.options.map((deck, i) => {
        return (
          <option value={i} key={deck}>
            {deck}
          </option>
        );
      })}
    </select>
  );
}
interface ChooseDeckScreenProps {
  deckOptions: string[];
  newGame: () => void;
  selectedDeck: number;
  setSelectedDeck: React.Dispatch<React.SetStateAction<number>>;
}

function ChooseDeckScreen(props: ChooseDeckScreenProps) {
  return (
    <div className="flex flex-col justify-center h-full">
      <Title>Choose Deck</Title>
      <Select
        selected={props.selectedDeck}
        setSelected={props.setSelectedDeck}
        options={props.deckOptions}
      ></Select>
      <Button onClick={props.newGame}>Play</Button>
    </div>
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

  let content = null;

  if (!socket || !gameState) {
    content = <p>Loading...</p>;
  } else if (gameState.match === null) {
    content = (
      <ChooseDeckScreen
        deckOptions={gameState.deckOptions}
        selectedDeck={selectedDeck}
        setSelectedDeck={setSelectedDeck}
        newGame={newGame}
      />
    );
  } else {
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

    content = (
      <div className="h-full flex flex-col justify-center">
        <p>
          You're in room {roomId} (players: {gameState.playerIds.length})
        </p>
        <h3>Sorted cards:</h3>
        <ul>
          {!gameState.match.concluded &&
          gameState.match.placeNextAfter == -1 ? (
            <li key={nanoid()}>here</li> // This always rerenders
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
        {gameState.match.concluded ? (
          <Fragment>
            {scores}
            <Button onClick={() => newGame()}>Again</Button>
            <Button onClick={() => chooseNewDeck()}>New Deck</Button>
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
            <Button onClick={() => changeNextPlacement(-1)}>Before</Button>
            <Button onClick={() => changeNextPlacement(+1)}>After</Button>
            <Button onClick={() => placeCard()}>Place</Button>
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
      </div>
    );
  }

  return content;
}

function App() {
  return (
    <div className="flex flex-col justify-between items-center h-screen">
      <header className="h-12">
        <h1 className="text-4xl text-blue-400">Insort</h1>
      </header>
      <section className="max-w-5xl flex-1">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/r/:roomId" element={<Room />} />
          </Routes>
        </BrowserRouter>
      </section>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("App") as Element);
root.render(<App />);
