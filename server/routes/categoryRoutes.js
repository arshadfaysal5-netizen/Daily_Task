const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validate, createCategorySchema } = require('../middleware/validate');
const logger = require('../utils/logger');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', validate(createCategorySchema), async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.create({ name, color, icon });
    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    logger.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', validate(createCategorySchema), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const allowedFields = ['name', 'color', 'icon'];
    const safeData = {};
    for (const key of allowedFields) {
      if (key in req.body) {
        safeData[key] = req.body[key];
      }
    }

    await category.update(safeData);
    res.json(category);
  } catch (error) {
    logger.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
