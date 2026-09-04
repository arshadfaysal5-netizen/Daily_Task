require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const sequelize = require('./config/database');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const { Task } = require('./models');
const { Op } = require('sequelize');
const logger = require('./utils/logger');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.',
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ status: 'error', timestamp: new Date().toISOString(), database: 'disconnected' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

cron.schedule('0 0 * * *', async () => {
  logger.info('[Cron] Archiving old completed tasks...');
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    await Task.update(
      { archived: true },
      {
        where: {
          status: 'completed',
          completedAt: { [Op.lt]: cutoff },
        },
      }
    );
    logger.info('[Cron] Old completed tasks archived successfully.');
  } catch (error) {
    logger.error('[Cron] Failed to archive tasks:', error);
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    await sequelize.sync();
    logger.info('Database synchronized.');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });

    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await sequelize.close();
          logger.info('Database connection closed.');
        } catch (err) {
          logger.error('Error closing database connection:', err);
        }
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
