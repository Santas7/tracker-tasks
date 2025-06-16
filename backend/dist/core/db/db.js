"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger/logger");
const db_config_1 = require("./db-config");
db_config_1.pool.connect((err, client, release) => {
    if (err) {
        logger_1.logger.error(`Error connecting to database: ${err.message}`);
        return;
    }
    logger_1.logger.info('Connected to PostgreSQL database');
    release();
});
