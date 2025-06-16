"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./core/config/config");
const db_config_1 = require("./core/db/db-config");
const logger_1 = require("./core/logger/logger");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Эндпоинты
// Получение всех задач
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await db_config_1.pool.query('SELECT * FROM tasks');
        logger_1.logger.info('Fetched all tasks');
        res.json(result.rows);
    }
    catch (err) {
        logger_1.logger.error(`Error fetching tasks: ${err.message}`);
        res.status(500).send('Server error');
    }
});
// Получение всех пользователей
app.get('/api/users', async (req, res) => {
    try {
        const result = await db_config_1.pool.query('SELECT * FROM users');
        logger_1.logger.info('Fetched all users');
        res.json(result.rows);
    }
    catch (err) {
        logger_1.logger.error(`Error fetching users: ${err.message}`);
        res.status(500).send('Server error');
    }
});
// Получение всех групп
app.get('/api/groups', async (req, res) => {
    try {
        const result = await db_config_1.pool.query('SELECT * FROM groups');
        logger_1.logger.info('Fetched all groups');
        res.json(result.rows);
    }
    catch (err) {
        logger_1.logger.error(`Error fetching groups: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.listen(config_1.config.server.port, () => {
    logger_1.logger.info(`Server running on port ${config_1.config.server.port}`);
});
