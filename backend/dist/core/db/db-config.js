"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const config_1 = require("../config/config");
exports.pool = new pg_1.Pool({
    user: config_1.config.db.user,
    host: config_1.config.db.host,
    database: config_1.config.db.database,
    password: config_1.config.db.password,
    port: config_1.config.db.port,
});
