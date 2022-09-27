import React, { Fragment, RefObject, useEffect, useRef, useState } from "react";
import { CardPlacementStats, RoomState } from "../types/types";
import { Button } from "./designSystem";
import { getDivDimensions, getRefYDistance } from "./htmlMeasuring";
import { Card } from "./Card";
import { colors } from "./colors";

// @ts-ignore
import arrowBig from "../assets/arrow_big.png";
// @ts-ignore
import redCircle from "../assets/red_circle.png";
// @ts-ignore
import blueCircle from "../assets/blue_circle.png";
// @ts-ignore
import deckToLikeIcon from "../assets/heart_dark.png";
// @ts-ignore
import deckLikedIcon from "../assets/heart_light.png";
import { Scores } from "./Scores";
import slug from "slug";
import { motion } from "framer-motion";
import { admin } from "./Room";
import { safeExtractHostnameFromURL } from "./utils";
import SendFeedback from "./SendFeedback";
import { ev } from "./analytics";

export function Match(props: {
  roomId: string;
  changeNextCardPosition: (increment: number) => void;
  cancelSuspense: () => void;
  placeCard: () => void;
  newGame: () => void;
  playerId: string;
  roomState: RoomState;
}) {
  const [placedCardsArea, setPlacedCardsArea] = useState<HTMLElement | null>(
    null
  );
  const [virtualReferenceCard, setVirtualReferenceCard] =
    useState<HTMLElement | null>(null);
  const [nextCard, setNextCard] = useState<HTMLDivElement | null>(null);
  const [clientSidePlaceNextAfter, setClientSidePlaceNextAfter] = useState(
    props.roomState?.match?.placeNextAfter
  );
  const [nextComesFrom, setNextComesFrom] = useState({ x: 0, y: 0 });
  const [currentPlayerNameRef, setCurrentPlayerNameRef] =
    useState<HTMLDivElement | null>(null);
  const [deckLiked, setDeckLiked] = useState(false);
  const [openFeedbackOverlay, setOpenFeedbackOverlay] = useState(false);
  const [showGuessOrder, setShowGuessOrder] = useState(false);
  const [guessedCardOrder, setGuessedCardOrder] =
    useState<CardPlacementStats[]>(null);

  useEffect(() => {
    if (!props.roomState.match.concluded) {
      setClientSidePlaceNextAfter(props.roomState?.match?.placeNextAfter);
    }
  }, [props.roomState.match.placeNextAfter]);

  useEffect(() => {
    setClientSidePlaceNextAfter(
      Math.floor(props.roomState.match.placedCards.length / 2) - 1
    );
  }, [props.roomState.match.concluded]);

  useEffect(() => {
    ev(
      `place card ${props.roomState.match.placedCards.length}/${props.roomState.match.deck.cards.length}, deck ${props.roomState.match.deck.shortId}`
    );
  }, [props.roomState.match.placedCards.length]);

  async function handleDeckLike() {
    if (deckLiked) {
      ev("attempt to like already liked deck");
      return;
    }

    ev("like deck");

    setDeckLiked(true);
    await fetch(`/decks/${props.roomState.match.deck.shortId}/likes`, {
      method: "POST",
    });
  }

  function handleKeyNavigation(e: KeyboardEvent) {
    if ((e.target as HTMLInputElement).nodeName === "INPUT") {
      return;
    }

    if (e.key === "ArrowRight") {
      moveCard(1);
    } else if (e.key === "ArrowLeft") {
      moveCard(-1);
    } else if (e.key === "Enter") {
      if (!props.roomState.match.concluded) {
        props.placeCard();
      }
    }
  }

  function handleNewGame() {
    ev(`play again, deck ${match.deck.shortId}, mode ${match.gameMode}`);
    props.newGame();
  }

  function handleCheckDeckSource() {
    ev(`check deck source, deck ${match.deck.shortId}`);
  }

  useEffect(() => {
    // handleKeyNavigation closures on roomState, so we need to
    // add and remove the event listener when roomState changes
    document.addEventListener("keydown", handleKeyNavigation);

    return () => {
      document.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [props.roomState]);

  function moveCard(increment: number) {
    if (props.roomState?.match?.concluded) {
      setClientSidePlaceNextAfter((c) =>
        Math.max(
          -1,
          Math.min(c + increment, props.roomState.match.placedCards.length - 1)
        )
      );
    } else if (props.roomState?.match) {
      props.changeNextCardPosition(increment);
    }
  }

  let match = props.roomState.match;

  function playerName(pId: string) {
    const playerName = <p>{props.roomState.playerNames[pId]}</p>;
    let teamIndicator = null;
    if (
      pId === props.roomState.currentPlayerId &&
      props.roomState.match.gameMode === "Teams"
    ) {
      const teamIcon =
        props.roomState.match.teams[props.roomState.currentPlayerId] === "red"
          ? redCircle
          : blueCircle;

      teamIndicator = (
        <img
          className="mr-1"
          style={{ width: 10, height: 10 }}
          src={teamIcon}
        />
      );
    }

    return (
      <div className="flex flex-row items-baseline mx-2" key={pId}>
        {teamIndicator}
        {playerName}
      </div>
    );
  }

  let currentPayerNameXOffset = 0;
  let currentPlayerDivDimensions = [0, 0];
  if (currentPlayerNameRef) {
    currentPayerNameXOffset = currentPlayerNameRef.offsetLeft;
    currentPlayerDivDimensions = getDivDimensions(currentPlayerNameRef);
  }

  const currentPlayerIndicator = match.concluded ? null : match.gameMode ===
    "Coop" ? (
    "anyone can place cards"
  ) : (
    <div className="relative">
      <motion.div
        animate={{
          left: `calc(-${currentPayerNameXOffset}px - ${
            currentPlayerDivDimensions[0] / 2
          }px)`,
        }}
        className="absolute flex flex-row justify-center"
      >
        {props.roomState.playerIds
          .slice(
            0,
            props.roomState.playerIds.indexOf(props.roomState.currentPlayerId)
          )
          .map((pId) => {
            return playerName(pId);
          })}
        <div className="mx-2 underline" ref={(r) => setCurrentPlayerNameRef(r)}>
          {playerName(props.roomState.currentPlayerId)}
        </div>
        {props.roomState.playerIds
          .slice(
            props.roomState.playerIds.indexOf(props.roomState.currentPlayerId) +
              1,
            props.roomState.playerIds.length
          )
          .map((pId) => {
            return playerName(pId);
          })}
      </motion.div>
    </div>
  );

  let paddingX = 10;
  let paddingY = 40;
  let cardDimensions: [number, number];
  let initialY: number;

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

  function cancelSuspense() {
    setNextComesFrom({
      x: -cardDimensions[0] / 2,
      y: -cardDimensions[1] - 30 + 15 - paddingY / 2,
    });
    props.cancelSuspense();
  }

  function placeCard() {
    setNextComesFrom({
      x: -cardDimensions[0] / 2,
      y: 0,
    });

    if (isLastCardToBePlaced) {
      ev(`finish game, deck ${match.deck.shortId}`);
    }

    props.placeCard();
  }

  let clientSidePlacedCards = Array.from(match.placedCards);
  let guessedValues: number[] = null;
  if (match.suspense && !match.concluded) {
    clientSidePlacedCards.splice(match.placeNextAfter + 1, 0, match.nextCard);
  } else if (showGuessOrder) {
    // this is expensive, but it's ok, card list is small
    clientSidePlacedCards = guessedCardOrder.map((stat) => {
      return match.deck.cards.findIndex((c) => c.id === stat.cardId);
    });

    guessedValues = guessedCardOrder.map((stat) => stat.avg);
  }

  let isLastCardToBePlaced =
    clientSidePlacedCards.length === match.deck.cards.length - 1 &&
    match.suspense &&
    !match.concluded;

  async function handleToggleGuessOrder() {
    // fetch stats from /decks/deckIdShortId/guesses if guessCardOrder is null
    // otherwise, just toggle
    if (guessedCardOrder === null) {
      let res = await fetch(`/decks/${match.deck.shortId}/guesses`);
      let data = await res.json();
      setGuessedCardOrder(data);
    }

    ev(`toggle view order for deck ${match.deck.shortId}`);

    setShowGuessOrder(!showGuessOrder);
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-between relative"
      style={{ height: "calc(100% - 250px)" }}
    >
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-center text-center text-sm px-2 uppercase mt-1">
          <p>{match.deck.name}</p>
        </div>
        <section
          ref={(r) => setPlacedCardsArea(r)}
          className="flex justify-center align-center mt-1 border-y-4 relative bg-white"
          style={{
            height: cardDimensions[1] + paddingY,
            borderColor: colors.purple,
            width: "100vw",
          }}
        >
          <div className="flex w-full flex-col justify-between items-center max-w-xl">
            <div
              style={{
                position: "relative",
                height: cardDimensions[1] + paddingY,
                width: 0,
              }}
            >
              {/* This card is here so I can have a stable element to measure card size */}
              <Card
                innerRef={(r) => {
                  setVirtualReferenceCard(r);
                }}
                x={-100000}
                comesFrom={{ x: -100000, y: -100000 }}
                content={"Virtual card"}
                value={0}
                unit=""
              />
              {clientSidePlacedCards.map((indexInDeck: number, i) => {
                let card = props.roomState.match.deck.cards[indexInDeck];
                let x =
                  (i - clientSidePlaceNextAfter - 1) *
                    (cardDimensions[0] + paddingX) +
                  paddingX / 2 -
                  (match.suspense ? cardDimensions[0] / 2 + paddingX / 2 : 0);
                let y = 0 + paddingY / 4;
                return (
                  <Card
                    key={indexInDeck}
                    unit={props.roomState.match.deck.unit}
                    x={x}
                    y={y}
                    numFormatOptions={
                      props.roomState.match.deck.numFormatOptions
                    }
                    value={
                      match.suspense && indexInDeck === match.nextCard
                        ? undefined
                        : card.value
                    }
                    averageGuess={guessedValues ? guessedValues[i] : undefined}
                    content={card.text}
                    zIndex={2}
                    comesFrom={{
                      x: -cardDimensions[0] / 2,
                      y: initialY,
                    }}
                  />
                );
              })}
            </div>

            <div className="w-full px-4 flex text-sm mb-1">
              <p className="flex-1 text-right mr-8">{` ← ${match.deck.smallerMeans}`}</p>
              <p className="flex-1 text-left ml-8">{`${match.deck.biggerMeans} → `}</p>
            </div>
          </div>
        </section>

        {!props.roomState.match.concluded && (
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-between w-full text-sm text-center  max-w-xl h-0 overflow-visible">
              <div
                className="flex flex-col gap-4 p-2"
                style={{ width: `calc(50% - ${cardDimensions[0]}px/2)` }}
              >
                <div>
                  <p>admin:</p>
                  <p>{props.roomState.playerNames[admin(props.roomState)]}</p>
                </div>
              </div>
              <div
                className="flex flex-col gap-4 p-2"
                style={{ width: `calc(50% - ${cardDimensions[0]}px/2)` }}
              >
                {!props.roomState.match.concluded && (
                  <Fragment>
                    <div>
                      <p>cards left:</p>
                      <p>
                        {props.roomState.match.deck.cards.length -
                          props.roomState.match.placedCards.length}{" "}
                        out of {props.roomState.match.deck.cards.length}
                      </p>
                    </div>

                    <div>
                      <p>deck source:</p>
                      <p>{safeExtractHostnameFromURL(match.deck.source)}</p>
                    </div>

                    {props.roomState.match.deck.creatorCredit?.length > 0 && (
                      <div>
                        <p>deck by:</p>
                        <p>{props.roomState.match.deck.creatorCredit}</p>
                      </div>
                    )}
                  </Fragment>
                )}
              </div>
            </div>

            <div style={{ height: 30 - 15 }}>
              <img
                style={{ top: 15 - 30 }}
                className="relative"
                src={arrowBig}
              ></img>
            </div>
            {!match.suspense && (
              <div
                className="relative"
                style={{ height: cardDimensions[1] }}
                ref={(r) => setNextCard(r)}
              >
                <Card
                  clsNames="next-card"
                  content={
                    props.roomState.match.deck.cards[
                      props.roomState.match.nextCard
                    ].text
                  }
                  comesFrom={nextComesFrom}
                  x={-cardDimensions[0] / 2}
                  y={0}
                  numFormatOptions={props.roomState.match.deck.numFormatOptions}
                  unit={props.roomState.match.deck.unit}
                  zIndex={1}
                />
              </div>
            )}
            {match.suspense && (
              <div
                style={{ height: cardDimensions[1] }}
                className="flex justify-center items-center"
              >
                <Button onClick={cancelSuspense}>Cancel</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {props.roomState.match.concluded && (
        <div
          className="flex flex-col items-center w-full"
          style={{ minHeight: 30 - 15 + cardDimensions[1] }}
        >
          <div>
            <button
              className={`underline flex gap-2 text-sm items-center my-2`}
              onClick={handleToggleGuessOrder}
            >
              {showGuessOrder
                ? "Show correct order"
                : "Show order people guess on average"}
            </button>
          </div>
          <div>
            <label htmlFor="likeDeck" className="sr-only">
              Like this deck
            </label>
            <button
              id="likeDeck"
              className="flex gap-2 text-sm items-center my-2"
              onClick={deckLiked ? null : handleDeckLike}
            >
              <img
                src={deckLiked ? deckLikedIcon : deckToLikeIcon}
                width={15}
                height={15}
              />
              {deckLiked ? "Thanks!" : "Like this deck"}
            </button>
          </div>
          <Scores
            playerId={props.playerId}
            roomState={props.roomState}
            numPlayersToShow={3}
          />
          <Button onClick={handleNewGame}>Again</Button>
          <a
            onClick={handleCheckDeckSource}
            href={match.deck.source}
            target="_blank"
          >
            Deck source ({safeExtractHostnameFromURL(match.deck.source)})
          </a>
        </div>
      )}

      <div className="flex flex-col w-full items-center mt-2">
        <div className="flex flex-row">
          <Button
            disabled={match.suspense}
            unique="left"
            onClick={() => moveCard(-1)}
          >
            <span className="sr-only">Move card left</span>
          </Button>
          <Button
            unique="place"
            disabled={props.roomState.match.concluded}
            onClick={placeCard}
          >
            <span className="text-xl relative" style={{ top: -5, left: -2 }}>
              {match.suspense ? "CONFIRM" : "PLACE"}
            </span>
          </Button>
          <Button
            disabled={match.suspense}
            unique="right"
            onClick={() => moveCard(+1)}
          >
            <span className="sr-only">Move card right</span>
          </Button>
        </div>
        {currentPlayerIndicator}
      </div>
      <SendFeedback
        open={openFeedbackOverlay}
        setOpen={setOpenFeedbackOverlay}
      />
    </div>
  );
}
