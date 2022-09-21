"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      CREATE TABLE feedbacks (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        message VARCHAR(1400) NOT NULL
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      DROP TABLE feedbacks;
    `);
  },
};
