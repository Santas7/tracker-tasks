import express, { Express, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './core/config/config';
import { swaggerDocument } from './core/swagger-doc/swagger-doc';
import { pool } from './core/db/db-config';
import { logger } from './core/logger/logger';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import { PgSession } from './core/db/db';

const app: Express = express();
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
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user?.id]);
    logger.info(`Profile fetched for user: ${req.user?.username}`);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error fetching profile: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.post('/api/tasks', authenticateJWT, async (req: Request, res: Response) => {
  const { title, description, skills, group_id, dt_start, dt_end, priority } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, skills, group_id, dt_start, dt_end, priority) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, skills, group_id, dt_start, dt_end, priority]
    );
    logger.info(`Task created by user: ${req.user?.username}`);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error creating task: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.put('/api/tasks/:id/status', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length > 0) {
      logger.info(`Task ${id} status updated by user: ${req.user?.username}`);
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (err: any) {
    logger.error(`Error updating task status: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    logger.info('Fetched all tasks');
    res.json(result.rows);
  } catch (err: any) {
    logger.error(`Error fetching tasks: ${err.message}`);
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

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port}`);
});