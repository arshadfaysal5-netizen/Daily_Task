const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? format.combine(format.colorize(), format.simple())
        : format.json(),
    }),
    new transports.File({
      filename: path.join(__dirname, '..', 'logs', 'error.log'),
      level: 'error',
    }),
  ],
});

module.exports = logger;
