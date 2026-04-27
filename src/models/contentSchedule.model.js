// ============================================================
// ContentSchedule Model — Rotation scheduling for content
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentSchedule = sequelize.define(
  'ContentSchedule',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'content',
        key: 'id',
      },
    },
    slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'content_slots',
        key: 'id',
      },
    },
    rotation_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order in which content is rotated within the slot',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: 'Duration in minutes for this content in rotation',
      validate: {
        min: { args: [1], msg: 'Duration must be at least 1 minute' },
      },
    },
  },
  {
    tableName: 'content_schedule',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

module.exports = ContentSchedule;
