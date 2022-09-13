import React, { useState } from "react";
import { Deck } from "../types/types";
import { TextInput, Button } from "./designSystem";

export default function BuildDeck() {
  const [deck, setDeck] = useState<Deck>({
    name: "",
    shortId: "",
    unit: "",
    source: "",
    smallerIs: "",
    biggerIs: "",
    cards: [{ text: "", value: 0 }],
    numFormatOptions: {},
  });

  function handleSubmit(e?: React.FormEvent) {
    if (e) {
      e.preventDefault();
    }

    console.log(deck);
  }

  function handleAddCard() {
    setDeck({ ...deck, cards: [...deck.cards, { text: "", value: 0 }] });
  }

  function handleRemoveCard() {
    setDeck({ ...deck, cards: deck.cards.slice(0, deck.cards.length - 1) });
  }

  return (
    <div className="w-full max-w-xl overflow-y-scroll p-4">
      <form
        className="flex flex-col items-center justify-center gap-1"
        onSubmit={handleSubmit}
      >
        <TextInput
          label="Deck name"
          input={deck.name}
          placeholder="E.g., Cities by Population"
          setInput={(n: string) => {
            setDeck({ ...deck, name: n });
          }}
        />
        <TextInput
          label="Source URL"
          input={deck.source}
          placeholder="E.g., https://en.wikipedia.org/List_of_cities_by_population"
          setInput={(n: string) => {
            setDeck({ ...deck, source: n });
          }}
        />

        <div className="flex gap-4 w-full">
          <div className="flex flex-col gap-1">
            <TextInput
              label="Unit"
              input={deck.unit}
              placeholder="E.g., M of people"
              setInput={(n: string) => {
                setDeck({ ...deck, unit: n });
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <TextInput
              maxLength={10}
              label="Short ID (max. 10 characters)"
              input={deck.shortId}
              placeholder="E.g., citiespop"
              setInput={(n: string) => {
                setDeck({ ...deck, shortId: n });
              }}
            />
          </div>
        </div>
        <div className="flex w-full flex-between gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <TextInput
              maxLength={15}
              label="Smaller means..."
              input={deck.smallerIs}
              placeholder="E.g., less people"
              setInput={(n: string) => {
                setDeck({ ...deck, smallerIs: n });
              }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <TextInput
              maxLength={15}
              label="Bigger means..."
              input={deck.biggerIs}
              placeholder="E.g., more people"
              setInput={(n: string) => {
                setDeck({ ...deck, biggerIs: n });
              }}
            />
          </div>
        </div>
        {deck.cards.map((c, i) => {
          return (
            <div key={i} className="flex gap-4 w-full">
              <div className="flex-1 flex flex-col gap-1">
                <TextInput
                  label={`Card #${i + 1}`}
                  placeholder="E.g., Monaco"
                  input={c.text}
                  setInput={(t: string) =>
                    setDeck({
                      ...deck,
                      cards: [
                        ...deck.cards.slice(0, i),
                        { ...c, text: t },
                        ...deck.cards.slice(i + 1),
                      ],
                    })
                  }
                />
              </div>
              <div style={{ flex: 0.5 }} className="flex flex-col gap-1">
                <TextInput
                  label="Value"
                  type="number"
                  placeholder="E.g., 39244"
                  input={c.value}
                  setInput={(v: number) =>
                    setDeck({
                      ...deck,
                      cards: [
                        ...deck.cards.slice(0, i),
                        { ...c, value: v },
                        ...deck.cards.slice(i + 1),
                      ],
                    })
                  }
                />
              </div>
            </div>
          );
        })}

        <div className="flex w-full justify-around">
          <Button onClick={handleAddCard}>Add card</Button>
          <Button onClick={handleRemoveCard}>Remove card</Button>
        </div>

        <Button type="submit" onClick={() => handleSubmit()}>
          Submit deck
        </Button>
      </form>
    </div>
  );
}
