import { DeckSelection } from "./DeckSelection";
import React from "react";
import { Title, Select, Button } from "./designSystem";
import { GameMode } from "../types/enums";

interface RoomSettingsProps {
  playerId: string;
  admin: string;
  adminName: string;
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
  selectedGameMode: string;
  setSelectedGameMode: React.Dispatch<React.SetStateAction<string>>;
}

function explainGameMode(gameMode: GameMode): string {
  switch (gameMode) {
    case GameMode.Individual:
      return "players take turns and score individually";
    case GameMode.Teams:
      return "players take turns and score as a team";
    case GameMode.Coop:
      return "anyone can play at any time, scores are combined";
  }
}

export function RoomSettings(props: RoomSettingsProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-1/2">
        <Title>Deck</Title>
      </div>
      <DeckSelection
        selectedDeck={props.selectedDeck}
        setSelectedDeck={props.setSelectedDeck}
      />
      <div className="w-1/2">
        <Title>Game Mode</Title>
        <Select
          selected={props.selectedGameMode}
          setSelected={props.setSelectedGameMode}
          options={Object.values(GameMode)}
        ></Select>
        <p className="text-sm">
          {props.selectedGameMode}: {explainGameMode(props.selectedGameMode)}
        </p>
        <div className="flex justify-center w-full text-sm mt-6">
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
    </div>
  );
}
