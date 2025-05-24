// import { getEnv } from "../utils/env-utils";
import 'dotenv/config';
import { getEnv } from '../utils/env-utils';

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  MONGO_URI: getEnv("MONGO_URI", ""),
  USE_IN_MEMORY_DB: getEnv("USE_IN_MEMORY_DB", "false") === "true", // New flag for in-memory MongoDB

  SESSION_SECRET: getEnv("SESSION_SECRET"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
  FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL"),

  // Email Configuration
  email: {
    host: getEnv("EMAIL_HOST", "smtp.ethereal.email"), // Default to Ethereal for testing
    port: parseInt(getEnv("EMAIL_PORT", "587"), 10),
    secure: getEnv("EMAIL_SECURE", "false") === "true", // true for 465, false for other ports
    auth: {
      user: getEnv("EMAIL_USER", ""), 
      pass: getEnv("EMAIL_PASS", ""), 
    },
    from: getEnv("EMAIL_FROM", '"Your App Name" <noreply@yourapp.com>'),
  },
});

export const config = appConfig();
