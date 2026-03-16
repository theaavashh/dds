import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDirectory = path.join(process.cwd(), 'logs');

/**
 * Custom log levels
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

/**
 * Get level based on environment
 */
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'info';
};

/**
 * Custom colors for log levels
 */
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

/**
 * Log format
 */
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

/**
 * File log format (no colorization)
 */
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

/**
 * Transports
 */
const transports = [
    // Console transport
    new winston.transports.Console({
        format,
    }),
    // Error log file transport
    new winston.transports.DailyRotateFile({
        filename: path.join(logDirectory, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: fileFormat,
    }),
    // Combined log file transport
    new winston.transports.DailyRotateFile({
        filename: path.join(logDirectory, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
    }),
];

/**
 * Create the logger instance
 */
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

export default logger;
