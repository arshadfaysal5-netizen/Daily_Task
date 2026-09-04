const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true, len: [1, 50] },
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6366f1',
    validate: { is: /^#[0-9A-Fa-f]{6}$/ },
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'folder',
  },
}, {
  tableName: 'categories',
});

module.exports = Category;
