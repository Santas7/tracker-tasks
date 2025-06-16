import winston from "winston";
import { config } from "../config/config";

export const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: config.log.file })
  ]
});