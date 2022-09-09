import React, { Fragment, useEffect, useState, useRef } from "react";
import { Button } from "./designSystem";
import { getDivDimensions, getRefYDistance } from "./htmlMeasuring";
import { Card } from "./Card";

export function CardsDemo() {
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

  let paddingX = 20;
  let paddingY = 40;

  return (
    <Fragment>
      <div ref={placedCardsArea} className="flex justify-center align-center">
        <div
          style={{
            position: "relative",
            height: cardDimensions[1] + paddingY,
            width: 0,
          }}
        >
          {cards.map((num, i) => {
            let x =
              (i - placeNextAfter) * (cardDimensions[0] + paddingX / 2) +
              paddingX / 4;
            let y = 0 + paddingY / 2;
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
                zIndex={2}
                unit="units"
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <p>^</p>
        <div ref={nextCard}>
          <Card unit="unit" content={cards.length} value={10} zIndex={1} />
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
