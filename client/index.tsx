import ReactDOM from "react-dom/client";
import React, {
  Fragment,
  useEffect,
  useState,
  ReactNode,
  useRef,
  Ref,
} from "react";
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
import { ForwardRefComponent, HTMLMotionProps, motion } from "framer-motion";
import "./styles.css";

function Home() {
  return (
    <div className="h-full flex flex-col justify-center">
      <p>
        {/* This has to be and anchor tag, not a Link,
        so that we actually hit the server */}
        <a href={`/r/${nanoid()}`}>Get a room</a>
      </p>
      <p>
        {/* This has to be and anchor tag, not a Link,
          so that we actually hit the server */}
        <Link to="/cards-demo">Watch cards demo</Link>
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

function Card({
  content,
  x = 0,
  y = 0,
  comesFrom = { x: 0, y: 0 },
  innerRef = null,
  zIndex = 0,
}: {
  content: number;
  x?: number;
  y?: number;
  comesFrom?: { x: number; y: number };
  innerRef?: Ref<HTMLDivElement> | null;
  zIndex?: number;
}) {
  let style: any = { position: "relative" };

  if (x || y) {
    style = {
      position: "absolute",
    };
  }

  return (
    <motion.div
      style={{ ...style, zIndex }}
      animate={{ left: x, top: y }}
      transition={{ duration: 0.5 }}
      initial={{ left: comesFrom.x, top: comesFrom.y }}
      ref={innerRef}
      className="m-2 flex-shrink-0 w-20 h-24 bg-gray-300 text-center text-align-center"
    >
      {content}
    </motion.div>
  );
}

function CardsDemo() {
  const [cards, setCards] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [placeNextAfter, setPlaceNextAfter] = useState(4);
  const [initialY, setInitialY] = useState(0);
  const placedCardsArea = useRef<HTMLDivElement | null>(null);
  const nextCard = useRef<HTMLDivElement | null>(null);

  function moveLeft() {
    setPlaceNextAfter((p) => (p - 1 < 0 ? 0 : p - 1));
  }

  function moveRight() {
    setPlaceNextAfter((p) => (p + 1 > cards.length ? cards.length : p + 1));
  }

  function addCard() {
    setCards((c) => {
      c.splice(placeNextAfter, 0, c.length);
      console.log(c);
      return Array.from(c); // This is necessary to trigger a rerender
    });
  }

  console.log("render");

  useEffect(() => {
    if (!nextCard.current || !placedCardsArea.current) {
      return;
    }

    let rect = placedCardsArea.current.getBoundingClientRect();
    let placedCardsAreaTop = rect.top;

    rect = nextCard.current.getBoundingClientRect();
    let nextCardTop = rect.top;
    setInitialY(nextCardTop - placedCardsAreaTop);
  }, []);

  let w = window.innerWidth;
  let cardWidth = 96;
  let cardHeight = 112;
  console.log(initialY);

  return (
    <Fragment>
      <div ref={placedCardsArea} className="flex justify-center align-center">
        <div
          style={{ position: "relative", height: cardHeight + 20, width: 0 }}
        >
          {cards.map((num, i) => {
            let x = (i - placeNextAfter) * cardWidth;
            let y = 0;
            console.log({ num, x, y });
            return (
              <Card
                x={x}
                y={y}
                key={num}
                content={num}
                comesFrom={{ x: -cardWidth / 2, y: initialY }}
                zIndex={1}
              />
            );
          })}
          <p
            style={{
              position: "absolute",
              left: -5,
              top: cardHeight + 2,
            }}
          >
            ^
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Card innerRef={nextCard} content={cards.length} />
        <div className="flex justify-between">
          <Button onClick={moveLeft}>{"<"}</Button>
          <Button onClick={addCard}>Add card</Button>
          <Button onClick={moveRight}>{">"}</Button>
        </div>
      </div>
    </Fragment>
  );
}

function App() {
  return (
    <div className="flex flex-col justify-between items-center h-screen w-screen overflow-hidden">
      <header className="h-12">
        <h1 className="text-4xl text-blue-400">Insort</h1>
      </header>
      <section className="max-w-5xl flex-1 flex flex-col justify-center align-center">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/r/:roomId" element={<Room />} />
            <Route path="/cards-demo" element={<CardsDemo />} />
          </Routes>
        </BrowserRouter>
      </section>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("App") as Element);
root.render(<App />);
