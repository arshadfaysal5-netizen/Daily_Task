const Task = require('./Task');
const Category = require('./Category');

Task.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryObj' });
Category.hasMany(Task, { foreignKey: 'categoryId', as: 'tasks' });

module.exports = { Task, Category };
