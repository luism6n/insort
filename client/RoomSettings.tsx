import { DeckSelection } from "./DeckSelection";
import React from "react";
import { Title, Select, Button } from "./designSystem";
import { GameMode } from "../types/enums";
import slug from "slug";
import { admin } from "./Room";

interface RoomSettingsProps {
  playerId: string;
  admin: string;
  adminName: string;
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
  selectedGameMode: string;
  setSelectedGameMode: React.Dispatch<React.SetStateAction<string>>;
  newGame: (selectedDeck: string, selectedGameMode: string) => void;
}

function explainGameMode(gameMode: string): string {
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
      <Title>Choose Deck</Title>
      <DeckSelection
        selectedDeck={props.selectedDeck}
        setSelectedDeck={props.setSelectedDeck}
      />
      <Title>Choose Game Mode</Title>
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

      <Button
        disabled={props.playerId !== props.admin}
        trackEventCls={`umami--click--play-deck-${slug(
          props.selectedDeck
        )}-mode-${slug(props.selectedGameMode)}`}
        onClick={() =>
          props.newGame(props.selectedDeck, props.selectedGameMode)
        }
      >
        Play
      </Button>
    </div>
  );
}
