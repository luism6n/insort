"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("card_placement_stats", {
      card_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "cards",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      avg: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      num_samples: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("card_placement_stats");
  },
};
