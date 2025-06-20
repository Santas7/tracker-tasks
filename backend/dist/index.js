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
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
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
app.get('/api/tasks', authenticateJWT, async (req, res) => {
    const { user_id, group_id } = req.query;
    try {
        let query = 'SELECT * FROM tasks';
        const params = [];
        if (user_id || group_id) {
            query += ' WHERE';
            if (user_id) {
                query += ' EXISTS (SELECT 1 FROM task_users WHERE task_id = tasks.id AND user_id = $1)';
                params.push(user_id);
            }
            if (group_id) {
                query += user_id ? ' AND group_id = $2' : ' group_id = $1';
                params.push(group_id);
            }
        }
        const result = await db_config_1.pool.query(query, params);
        logger_1.logger.info(`Fetched tasks for user_id: ${user_id || 'all'}`);
        res.json(result.rows);
    }
    catch (err) {
        logger_1.logger.error(`Error fetching tasks: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.post('/api/tasks', authenticateJWT, async (req, res) => {
    let { title, description, skills, group_id, dt_start, dt_end, priority, status, user_ids } = req.body;
    const m = {
        'Низкий': 'low',
        'Средний': 'medium',
        'Высокий': 'high'
    };
    const s = {
        'Новая': 'new',
        'В работе': 'in_progress',
        'Завершена': 'completed'
    };
    priority = m[priority];
    status = s[status];
    try {
        const skillsArray = skills ? skills.split(',').map((s) => s.trim()).filter((s) => s) : null;
        const skillsValue = skillsArray ? `{${skillsArray.join(',')}}` : null;
        const result = await db_config_1.pool.query('INSERT INTO tasks (title, description, skills, group_id, dt_start, dt_end, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [title, description, skillsValue, group_id, dt_start || null, dt_end || null, priority, status]);
        const task = result.rows[0];
        const userIds = Array.isArray(user_ids) ? user_ids : [req.user?.id];
        for (const user_id of userIds) {
            await db_config_1.pool.query('INSERT INTO task_users (task_id, user_id) VALUES ($1, $2)', [task.id, user_id]);
        }
        logger_1.logger.info(`Task created by user: ${req.user?.username}`);
        res.status(201).json(task);
    }
    catch (err) {
        logger_1.logger.error(`Error creating task: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.put('/api/tasks/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    let { title, description, skills, group_id, dt_start, dt_end, priority, status } = req.body;
    const m = {
        'Низкий': 'low',
        'Средний': 'medium',
        'Высокий': 'high'
    };
    const s = {
        'Новая': 'new',
        'В работе': 'in_progress',
        'Завершена': 'completed'
    };
    priority = m[priority];
    status = s[status];
    try {
        const skillsArray = skills ? skills.split(',').map((s) => s.trim()).filter((s) => s) : null;
        const skillsValue = skillsArray ? `{${skillsArray.join(',')}}` : null;
        const result = await db_config_1.pool.query('UPDATE tasks SET title = $1, description = $2, skills = $3, group_id = $4, dt_start = $5, dt_end = $6, priority = $7, status = $8 WHERE id = $9 RETURNING *', [title, description, skillsValue, group_id, dt_start || null, dt_end || null, priority, status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        logger_1.logger.info(`Task ${id} updated by user: ${req.user?.username}`);
        res.json(result.rows[0]);
    }
    catch (err) {
        logger_1.logger.error(`Error updating task: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.put('/api/tasks/:id/status', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    let { status } = req.body;
    const s = {
        'Новая': 'new',
        'В работе': 'in_progress',
        'Завершена': 'completed'
    };
    status = s[status];
    try {
        const result = await db_config_1.pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        logger_1.logger.info(`Task ${id} status updated to ${status}`);
        res.json(result.rows[0]);
    }
    catch (err) {
        logger_1.logger.error(`Error updating task status: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.delete('/api/tasks/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        await db_config_1.pool.query('DELETE FROM task_users WHERE task_id = $1', [id]);
        const result = await db_config_1.pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        logger_1.logger.info(`Task ${id} deleted by user: ${req.user?.username}`);
        res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error(`Error deleting task: ${err.message}`);
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
app.post('/api/groups', authenticateJWT, async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await db_config_1.pool.query('INSERT INTO groups (name, description, admin_user_id) VALUES ($1, $2, $3) RETURNING *', [name, description, req.user?.id]);
        const group = result.rows[0];
        await db_config_1.pool.query('INSERT INTO group_users (group_id, user_id) VALUES ($1, $2)', [group.id, req.user?.id]);
        logger_1.logger.info(`Group created by user: ${req.user?.username}`);
        res.status(201).json(group);
    }
    catch (err) {
        logger_1.logger.error(`Error creating group: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.patch('/api/groups/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const check = await db_config_1.pool.query('SELECT admin_user_id FROM groups WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (check.rows[0].admin_user_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to edit this group' });
        }
        const result = await db_config_1.pool.query('UPDATE groups SET name = $1, description = $2 WHERE id = $3 RETURNING *', [name, description, id]);
        logger_1.logger.info(`Group ${id} updated by user: ${req.user?.username}`);
        res.json(result.rows[0]);
    }
    catch (err) {
        logger_1.logger.error(`Error updating group: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.delete('/api/groups/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const check = await db_config_1.pool.query('SELECT admin_user_id FROM groups WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (check.rows[0].admin_user_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to delete this group' });
        }
        await db_config_1.pool.query('DELETE FROM group_users WHERE group_id = $1', [id]);
        await db_config_1.pool.query('DELETE FROM task_users WHERE task_id IN (SELECT id FROM tasks WHERE group_id = $1)', [id]);
        await db_config_1.pool.query('DELETE FROM tasks WHERE group_id = $1', [id]);
        await db_config_1.pool.query('DELETE FROM groups WHERE id = $1', [id]);
        logger_1.logger.info(`Group ${id} deleted by user: ${req.user?.username}`);
        res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error(`Error deleting group: ${err.message}`);
        res.status(500).send('Server error');
    }
});
app.listen(config_1.config.server.port, () => {
    logger_1.logger.info(`Server running on port ${config_1.config.server.port}`);
});
