import dotenv from "dotenv";
dotenv.config();

export const env = {
  AUTH_SERVICE_PORT: process.env.PORT || 3001,
  MONGODB_URI: process.env.MONGODB_URI,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "access_secret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
};
