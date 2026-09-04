require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const logger = require('../utils/logger');

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres',
  });

  try {
    await client.connect();
    const dbName = process.env.DB_NAME || 'daily_taskbook';

    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error(`Invalid database name: "${dbName}". Only alphanumeric characters and underscores are allowed.`);
    }

    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      logger.info(`Database '${dbName}' created successfully!`);
    } else {
      logger.info(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    logger.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
