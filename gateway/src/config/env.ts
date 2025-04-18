import dotenv from "dotenv";
dotenv.config();

export const env = {
  GATEWAY_PORT: process.env.PORT || 4000,
  AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT || 3001,
  // AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
};
