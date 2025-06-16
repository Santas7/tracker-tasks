"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgSession = void 0;
const logger_1 = require("../logger/logger");
const db_config_1 = require("./db-config");
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
db_config_1.pool.connect((err, client, release) => {
    if (err) {
        logger_1.logger.error(`Error connecting to database: ${err.message}`);
        return;
    }
    logger_1.logger.info('Connected to PostgreSQL database');
    release();
});
exports.PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
