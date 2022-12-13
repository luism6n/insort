import { DeckSelection } from "./DeckSelection";
import React from "react";
import { Title, Select, Button } from "./designSystem";
import { GameMode } from "../types/enums";
import slug from "slug";
import { ev } from "./analytics";

interface Props {
  playerId: string;
  admin: string;
  adminName: string;
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
  selectedGameMode: string;
  setSelectedGameMode: React.Dispatch<React.SetStateAction<string>>;
  newGame: (selectedDeck: string, selectedGameMode: string) => void;
  numPlayers: number;
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

export function RoomSettings(props: Props) {
  return (
    <div
      className="flex flex-col items-center w-full h-full"
      style={{ maxHeight: "calc(100% - 40px)" }}
    >
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
      <p className="text-sm text-center px-4">
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
        onClick={() => {
          ev(
            `start game, deck ${props.selectedDeck}, mode ${props.selectedGameMode}`
          );

          ev(`game started with ${props.numPlayers} players`);
          props.newGame(props.selectedDeck, props.selectedGameMode);
        }}
      >
        Play
      </Button>
    </div>
  );
}
