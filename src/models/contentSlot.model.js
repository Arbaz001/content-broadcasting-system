// ============================================================
// ContentSlot Model — Subject-based content grouping
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentSlot = sequelize.define(
  'ContentSlot',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Subject slot already exists',
      },
      validate: {
        notEmpty: { msg: 'Subject cannot be empty' },
      },
    },
  },
  {
    tableName: 'content_slots',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Only track creation
  }
);

module.exports = ContentSlot;
