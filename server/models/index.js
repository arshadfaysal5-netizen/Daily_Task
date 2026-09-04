const Task = require('./Task');
const Category = require('./Category');
const User = require('./User');

Task.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryObj' });
Category.hasMany(Task, { foreignKey: 'categoryId', as: 'tasks' });

User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { Task, Category, User };
