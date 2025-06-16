"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = void 0;
const yamljs_1 = __importDefault(require("yamljs"));
exports.swaggerDocument = yamljs_1.default.load('./swagger.yaml');
