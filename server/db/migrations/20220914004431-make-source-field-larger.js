"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      ALTER TABLE decks
      ADD COLUMN source VARCHAR(1024) NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      ALTER TABLE decks
      DROP COLUMN source;
    `);
  },
};
