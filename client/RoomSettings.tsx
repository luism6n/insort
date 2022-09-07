import React from "react";
import { Title, Select, Button } from "./designSystem";

interface RoomSettingsProps {
  deckOptions: string[];
  newGame: () => void;
  selectedDeck: number;
  setSelectedDeck: React.Dispatch<React.SetStateAction<number>>;
  gameModeOptions: string[];
  selectedGameMode: number;
  setSelectedGameMode: React.Dispatch<React.SetStateAction<number>>;
}

export function RoomSettings(props: RoomSettingsProps) {
  return (
    <div className="flex flex-col justify-center h-full">
      <Title>Choose Deck</Title>
      <Select
        selected={props.selectedDeck}
        setSelected={props.setSelectedDeck}
        options={props.deckOptions}
      ></Select>
      <Title>Choose Game Mode</Title>
      <Select
        selected={props.selectedGameMode}
        setSelected={props.setSelectedGameMode}
        options={props.gameModeOptions}
      ></Select>
      <Button onClick={props.newGame}>Play</Button>
    </div>
  );
}