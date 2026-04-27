// ============================================================
// Content Model — Uploaded educational content
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { CONTENT_STATUS, SUBJECTS, DEFAULT_ROTATION_DURATION } = require('../utils/constants');

const Content = sequelize.define(
  'Content',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title cannot be empty' },
        len: { args: [2, 255], msg: 'Title must be between 2 and 255 characters' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Subject cannot be empty' },
        isIn: {
          args: [SUBJECTS],
          msg: `Subject must be one of: ${SUBJECTS.join(', ')}`,
        },
      },
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'File URL cannot be empty' },
      },
    },
    file_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'File size must be greater than 0' },
      },
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(
        CONTENT_STATUS.UPLOADED,
        CONTENT_STATUS.PENDING,
        CONTENT_STATUS.APPROVED,
        CONTENT_STATUS.REJECTED
      ),
      allowNull: false,
      defaultValue: CONTENT_STATUS.PENDING,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this content becomes visible. Null means not active.',
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this content stops being visible. Null means not active.',
    },
    rotation_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: DEFAULT_ROTATION_DURATION,
      comment: 'Rotation duration in minutes',
      validate: {
        min: { args: [1], msg: 'Rotation duration must be at least 1 minute' },
      },
    },
  },
  {
    tableName: 'content',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Content;
