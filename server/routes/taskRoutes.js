const express = require('express');
const router = express.Router();
const { Task, Category } = require('../models');
const { Op } = require('sequelize');
const taskService = require('../services/taskService');

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

    const where = {};
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
      where.dueDate = new Date().toISOString().split('T')[0];
    } else if (view === 'week') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      where.dueDate = { [Op.between]: [start, end] };
    } else if (view === 'upcoming') {
      where.dueDate = { [Op.gte]: new Date() };
      where.status = { [Op.in]: ['pending', 'in_progress'] };
    } else if (view === 'overdue') {
      where.dueDate = { [Op.lt]: new Date() };
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
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await taskService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/calendar', async (req, res) => {
  try {
    const { year, month } = req.query;
    const tasks = await taskService.getCalendarTasks(year, month);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Category, as: 'categoryObj' }],
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/', async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await taskService.updateStatus(req.params.id, status);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.patch('/:id/priority', async (req, res) => {
  try {
    const { priority } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.priority = priority;
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ error: 'Failed to update priority' });
  }
});

router.patch('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }
    await taskService.reorderTasks(orderedIds);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.post('/:id/toggle-archive', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.archived = !task.archived;
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error toggling archive:', error);
    res.status(500).json({ error: 'Failed to toggle archive' });
  }
});

router.post('/:id/subtasks', async (req, res) => {
  try {
    const task = await taskService.addSubtask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error adding subtask:', error);
    res.status(500).json({ error: 'Failed to add subtask' });
  }
});

router.put('/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await taskService.updateSubtask(req.params.id, req.params.subtaskId, req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

router.delete('/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await taskService.deleteSubtask(req.params.id, req.params.subtaskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

module.exports = router;
