import { CardPlacementStats } from "./../types/types.d";
import { Client } from "pg";
import { UniqueConstraintError } from "sequelize";
import { Card, Deck, DeckOptionsJSON, FeedbackJSON } from "../types/types";

export class DBServerError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DBServerError.prototype);
  }
}

export class DBUniqueConstraintError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DBUniqueConstraintError.prototype);
  }
}

export function createClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.ENVIRONMENT === "development"
        ? false
        : {
            rejectUnauthorized: false,
          },
  });
}

export async function insertCard(db: any, deckId: string, card: Card) {
  await db.query(
    `
        INSERT INTO cards (deck_id, text, value, value_type)
        VALUES ($1, $2, $3, $4);
      `,
    [
      deckId,
      card.text,
      card.value,
      Number.isInteger(card.value) ? "int" : "float",
    ]
  );
}
export async function insertDeckWithoutCards(
  db: any,
  deck: Deck
): Promise<any> {
  return (
    await db.query(
      `
      INSERT INTO decks (name, short_id, unit, source, smaller_means, bigger_means, num_format_options, creator_email, creator_credit)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `,
      [
        deck.name,
        deck.shortId,
        deck.unit,
        deck.source,
        deck.smallerMeans,
        deck.biggerMeans,
        JSON.stringify(deck.numFormatOptions),
        deck.creatorEmail,
        deck.creatorCredit,
      ]
    )
  ).rows[0].id;
}

export async function retreiveDeckOptions(): Promise<DeckOptionsJSON[]> {
  let db = createClient();
  db.connect();
  let result;
  try {
    result = await db.query(
      "SELECT name, short_id, num_likes, approved_at FROM decks" +
        (process.env.ENVIRONMENT === "development"
          ? ""
          : " WHERE approved_at IS NOT NULL")
    );
  } catch (e) {
    console.error(e);
    return [];
  }

  return result.rows.map((r) => ({
    name: r.name,
    shortId: r.short_id,
    likes: r.num_likes,
    createdAt: r.approved_at,
  }));
}

export async function retrieveDeckByShortId(shortId: string): Promise<Deck> {
  let db = createClient();
  db.connect();
  let row;
  let rows;
  try {
    rows = (
      await db.query(
        "SELECT * FROM decks WHERE short_id = $1" +
          (process.env.ENVIRONMENT === "development"
            ? ""
            : " AND approved_at IS NOT NULL"),
        [shortId]
      )
    ).rows;
  } catch (e) {
    console.error(e);
    throw new DBServerError("Error retrieving deck");
  }

  if (rows.length === 0) {
    return null;
  }

  row = rows[0];

  console.log({ rows, shortId });
  let deck: Deck = {
    name: row.name,
    shortId: row.short_id,
    unit: row.unit,
    source: row.source,
    smallerMeans: row.smaller_means,
    biggerMeans: row.bigger_means,
    numFormatOptions: row.num_format_options,
    creatorEmail: row.creator_email,
    creatorCredit: row.creator_credit,
    cards: [],
  };

  for (let dbCard of (
    await db.query("SELECT * FROM cards WHERE deck_id = $1", [row.id])
  ).rows) {
    let card = {
      id: dbCard.id,
      text: dbCard.text,
      value:
        dbCard.value_type === "int"
          ? parseInt(dbCard.value)
          : parseFloat(dbCard.value),
    };
    deck.cards.push(card);
  }

  return deck;
}

export async function insertDeck(deck: Deck) {
  let db = createClient();
  db.connect();
  await db.query("BEGIN");
  try {
    const deckId = await insertDeckWithoutCards(db, deck);

    for (let card of deck.cards) {
      await insertCard(db, deckId, card);
    }

    await db.query("COMMIT");
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      throw new DBUniqueConstraintError("Deck already saved");
    } else {
      throw new DBServerError("Error saving deck");
    }
  } finally {
    db.end();
  }
}

export async function incrementDeckLikeCount(shortId: string) {
  let db = createClient();
  db.connect();
  await db.query(
    "UPDATE decks SET num_likes = num_likes + 1 WHERE short_id = $1",
    [shortId]
  );
  db.end();
}

export async function insertFeedback(feedback: FeedbackJSON) {
  let db = createClient();
  db.connect();
  await db.query("INSERT INTO feedbacks (email, message) VALUES ($1, $2)", [
    feedback.email,
    feedback.message,
  ]);
  db.end();
}

export async function getLastCardPlacementStats(
  cardId: number
): Promise<CardPlacementStats> {
  let db = createClient();
  db.connect();
  let result = await db.query(
    "SELECT * FROM card_placement_stats WHERE card_id = $1",
    [cardId]
  );

  if (result.rows.length === 0) {
    await db.query(
      "INSERT INTO card_placement_stats (card_id, num_samples, avg) VALUES ($1, 0, 0)",
      [cardId]
    );
  }

  db.end();

  if (result.rows.length === 0) {
    return {
      cardId,
      numSamples: 0,
      avg: null,
    };
  }

  return {
    cardId: result.rows[0].card_id,
    numSamples: result.rows[0].num_samples,
    avg: result.rows[0].avg,
  };
}

export async function updateCardPlacementStats(stats: CardPlacementStats) {
  let db = createClient();
  db.connect();
  await db.query(
    "UPDATE card_placement_stats SET num_samples = $1, avg = $2 WHERE card_id = $3",
    [stats.numSamples, stats.avg, stats.cardId]
  );
  db.end();
}
