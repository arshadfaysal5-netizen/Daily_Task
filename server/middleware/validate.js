const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringEndDate: z.string().optional(),
  estimatedMinutes: z.number().min(0).optional(),
  notes: z.string().optional(),
  categoryId: z.string().uuid().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringEndDate: z.string().optional(),
  estimatedMinutes: z.number().min(0).optional(),
  notes: z.string().optional(),
  categoryId: z.string().uuid().optional(),
}).passthrough();

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  icon: z.string().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be 50 characters or less'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    req.body = result.data;
    next();
  };
}

module.exports = {
  validate,
  createTaskSchema,
  updateTaskSchema,
  createCategorySchema,
  registerSchema,
  loginSchema,
};
