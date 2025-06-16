import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './core/config/config';
import { swaggerDocument } from './core/swagger-doc/swagger-doc';
import { pool } from './core/db/db-config';
import { logger } from './core/logger/logger';

const app: Express = express();
app.use(express.json());

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Эндпоинты
// Получение всех задач
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

// Получение всех пользователей
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

// Получение всех групп
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

app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port}`);
});