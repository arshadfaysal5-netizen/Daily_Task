const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 200] },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'general',
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dueTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurringPattern: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    allowNull: true,
  },
  recurringEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  estimatedMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0 },
  },
  actualMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0 },
  },
  subtasks: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'tasks',
  indexes: [
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['category'] },
    { fields: ['due_date'] },
    { fields: ['created_at'] },
    { fields: ['archived'] },
    { fields: ['userId'] },
  ],
});

module.exports = Task;
