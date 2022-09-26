"use strict";

const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    // insert 100 decks, each with 2 cards, using faker
    const decks = [];
    const cards = [];
    for (let i = 0; i < 100; i++) {
      const deck = {
        name: faker.word.noun(),
        source: faker.internet.url(),
        short_id: faker.datatype.uuid(),
        unit: faker.word.noun(),
        smaller_means: faker.word.noun(),
        bigger_means: faker.word.noun(),
        num_format_options: JSON.stringify({}),
        creator_email: faker.internet.email(),
        creator_credit: faker.word.noun(),
        num_likes: faker.datatype.number(100),
        created_at: faker.date.past().toISOString(),
        approved_at: null,
      };

      // insert deck, get id for cards
      const rows = await queryInterface.sequelize.query(
        `INSERT INTO decks (name, source, short_id, unit, smaller_means, bigger_means, num_format_options, creator_email, creator_credit, num_likes, created_at)
           VALUES ('${deck.name}', '${deck.source}', '${deck.short_id}', '${deck.unit}', '${deck.smaller_means}', '${deck.bigger_means}', '${deck.num_format_options}', '${deck.creator_email}', '${deck.creator_credit}', ${deck.num_likes}, '${deck.created_at}')
           RETURNING *;`
      );
      const deckId = rows[0][0].id;

      for (let j = 0; j < 2; j++) {
        const card = {
          deck_id: deckId,
          text: faker.word.noun(),
          value: faker.datatype.number(10),
          value_type: "float",
        };

        // insert cards
        await queryInterface.sequelize.query(
          `INSERT INTO cards (deck_id, text, value, value_type) VALUES (${card.deck_id}, '${card.text}', ${card.value}, '${card.value_type}');`
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
