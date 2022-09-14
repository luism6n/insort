"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      CREATE TABLE decks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        short_id VARCHAR(255) NOT NULL,
        unit VARCHAR(255) NOT NULL,
        smaller_means VARCHAR(255) NOT NULL,
        bigger_means VARCHAR(255) NOT NULL,
        num_format_options JSON NOT NULL,
        creator_email VARCHAR(255) DEFAULT NULL,
        creator_credit VARCHAR(255) DEFAULT NULL,
        num_likes INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        approved_at TIMESTAMP DEFAULT NULL
      );

      ALTER TABLE decks ADD CONSTRAINT shortIdIsUnique UNIQUE (short_id);

      CREATE TABLE cards (
        id SERIAL PRIMARY KEY,
        deck_id INTEGER NOT NULL REFERENCES decks(id),
        text VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        value_type VARCHAR(255) NOT NULL
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      DROP TABLE cards;
      DROP TABLE decks;
    `);
  },
};
