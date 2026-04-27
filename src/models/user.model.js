// ============================================================
// User Model — Principals and Teachers
// ============================================================

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { ROLES } = require('../utils/constants');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' },
        len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Email already exists',
      },
      validate: {
        isEmail: { msg: 'Must be a valid email address' },
        notEmpty: { msg: 'Email cannot be empty' },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(ROLES.PRINCIPAL, ROLES.TEACHER),
      allowNull: false,
      defaultValue: ROLES.TEACHER,
      validate: {
        isIn: {
          args: [[ROLES.PRINCIPAL, ROLES.TEACHER]],
          msg: 'Role must be either principal or teacher',
        },
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hash password before creating user
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      // Hash password before updating if changed
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  }
);

/**
 * Validate a plaintext password against the stored hash.
 * @param {string} password - Plaintext password
 * @returns {Promise<boolean>}
 */
User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

/**
 * Return a sanitized user object (without password_hash).
 */
User.prototype.toSafeObject = function () {
  const { id, name, email, role, created_at, updated_at } = this.toJSON();
  return { id, name, email, role, created_at, updated_at };
};

module.exports = User;
