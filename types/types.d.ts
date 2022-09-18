export interface Deck {
  name: string;
  shortId: string;
  unit: string;
  source: string;
  smallerMeans: string;
  biggerMeans: string;
  cards: Card[];
  numFormatOptions?: Intl.NumberFormatOptions;
  creatorEmail?: string;
  creatorCredit?: string;
}

export interface Card {
  text: string;
  value: number;
}

export interface Match {
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
}

export interface RoomState {
  match: null | Match;
  playerIds: string[];
  scores: { [playerId: string]: number };
  playerNames: { [playerId: string]: string };
  currentPlayerId: string | null;
}
