export interface Deck {
  name: string;
  unit: string;
  source: string;
  smallerIs: string;
  biggerIs: string;
  cards: Card[];
}

export interface Card {
  text: string;
  value: number;
}

export interface RoomState {
  match: null | {
    scores: { [playerId: string]: number };
    gameMode: string;
    teams: { [playerId: string]: string } | null;
    deck: Deck;
    placedCards: number[];
    correctFinalPositions: Map<number, number>;
    remainingCards: number[];
    nextCard: number;
    placeNextAfter: number;
    suspense: boolean;
    concluded: boolean;
  };
  deckOptions: string[];
  gameModeOptions: string[];
  playerIds: string[];
  scores: { [playerId: string]: number };
  playerNames: { [playerId: string]: string };
  currentPlayerId: string | null;
}
