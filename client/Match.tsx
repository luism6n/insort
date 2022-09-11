import React, { Fragment, useEffect, useState } from "react";
import { RoomState } from "../types/types";
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
import { Scores } from "./Scores";

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

  const teamIndicator =
    props.roomState.match.gameMode !== "Teams"
      ? null
      : props.roomState.match.teams[props.roomState.currentPlayerId] === "red"
      ? redCircle
      : blueCircle;

  const currentPlayerIndicator = match.concluded ? null : (
    <div className="text-sm flex flex-row gap-2 items-center">
      {teamIndicator && (
        <img style={{ width: 10, height: 10 }} src={teamIndicator} />
      )}

      <p>
        {props.roomState.currentPlayerId === props.playerId
          ? "your turn..."
          : props.roomState.playerNames[props.roomState.currentPlayerId] +
            " is playing..."}
      </p>
      <p>{`card ${match.placedCards.length + 1} out of ${
        match.deck.cards.length
      }`}</p>
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
    props.placeCard();
  }

  let clientSidePlacedCards = Array.from(match.placedCards);
  if (match.suspense) {
    clientSidePlacedCards.splice(match.placeNextAfter + 1, 0, match.nextCard);
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-between relative"
      style={{ height: "calc(100% - 250px)" }}
    >
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-center text-sm mt-2">
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
                    value={
                      match.suspense && indexInDeck === match.nextCard
                        ? "??"
                        : Intl.NumberFormat(
                            "en-US",
                            match.deck.numFormatOptions
                              ? match.deck.numFormatOptions
                              : {}
                          ).format(card.value)
                    }
                    content={`#${i + 1}${
                      indexInDeck === match.nextCard && !match.concluded
                        ? "?"
                        : ""
                    } ${card.text}`}
                    zIndex={2}
                    comesFrom={{
                      x: -cardDimensions[0] / 2,
                      y: initialY,
                    }}
                  />
                );
              })}
            </div>

            <div className="w-full px-4 flex text-sm justify-between">
              <p className="flex-1 text-left">{`← ${match.deck.biggerIs}`}</p>
              <p className="flex-1 ml-auto text-right">{`${match.deck.smallerIs} →`}</p>
            </div>
          </div>
        </section>

        {!props.roomState.match.concluded && (
          <div className="flex flex-col items-center w-full">
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
                  unit={props.roomState.match.deck.unit}
                  value={"??"}
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

      <div className="flex flex-col w-full items-center mt-2">
        {props.roomState.match.concluded && (
          <div
            className="flex flex-col items-center w-full"
            style={{ height: 30 - 15 + cardDimensions[1] }}
          >
            <Scores
              playerId={props.playerId}
              roomState={props.roomState}
              numPlayersToShow={3}
            />
            <Button onClick={() => props.newGame()}>Again</Button>
            <a
              className="text-sm underline hover:text-red-800"
              href={props.roomState.match.deck.source}
              target="_blank"
            >
              Deck source (external link)
            </a>
          </div>
        )}
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
    </div>
  );
}
