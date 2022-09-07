export interface Deck {
  name: string;
  unit: string;
  cards: Card[];
}

export interface Card {
  text: string;
  value: number;
}

export interface RoomState {
  match: null | {
    gameMode: string;
    deck: Deck;
    placedCards: number[];
    correctFinalPositions: Map<number, number>;
    remainingCards: number[];
    nextCard: number;
    placeNextAfter: number;
    concluded: boolean;
  };
  deckOptions: string[];
  gameModeOptions: string[];
  playerIds: string[];
  scores: { [playerId: string]: number };
  playerNames: { [playerId: string]: string };
  currentPlayerId: string | null;
}