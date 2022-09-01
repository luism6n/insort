export interface Deck {
  name: string;
  unit: string;
  cards: Card[];
}

export interface Card {
  text: string;
  value: number;
}

export interface GameState {
  match: null | {
    deck: Card[];
    placedCards: number[];
    correctFinalPositions: Map<number, number>;
    remainingCards: number[];
    nextCard: number;
    placeNextAfter: number;
    concluded: boolean;
  };
  deckOptions: string[];
  playerIds: string[];
  scores: { [playerId: string]: number };
}