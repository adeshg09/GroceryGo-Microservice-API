import express, { RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import { authProxy } from "./proxies/auth.proxy";
import { env } from "./config/env";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Gateway test endpoint working!" });
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxies
app.use("/api/v1/auth", authProxy as unknown as RequestHandler);

// Health Check
app.get("/health", (req, res) => {
  res.send("Gateway OK");
});

app.listen(env.GATEWAY_PORT, () => {
  console.log(`🚀 Gateway running on port ${env.GATEWAY_PORT}`);
});
