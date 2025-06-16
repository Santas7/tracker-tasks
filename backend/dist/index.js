"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./core/config/config");
const db_config_1 = require("./core/db/db-config");
const logger_1 = require("./core/logger/logger");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_session_1 = __importDefault(require("express-session"));
const db_1 = require("./core/db/db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    store: new db_1.PgSession({
        pool: db_config_1.pool,
        ttl: 24 * 60 * 60
    }),
    secret: config_1.config.jwt.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        //@ts-ignore
        req.user = user;
        next();
    });
};
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await db_config_1.pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, password]);
        logger_1.logger.info(`User registered: ${username}`);
        res.status(201).json({ id: result.rows[0].id, username, email });
    }
    catch (err) {
        logger_1.logger.error(`Error registering user: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db_config_1.pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, config_1.config.jwt.secret, { expiresIn: '1h' });
            //@ts-ignore
            req.session.userId = user.id;
            logger_1.logger.info(`User logged in: ${username}`);
            res.json({ token, user: { id: user.id, username: user.email } });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (err) {
        logger_1.logger.error(`Error logging in: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.get('/api/profile', authenticateJWT, async (req, res) => {
    try {
        //@ts-ignore
        const result = await db_config_1.pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user?.id]);
        //@ts-ignore
        logger_1.logger.info(`Profile fetched for user: ${req.user?.username}`);
        res.json(result.rows[0]);
    }
    catch (err) {
        logger_1.logger.error(`Error fetching profile: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.post('/api/tasks', authenticateJWT, async (req, res) => {
    const { title, description, skills, group_id, dt_start, dt_end, priority } = req.body;
    try {
        const result = await db_config_1.pool.query('INSERT INTO tasks (title, description, skills, group_id, dt_start, dt_end, priority) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, skills, group_id, dt_start, dt_end, priority]);
        //@ts-ignore
        logger_1.logger.info(`Task created by user: ${req.user?.username}`);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        logger_1.logger.error(`Error creating task: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.put('/api/tasks/:id/status', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await db_config_1.pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        if (result.rows.length > 0) {
            //@ts-ignore
            logger_1.logger.info(`Task ${id} status updated by user: ${req.user?.username}`);
            res.json(result.rows[0]);
        }
        else {
            res.status(404).json({ message: 'Task not found' });
        }
    }
    catch (err) {
        logger_1.logger.error(`Error updating task status: ${err.message}`);
        res.status(500).send('Server error');
    }
});
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
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(config_1.config.server.port, () => {
    logger_1.logger.info(`Server running on port ${config_1.config.server.port}`);
});
