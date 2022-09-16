import { DeckSelection } from "./DeckSelection";
import React from "react";
import { Title, Select, Button } from "./designSystem";

interface RoomSettingsProps {
  playerId: string;
  admin: string;
  adminName: string;
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
  gameModeOptions: string[];
  selectedGameMode: number;
  setSelectedGameMode: React.Dispatch<React.SetStateAction<number>>;
}

export function RoomSettings(props: RoomSettingsProps) {
  return (
    <div className="flex flex-col justify-center h-full">
      <Title>Deck</Title>
      <DeckSelection
        selectedDeck={props.selectedDeck}
        setSelectedDeck={props.setSelectedDeck}
      />
      <Title>Game Mode</Title>
      <Select
        selected={props.selectedGameMode}
        setSelected={props.setSelectedGameMode}
        options={props.gameModeOptions}
      ></Select>
      <div className="flex justify-center w-full text-sm">
        {props.playerId === props.admin ? (
          <p>Choose your match settings</p>
        ) : (
          <p className="text-center">
            {props.adminName} is choosing... <br /> You can only browse the
            options
          </p>
        )}
      </div>
    </div>
  );
}
