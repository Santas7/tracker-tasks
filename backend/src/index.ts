import express, { Express, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './core/config/config';
import { swaggerDocument } from './core/swagger-doc/swagger-doc';
import { pool } from './core/db/db-config';
import { logger } from './core/logger/logger';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import { PgSession } from './core/db/db';
import cors from 'cors';

const app: Express = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use(express.json());

app.use(session({
  store: new PgSession({
    pool: pool,
    ttl: 24 * 60 * 60 
  }),
  secret: config.jwt.secret, 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    //@ts-ignore
    req.user = user as { id: number; username: string };
    next();
  });
};

app.post('/api/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, password]
    );
    logger.info(`User registered: ${username}`);
    res.status(201).json({ id: result.rows[0].id, username, email });
  } catch (err: any) {
    logger.error(`Error registering user: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, username: user.username }, config.jwt.secret, { expiresIn: '1h' });
      //@ts-ignore
      req.session.userId = user.id; 
      logger.info(`User logged in: ${username}`);
      res.json({ token, user: { id: user.id, username: user.email } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err: any) {
    logger.error(`Error logging in: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.get('/api/profile', authenticateJWT, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user?.id]);
    //@ts-ignore
    logger.info(`Profile fetched for user: ${req.user?.username}`);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error fetching profile: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.get('/api/tasks', authenticateJWT, async (req: Request, res: Response) => {
  const { user_id, group_id } = req.query;
  try {
    let query = 'SELECT * FROM tasks';
    const params: any[] = [];
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
    const result = await pool.query(query, params);
    logger.info(`Fetched tasks for user_id: ${user_id || 'all'}`);
    res.json(result.rows);
  } catch (err: any) {
    logger.error(`Error fetching tasks: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.post('/api/tasks', authenticateJWT, async (req: Request, res: Response) => {
  let { title, description, skills, group_id, dt_start, dt_end, priority, status, user_ids } = req.body;
  const m = {
    'Низкий': 'low',
    'Средний': 'medium',
    'Высокий': 'high'
  }
  const s = {
    'Новая': 'new',
    'В работе': 'in_progress',
    'Завершена': 'completed'
  }
  priority = m[priority];
  status = s[status];
  try {
    const skillsArray = skills ? skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : null;
    const skillsValue = skillsArray ? `{${skillsArray.join(',')}}` : null;
    const result = await pool.query(
      'INSERT INTO tasks (title, description, skills, group_id, dt_start, dt_end, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, skillsValue, group_id, dt_start || null, dt_end || null, priority, status]
    );
    const task = result.rows[0];
    const userIds = Array.isArray(user_ids) ? user_ids : [req.user?.id];
    for (const user_id of userIds) {
      await pool.query('INSERT INTO task_users (task_id, user_id) VALUES ($1, $2)', [task.id, user_id]);
    }
    logger.info(`Task created by user: ${req.user?.username}`);
    res.status(201).json(task);
  } catch (err: any) {
    logger.error(`Error creating task: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.put('/api/tasks/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  let { title, description, skills, group_id, dt_start, dt_end, priority, status } = req.body;
  const m = {
    'Низкий': 'low',
    'Средний': 'medium',
    'Высокий': 'high'
  }
  const s = {
    'Новая': 'new',
    'В работе': 'in_progress',
    'Завершена': 'completed'
  }
  priority = m[priority];
  status = s[status];
  try {
    const skillsArray = skills ? skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : null;
    const skillsValue = skillsArray ? `{${skillsArray.join(',')}}` : null;
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, skills = $3, group_id = $4, dt_start = $5, dt_end = $6, priority = $7, status = $8 WHERE id = $9 RETURNING *',
      [title, description, skillsValue, group_id, dt_start || null, dt_end || null, priority, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    logger.info(`Task ${id} updated by user: ${req.user?.username}`);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error updating task: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.put('/api/tasks/:id/status', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  let { status } = req.body;
  
  const s = {
    'Новая': 'new',
    'В работе': 'in_progress',
    'Завершена': 'completed'
  }
  
  status = s[status];
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    logger.info(`Task ${id} status updated to ${status}`);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error updating task status: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.delete('/api/tasks/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM task_users WHERE task_id = $1', [id]);
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    logger.info(`Task ${id} deleted by user: ${req.user?.username}`);
    res.status(204).send();
  } catch (err: any) {
    logger.error(`Error deleting task: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    logger.info('Fetched all users');
    res.json(result.rows);
  } catch (err: any) {
    logger.error(`Error fetching users: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.get('/api/groups', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM groups');
    logger.info('Fetched all groups');
    res.json(result.rows);
  } catch (err: any) {
    logger.error(`Error fetching groups: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.post('/api/groups', authenticateJWT, async (req: Request, res: Response) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO groups (name, description, admin_user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user?.id]
    );
    const group = result.rows[0];
    await pool.query('INSERT INTO group_users (group_id, user_id) VALUES ($1, $2)', [group.id, req.user?.id]);
    logger.info(`Group created by user: ${req.user?.username}`);
    res.status(201).json(group);
  } catch (err: any) {
    logger.error(`Error creating group: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.patch('/api/groups/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const check = await pool.query('SELECT admin_user_id FROM groups WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (check.rows[0].admin_user_id !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to edit this group' });
    }
    const result = await pool.query(
      'UPDATE groups SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    logger.info(`Group ${id} updated by user: ${req.user?.username}`);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error updating group: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.delete('/api/groups/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const check = await pool.query('SELECT admin_user_id FROM groups WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (check.rows[0].admin_user_id !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to delete this group' });
    }
    await pool.query('DELETE FROM group_users WHERE group_id = $1', [id]);
    await pool.query('DELETE FROM task_users WHERE task_id IN (SELECT id FROM tasks WHERE group_id = $1)', [id]);
    await pool.query('DELETE FROM tasks WHERE group_id = $1', [id]);
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);
    logger.info(`Group ${id} deleted by user: ${req.user?.username}`);
    res.status(204).send();
  } catch (err: any) {
    logger.error(`Error deleting group: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port}`);
});