"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    db: {
        user: 'andrey',
        host: 'localhost',
        database: 'task_tracker',
        password: 'qwerty',
        port: 5432
    },
    server: {
        port: 5003
    },
    log: {
        level: 'info',
        file: 'logs/app.log'
    },
    jwt: {
        secret: '12345'
    }
};
