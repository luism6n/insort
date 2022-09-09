import React, { Fragment, useEffect, useState } from "react";
import { RoomState } from "../types/types";
import { Button } from "./designSystem";
import { getDivDimensions, getRefYDistance } from "./htmlMeasuring";
import { Card } from "./Card";
import { colors } from "./colors";

// @ts-ignore
import arrowBig from "../assets/arrow_big.png";

export function Match(props: {
  roomId: string;
  changeNextCardPosition: (increment: number) => void;
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

  return (
    <div
      className="w-full flex flex-col items-center justify-between relative"
      style={{ height: "calc(100% - 250px)" }}
    >
      <div className="flex flex-col items-center">
        <p className="text-sm mt-2">{"< bigger | smaller >"}</p>
        <section
          ref={(r) => setPlacedCardsArea(r)}
          className="flex justify-center align-center mt-1 border-y-4 relative bg-white"
          style={{
            height: cardDimensions[1] + paddingY,
            borderColor: colors.purple,
            width: "100vw",
          }}
        >
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
            {props.roomState.match.placedCards.map((indexInDeck: number, i) => {
              let card = props.roomState.match.deck.cards[indexInDeck];
              let x =
                (i - clientSidePlaceNextAfter - 1) *
                  (cardDimensions[0] + paddingX) +
                paddingX / 2;
              let y = 0 + paddingY / 4;
              return (
                <Card
                  key={card.text}
                  unit={props.roomState.match.deck.unit}
                  x={x}
                  y={y}
                  value={card.value}
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
        </section>

        {!props.roomState.match.concluded && (
          <div className="flex flex-col items-center w-full">
            <div style={{ height: 24 - 15 }} className="mb-2">
              <img
                style={{ top: -15 }}
                className="relative"
                src={arrowBig}
              ></img>
            </div>
            <div ref={(r) => setNextCard(r)}>
              <Card
                content={
                  props.roomState.match.deck.cards[
                    props.roomState.match.nextCard
                  ].text
                }
                unit={props.roomState.match.deck.unit}
                value={"??"}
                zIndex={1}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mt-2">
        {props.roomState.match.concluded && (
          <Fragment>
            <Button onClick={() => props.newGame()}>Again</Button>
          </Fragment>
        )}
        <div className="flex flex-row">
          <Button unique="left" onClick={() => moveCard(-1)}>
            <span className="sr-only">Move card left</span>
          </Button>
          <Button
            unique="place"
            disabled={props.roomState.match.concluded}
            onClick={() => props.placeCard()}
          >
            <span className="text-xl relative" style={{ top: -5, left: -2 }}>
              PLACE
            </span>
          </Button>
          <Button unique="right" onClick={() => moveCard(+1)}>
            <span className="sr-only">Move card right</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
