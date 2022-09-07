import React, { Fragment, useState } from "react";
import { RoomState } from "../types/types";
import { Button } from "./designSystem";
import { getDivDimensions, getRefYDistance } from "./htmlMeasuring";
import { Card } from "./Room";

export function Match(props: {
  roomId: string;
  changeNextCardPosition: (increment: number) => void;
  placeCard: () => void;
  newGame: (selectedDeck: number) => void;
  selectedDeck: number;
  chooseNewDeck: () => void;
  playerId: string;
  roomState: RoomState;
}) {
  const [placedCardsArea, setPlacedCardsArea] = useState<HTMLElement | null>(
    null
  );
  const [virtualReferenceCard, setVirtualReferenceCard] =
    useState<HTMLElement | null>(null);
  const [nextCard, setNextCard] = useState<HTMLDivElement | null>(null);

  let padding = 10;
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
    <div className="h-full flex flex-col justify-start">
      <p>
        You're in room {props.roomId} (players:{" "}
        {props.roomState.playerIds.length})
      </p>
      <section
        ref={(r) => setPlacedCardsArea(r)}
        className="flex justify-center align-center mt-5"
        style={{
          height: cardDimensions[1] + padding,
        }}
      >
        <div
          style={{
            position: "relative",
            height: cardDimensions[1] + padding,
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
              (i - props.roomState.match.placeNextAfter - 1) *
                (cardDimensions[0] + padding) +
              padding / 2;
            let y = 0 + padding / 4;
            return (
              <Card
                key={card.text}
                unit={props.roomState.match.deck.unit}
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
          <Button onClick={() => props.changeNextCardPosition(-1)}>
            {"<"}
          </Button>
          <Button
            disabled={props.roomState.match.concluded}
            onClick={() => props.placeCard()}
          >
            Place
          </Button>
          <Button onClick={() => props.changeNextCardPosition(+1)}>
            {">"}
          </Button>
        </div>
      </div>
      {!props.roomState.match.concluded && (
        <div className="flex flex-col items-center w-full">
          <div ref={(r) => setNextCard(r)}>
            <Card
              content={
                props.roomState.match.deck.cards[props.roomState.match.nextCard]
                  .text
              }
              unit={props.roomState.match.deck.unit}
              value={"??"}
              zIndex={-1}
            />
          </div>
        </div>
      )}
      {props.roomState.match.concluded ? (
        <Fragment>
          <Button onClick={() => props.newGame(props.selectedDeck)}>
            Again
          </Button>
          <Button onClick={() => props.chooseNewDeck()}>New Deck</Button>
        </Fragment>
      ) : (
        <Fragment>
          <h3>Cards to sort:</h3>
          <ul>
            {props.roomState.match.remainingCards.map((i) => {
              let card = props.roomState.match.deck.cards[i];
              return (
                <li
                  key={i}
                  style={{
                    textDecoration:
                      i === props.roomState.match.nextCard
                        ? "underline"
                        : "none",
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
