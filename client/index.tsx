import ReactDOM from "react-dom/client";
import React, {
  Fragment,
  useEffect,
  useState,
  ReactNode,
  useRef,
  Ref,
  RefObject,
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
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={"p-1 m-1 h-7 bg-gray-200" + (disabled ? " opacity-50" : "")}
      onClick={onClick}
    >
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

function Card({
  content,
  value,
  unit,
  x,
  y,
  comesFrom = { x: 0, y: 0 },
  innerRef = null,
  zIndex = 0,
}: {
  content: number | string;
  value: number;
  unit: string;
  x?: number;
  y?: number;
  comesFrom?: { x: number; y: number };
  innerRef?: Ref<HTMLDivElement> | null;
  zIndex?: number;
}) {
  let style: any = { position: "relative" };

  if (x !== undefined || y !== undefined) {
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
      className="border border-black flex-shrink-0 w-36 h-36 bg-gray-300 text-center text-align-center flex flex-col justify-center"
    >
      <p>{content}</p>
      <p className="font-bold">
        {value} {unit}
      </p>
    </motion.div>
  );
}

function Room() {
  let { roomId } = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  let [socket, setSocket] = useState<Socket | null>(null);
  const [selectedDeck, setSelectedDeck] = useState(0);
  const [placedCardsArea, setPlacedCardsArea] = useState<HTMLElement | null>(
    null
  );
  const [virtualReferenceCard, setVirtualReferenceCard] =
    useState<HTMLElement | null>(null);
  const [nextCard, setNextCard] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!socket) {
      setSocket(io());
    } else {
      socket.emit("join", { roomId });

      socket.on(`gameState`, (data) => {
        setGameState(data);
      });
    }
  }, [socket]);

  function changeNextPlacement(inc: number) {
    console.log(`emitting changeNextPlacement`, { inc });
    socket!.emit(`changeNextPlacement`, {
      increment: inc,
    });
  }

  function placeCard() {
    console.log(`emitting placeCard`);
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

    let padding = 10;
    let cardDimensions: [number, number];
    let initialY: number;

    console.log({ placedCardsArea, virtualReferenceCard, nextCard });
    if (placedCardsArea && virtualReferenceCard) {
      cardDimensions = getDivDimensions(virtualReferenceCard);
      if (nextCard) {
        initialY = getRefYDistance(nextCard, placedCardsArea);
      } else {
        initialY = 0;
      }
    } else {
      cardDimensions = [0, 0];
      initialY = 0;
    }

    content = (
      <div className="h-full flex flex-col justify-start">
        <p>
          You're in room {roomId} (players: {gameState.playerIds.length})
        </p>
        <section
          ref={(r) => setPlacedCardsArea(r)}
          className="flex justify-center align-center mt-5"
          style={{ height: cardDimensions[1] + padding }}
        >
          <div
            style={{
              position: "relative",
              height: cardDimensions[1] + padding,
              width: 0,
            }}
          >
            {gameState.match.placedCards.map((indexInDeck, i) => {
              let card = gameState.match.deck.cards[indexInDeck];
              let x =
                (i - gameState.match.placeNextAfter - 1) *
                  (cardDimensions[0] + padding) +
                padding / 2;
              let y = 0 + padding / 4;
              return (
                <Card
                  key={card.text}
                  unit={gameState.match.deck.unit}
                  x={x}
                  y={y}
                  value={card.value}
                  content={card.text}
                  comesFrom={{
                    x: -cardDimensions[0] / 2,
                    y: initialY,
                  }}
                />
              );
            })}
          </div>
        </section>
        <div className="flex justify-center">
          <div className="flex flex-row">
            <Button onClick={() => changeNextPlacement(-1)}>{"<"}</Button>
            <Button
              disabled={gameState.match.concluded}
              onClick={() => placeCard()}
            >
              Place
            </Button>
            <Button onClick={() => changeNextPlacement(+1)}>{">"}</Button>
          </div>
        </div>
        {!gameState.match.concluded && (
          <div className="flex flex-col items-center w-full">
            <div ref={(r) => setNextCard(r)}>
              <Card
                content={
                  gameState.match.deck.cards[gameState.match.nextCard].text
                }
                unit={gameState.match.deck.unit}
                value={10}
                zIndex={-1}
              />
            </div>
          </div>
        )}
        {gameState.match.concluded ? (
          <Fragment>
            {scores}
            <Button onClick={() => newGame()}>Again</Button>
            <Button onClick={() => chooseNewDeck()}>New Deck</Button>
          </Fragment>
        ) : (
          <Fragment>
            <h3>Cards to sort:</h3>
            <ul>
              {gameState.match.remainingCards.map((i) => {
                let card = gameState.match.deck.cards[i];
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

  return (
    <Fragment>
      {/* This card is here so I can have a stable element to measure card size */}
      <Card
        innerRef={(r) => {
          console.log("setting ref", r);
          setVirtualReferenceCard(r);
        }}
        x={-100000}
        content={"Virtual card"}
        value={0}
        unit=""
      />
      {content}
    </Fragment>
  );
}

function getRefYDistance(d1: HTMLElement, d2: HTMLElement): number {
  return d1.getBoundingClientRect().top - d2.getBoundingClientRect().top;
}

function getDivDimensions(d: HTMLElement): [number, number] {
  let rect = d.getBoundingClientRect();
  return [rect.width, rect.height];
}

function CardsDemo() {
  const [cards, setCards] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [placeNextAfter, setPlaceNextAfter] = useState(4);
  const [initialY, setInitialY] = useState(0);
  const placedCardsArea = useRef<HTMLDivElement | null>(null);
  const firstCard = useRef<HTMLDivElement | null>(null);
  const nextCard = useRef<HTMLDivElement | null>(null);
  const [cardDimensions, setCardDimensions] = useState<[number, number]>([
    0, 0,
  ]);

  function moveLeft() {
    setPlaceNextAfter((p) => (p - 1 < 0 ? 0 : p - 1));
  }

  function moveRight() {
    setPlaceNextAfter((p) => (p + 1 > cards.length ? cards.length : p + 1));
  }

  function addCard() {
    setCards((c) => {
      c.splice(placeNextAfter, 0, c.length);
      return Array.from(c); // This is necessary to trigger a rerender
    });
  }

  useEffect(() => {
    if (!nextCard.current || !placedCardsArea.current) {
      return;
    }
    setInitialY(getRefYDistance(nextCard.current, placedCardsArea.current));

    let [cardWidth, cardHeight] = getDivDimensions(firstCard.current);
    setCardDimensions([cardWidth, cardHeight]);
  }, [firstCard.current, nextCard.current, placedCardsArea.current]);

  let w = window.innerWidth;
  let padding = 20;

  return (
    <Fragment>
      <div ref={placedCardsArea} className="flex justify-center align-center">
        <div
          style={{
            position: "relative",
            height: cardDimensions[1] + padding,
            width: 0,
          }}
        >
          {cards.map((num, i) => {
            let x =
              (i - placeNextAfter) * (cardDimensions[0] + padding / 2) +
              padding / 4;
            let y = 0 + padding / 2;
            return (
              <Card
                innerRef={i === 0 ? firstCard : null}
                x={x}
                y={y}
                key={num}
                content={num}
                value={num}
                comesFrom={{
                  x: -cardDimensions[0] / 2,
                  y: initialY,
                }}
                zIndex={1}
                unit="units"
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <p>^</p>
        <div ref={nextCard}>
          <Card unit="unit" content={cards.length} value={10} zIndex={-1} />
        </div>
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
      <section className="max-w-5xl w-3/5 flex-1 flex flex-col justify-center align-center">
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
