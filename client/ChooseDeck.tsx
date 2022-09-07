import React from "react";
import { Title, Select, Button } from "./designSystem";

interface ChooseDeckProps {
  deckOptions: string[];
  newGame: () => void;
  selectedDeck: number;
  setSelectedDeck: React.Dispatch<React.SetStateAction<number>>;
}

export function ChooseDeck(props: ChooseDeckProps) {
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
