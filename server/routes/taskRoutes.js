const express = require('express');
const router = express.Router();
const { Task, Category } = require('../models');
const { Op } = require('sequelize');
const taskService = require('../services/taskService');
const { authenticateToken } = require('../middleware/auth');
const { validate, createTaskSchema, updateTaskSchema } = require('../middleware/validate');
const logger = require('../utils/logger');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      tag,
      date,
      from,
      to,
      sortBy = 'dueDate',
      sortOrder = 'ASC',
      page = 1,
      limit = 20,
      includeArchived = false,
      view,
      timezone = 'UTC',
    } = req.query;

    const where = { userId: req.user.id };
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    if (!includeArchived) where.archived = false;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }
    if (status) {
      where.status = Array.isArray(status) ? { [Op.in]: status } : status;
    }
    if (priority) {
      where.priority = Array.isArray(priority) ? { [Op.in]: priority } : priority;
    }
    if (category) {
      where.category = Array.isArray(category) ? { [Op.in]: category } : category;
    }
    if (tag) {
      where.tags = { [Op.contains]: Array.isArray(tag) ? tag : [tag] };
    }
    if (view === 'today') {
      const now = new Date();
      const todayLocal = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const todayStr = todayLocal.toISOString().split('T')[0];
      where.dueDate = todayStr;
    } else if (view === 'week') {
      const now = new Date();
      const todayLocal = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      todayLocal.setHours(0, 0, 0, 0);
      const end = new Date(todayLocal);
      end.setDate(end.getDate() + 7);
      where.dueDate = { [Op.between]: [
        todayLocal.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
      ] };
    } else if (view === 'upcoming') {
      const now = new Date();
      const todayLocal = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const todayStr = todayLocal.toISOString().split('T')[0];
      where.dueDate = { [Op.gte]: todayStr };
      where.status = { [Op.in]: ['pending', 'in_progress'] };
    } else if (view === 'overdue') {
      const now = new Date();
      const todayLocal = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const todayStr = todayLocal.toISOString().split('T')[0];
      where.dueDate = { [Op.lt]: todayStr };
      where.status = { [Op.in]: ['pending', 'in_progress'] };
    } else if (view === 'completed') {
      where.status = 'completed';
    }
    if (date) {
      where.dueDate = date;
    } else if (from || to) {
      where.dueDate = {};
      if (from) where.dueDate[Op.gte] = from;
      if (to) where.dueDate[Op.lte] = to;
    }

    const sortMap = {
      dueDate: ['dueDate', sortOrder],
      createdAt: ['createdAt', sortOrder],
      priority: ['priority', sortOrder],
      title: ['title', sortOrder],
      updatedAt: ['updatedAt', sortOrder],
    };

    const { count, rows } = await Task.findAndCountAll({
      where,
      order: [sortMap[sortBy] || sortMap.dueDate],
      offset: (pageNum - 1) * limitNum,
      limit: limitNum,
      include: [{ model: Category, as: 'categoryObj', required: false }],
    });

    res.json({
      tasks: rows,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await taskService.getStats(req.user.id);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/calendar', async (req, res) => {
  try {
    const { year, month } = req.query;
    const tasks = await taskService.getCalendarTasks(req.user.id, year, month);
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

router.patch('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }
    await taskService.reorderTasks(orderedIds, req.user.id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error reordering tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      where: { userId: req.user.id },
      include: [{ model: Category, as: 'categoryObj' }],
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    logger.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/', validate(createTaskSchema), async (req, res) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (error) {
    logger.error('Error creating task:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', validate(updateTaskSchema), async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    logger.error('Error updating task:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await taskService.updateStatus(req.params.id, status, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.patch('/:id/priority', async (req, res) => {
  try {
    const { priority } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }
    task.priority = priority;
    await task.save();
    res.json(task);
  } catch (error) {
    logger.error('Error updating priority:', error);
    res.status(500).json({ error: 'Failed to update priority' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await task.destroy();
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.patch('/:id/toggle-archive', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }
    task.archived = !task.archived;
    await task.save();
    res.json(task);
  } catch (error) {
    logger.error('Error toggling archive:', error);
    res.status(500).json({ error: 'Failed to toggle archive' });
  }
});

router.post('/:id/subtasks', async (req, res) => {
  try {
    const task = await taskService.addSubtask(req.params.id, req.body, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    logger.error('Error adding subtask:', error);
    res.status(500).json({ error: 'Failed to add subtask' });
  }
});

router.put('/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await taskService.updateSubtask(req.params.id, req.params.subtaskId, req.body, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    logger.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

router.delete('/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await taskService.deleteSubtask(req.params.id, req.params.subtaskId, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    logger.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

module.exports = router;
