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
  numPlayers: number;
  deckOptions: string[];
  deck: Card[];
  placedCards: number[];
  correctFinalPositions: Map<number, number>;
  remainingCards: number[];
  nextCard: number;
  placeNextAfter: number;
  scores: {[playerId: string]: number};
}