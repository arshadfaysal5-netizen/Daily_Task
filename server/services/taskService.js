const { Task, Category } = require('../models');
const { Op, fn, col } = require('sequelize');

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

class TaskService {
  async createTask(data) {
    const task = await Task.create(data);
    return this.formatTask(task);
  }

  async getTask(id) {
    return this.formatTask(await Task.findByPk(id, {
      include: [{ model: Category, as: 'categoryObj' }],
    }));
  }

  async updateTask(id, data) {
    const task = await Task.findByPk(id);
    if (!task) return null;

    if (!data.category && data.categoryId) {
      const cat = await Category.findByPk(data.categoryId);
      if (cat) data.category = cat.name;
    }

    await task.update(data);
    return this.formatTask(task);
  }

  async updateStatus(id, status) {
    const task = await Task.findByPk(id);
    if (!task) return null;

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
      if (task.isRecurring) {
        await this.handleRecurrence(task);
      }
    } else {
      task.completedAt = null;
    }
    await task.save();
    return this.formatTask(task);
  }

  async handleRecurrence(task) {
    const pattern = task.recurringPattern;
    if (!pattern) return;

    const baseDate = new Date(task.dueDate || new Date());
    let nextDate;

    switch (pattern) {
      case 'daily':
        nextDate = new Date(baseDate);
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate = new Date(baseDate);
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate = new Date(baseDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate = new Date(baseDate);
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return;
    }

    const nextDueDate = nextDate.toISOString().split('T')[0];
    if (task.recurringEndDate && nextDueDate > task.recurringEndDate) return;

    await Task.create({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      dueDate: nextDueDate,
      dueTime: task.dueTime,
      isRecurring: true,
      recurringPattern: pattern,
      recurringEndDate: task.recurringEndDate,
      estimatedMinutes: task.estimatedMinutes,
      tags: task.tags,
      categoryId: task.categoryId,
    });
  }

  async reorderTasks(orderedIds) {
    for (let i = 0; i < orderedIds.length; i++) {
      await Task.update(
        { sortOrder: i },
        { where: { id: orderedIds[i] } }
      );
    }
  }

  async addSubtask(taskId, data) {
    const task = await Task.findByPk(taskId);
    if (!task) return null;

    const subtasks = task.subtasks || [];
    subtasks.push({
      id: require('crypto').randomUUID(),
      title: data.title || '',
      completed: false,
      createdAt: new Date(),
    });
    task.subtasks = subtasks;
    await task.save();
    return this.formatTask(task);
  }

  async updateSubtask(taskId, subtaskId, data) {
    const task = await Task.findByPk(taskId);
    if (!task) return null;

    const subtasks = (task.subtasks || []).map(st =>
      st.id === subtaskId ? { ...st, ...data } : st
    );
    task.subtasks = subtasks;
    await task.save();
    return this.formatTask(task);
  }

  async deleteSubtask(taskId, subtaskId) {
    const task = await Task.findByPk(taskId);
    if (!task) return null;

    task.subtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
    await task.save();
    return this.formatTask(task);
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const [
      total,
      completed,
      pending,
      inProgress,
      overdue,
      byPriority,
      byCategory,
      completedToday,
      completedThisWeek,
      averageCompletionTime,
      totalTimeSpent,
      recentCompletionTrend,
    ] = await Promise.all([
      Task.count({ where: { archived: false } }),
      Task.count({ where: { status: 'completed', archived: false } }),
      Task.count({ where: { status: 'pending', archived: false } }),
      Task.count({ where: { status: 'in_progress', archived: false } }),
      Task.count({
        where: {
          dueDate: { [Op.lt]: todayStr },
          status: { [Op.in]: ['pending', 'in_progress'] },
          archived: false,
        },
      }),
      Task.findAll({
        attributes: ['priority', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
        where: { archived: false },
        group: ['priority'],
        raw: true,
      }),
      Task.findAll({
        attributes: ['category', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
        where: { archived: false },
        group: ['category'],
        raw: true,
      }),
      Task.findAll({
        attributes: ['dueDate'],
        where: { completedAt: { [Op.gte]: today }, status: 'completed' },
        raw: true,
      }),
      Task.findAll({
        attributes: ['dueDate'],
        where: {
          completedAt: { [Op.gte]: startOfWeek },
          status: 'completed',
        },
        raw: true,
      }),
      Task.findAll({
        attributes: [
          'title',
          'createdAt',
          'completedAt',
        ],
        where: { status: 'completed', completedAt: { [Op.not]: null } },
        raw: true,
        limit: 100,
      }),
      Task.sum('actualMinutes', { where: { status: 'completed' } }),
      Task.findAll({
        attributes: [
          [fn('date_trunc', 'day', col('completed_at')), 'date'],
          [fn('COUNT', col('id')), 'count'],
        ],
        where: {
          status: 'completed',
          completedAt: { [Op.gte]: new Date(Date.now() - 30 * 86400000) },
        },
        group: [fn('date_trunc', 'day', col('completed_at'))],
        raw: true,
      }),
    ]);

    const completionTimes = averageCompletionTime
      .filter(t => t.createdAt && t.completedAt)
      .map(t => (new Date(t.completedAt) - new Date(t.createdAt)) / 3600000)
      .filter(t => t >= 0);

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      priorityBreakdown: byPriority,
      categoryBreakdown: byCategory,
      completedToday: completedToday.length,
      completedThisWeek: completedThisWeek.length,
      averageCompletionHours: completionTimes.length
        ? Math.round((completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length) * 10) / 10
        : 0,
      totalTimeSpentMinutes: totalTimeSpent || 0,
      trend: recentCompletionTrend,
    };
  }

  async getCalendarTasks(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const tasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.between]: [
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
          ],
        },
        archived: false,
      },
      raw: true,
    });
    return tasks;
  }

  formatTask(task) {
    if (!task) return null;
    const t = task.toJSON ? task.toJSON() : task;
    t.subtaskProgress = t.subtasks?.length
      ? Math.round(((t.subtasks.filter(s => s.completed).length) / t.subtasks.length) * 100)
      : 0;
    t.isOverdue = t.dueDate && t.status !== 'completed' &&
      new Date(t.dueDate) < new Date() - 86400000;
    return t;
  }
}

module.exports = new TaskService();
