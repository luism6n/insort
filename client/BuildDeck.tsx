import { nanoid } from "nanoid";
import React, { FormEvent, useState } from "react";
import { Card, Deck } from "../types/types";
import { Card as CardElement } from "./Card";
import { Input, Button, Toast, Title } from "./designSystem";
import { Overlay } from "./Overlay";
import { useToast } from "./useToast";
import { ev } from "./analytics";

export default function BuildDeck() {
  const [deck, setDeck] = useState<Deck>({
    name: "",
    // https://alex7kom.github.io/nano-nanoid-cc/?alphabet=_-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&size=10&speed=1&speedUnit=hour
    shortId: nanoid(10),
    unit: "",
    source: "",
    smallerMeans: "",
    biggerMeans: "",
    cards: [
      { id: null, text: "", value: 0 },
      { id: null, text: "", value: 0 },
    ],
    numFormatOptions: {},
    creatorCredit: "",
    creatorEmail: "",
  });

  const { toast, setToast } = useToast();
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  async function handleConfirmSubmit() {
    try {
      let res = await fetch("/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deck),
      });

      if (res.status === 200) {
        ev("submit deck");

        setToast({
          message: "Deck submitted for review!",
          type: "notification",
        });
        setDeck({
          name: "",
          // https://alex7kom.github.io/nano-nanoid-cc/?alphabet=_-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&size=10&speed=1&speedUnit=hour
          shortId: nanoid(10),
          unit: "",
          source: "",
          smallerMeans: "",
          biggerMeans: "",
          cards: [
            { id: null, text: "", value: 0 },
            { id: null, text: "", value: 0 },
          ],
          numFormatOptions: {},
          creatorCredit: "",
          creatorEmail: "",
        });
      } else if (res.status === 409) {
        ev("submit deck, error 409");

        setToast({
          message: (await res.json()).message,
          type: "notification",
        });
      } else {
        ev(`submit deck, error ${res.status}`);

        setToast({
          message: (await res.json()).message,
          type: "warning",
        });
      }
    } catch (e) {
      ev("submit deck, network error");

      console.error(e);
      setToast({
        message: "Error connecting to server",
        type: "warning",
      });
    }

    setShowConfirmSubmit(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    ev("attempt to submit deck");
    setShowConfirmSubmit(true);
  }

  function handleAddCard() {
    setDeck({
      ...deck,
      cards: [...deck.cards, { id: null, text: "", value: 0 }],
    });
  }

  function handleRemoveCard() {
    if (deck.cards.length === 2) {
      return;
    }
    setDeck({ ...deck, cards: deck.cards.slice(0, deck.cards.length - 1) });
  }

  function cardWithLongestName(cards: Card[]) {
    return cards.reduce(
      (longest, card) => {
        return card.text.length > longest.text.length ? card : longest;
      },
      { text: "", value: 0 }
    );
  }

  let sampleCard = cardWithLongestName(deck.cards);

  return (
    <div className="w-full max-w-xl overflow-y-scroll px-4 my-2">
      <Title>Submit a deck!</Title>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start justify-center gap-1"
      >
        <Input
          required
          label="Deck name"
          value={deck.name}
          placeholder="E.g., Cities by Population"
          setValue={(n: string) => {
            setDeck({ ...deck, name: n });
          }}
        />
        <Input
          required
          type="url"
          label="Source URL"
          value={deck.source}
          placeholder="E.g., https://en.wikipedia.org/List_of_cities_by_population"
          setValue={(n: string) => {
            setDeck({ ...deck, source: n });
          }}
        />

        <Input
          label="Unit (optional)"
          value={deck.unit}
          placeholder="E.g., residents, m/s, years, etc."
          setValue={(n: string) => {
            setDeck({ ...deck, unit: n });
          }}
        />

        <div className="flex w-full flex-between gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <Input
              maxLength={15}
              required
              label="Smaller means..."
              value={deck.smallerMeans}
              placeholder="E.g., less people, slower, older, etc."
              setValue={(n: string) => {
                setDeck({ ...deck, smallerMeans: n });
              }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Input
              maxLength={15}
              required
              label="Bigger means..."
              value={deck.biggerMeans}
              placeholder="E.g., more people, faster, younger, etc."
              setValue={(n: string) => {
                setDeck({ ...deck, biggerMeans: n });
              }}
            />
          </div>
        </div>
        {deck.cards.map((c, i) => {
          return (
            <div key={i} className="flex gap-4 w-full">
              <div className="flex-1 flex flex-col gap-1">
                <Input
                  required
                  label={`Card #${i + 1}`}
                  placeholder="E.g., Monaco"
                  value={c.text}
                  setValue={(t: string) =>
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
                <Input
                  required
                  label="Value"
                  type="number"
                  placeholder="E.g., 39244"
                  value={c.value}
                  setValue={(v: number) =>
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

        <div className="flex flex-wrap w-full justify-around">
          <Button onClick={handleAddCard}>Add card</Button>
          <Button onClick={handleRemoveCard}>Remove card</Button>
        </div>

        <div className="w-full flex flex-col items-center">
          <h4>Sample card</h4>

          <CardElement
            content={sampleCard.text}
            value={sampleCard.value}
            unit={deck.unit}
          />
        </div>

        <Input
          label="If you want to know when this deck is approved..."
          placeholder="Leave your e-mail"
          value={deck.creatorEmail}
          setValue={(e: string) => setDeck({ ...deck, creatorEmail: e })}
        />

        <div className="flex flex-col gap-2 w-full">
          <Input
            label="Credit me as..."
            placeholder="E.g., name, email, link to twitter, portfolio, etc."
            value={deck.creatorCredit}
            setValue={(c: string) => setDeck({ ...deck, creatorCredit: c })}
          />
        </div>

        <p className="text-sm">
          Notice: Your deck may be subject to changes by moderators before
          becoming public. It'll be checked for sources, typos and formatting to
          make it feel similar to other decks. Your email will never be public.
        </p>

        <div className="flex w-full justify-center">
          <Button type="submit">Submit deck</Button>
        </div>
      </form>

      <Overlay open={showConfirmSubmit} setOpen={setShowConfirmSubmit}>
        <p className="text-lg mb-4">Deck overview</p>
        <div className="text-left w-full">
          <p>Deck name: {deck.name}</p>
          <p>Unit: {deck.unit}</p>
          <p>Smaller means: {deck.smallerMeans}</p>
          <p>Bigger means: {deck.biggerMeans}</p>
          <p>Source: {deck.source}</p>
          <p>Cards: {deck.cards.length}</p>
          <p>Creator credit: {deck.creatorCredit}</p>
          <p>Creator email: {deck.creatorEmail}</p>
        </div>

        <div className="flex w-full justify-center mt-4">
          <Button onClick={handleConfirmSubmit}>Confirm submission</Button>
        </div>
      </Overlay>

      {toast}
    </div>
  );
}
