import { logger } from "../logger/logger";
import { pool } from "./db-config";

pool.connect((err, client, release) => {
    if (err) {
      logger.error(`Error connecting to database: ${err.message}`);
      return;
    }
    logger.info('Connected to PostgreSQL database');
    release();
});