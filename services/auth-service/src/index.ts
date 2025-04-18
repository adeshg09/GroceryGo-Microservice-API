import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import AuthRouter from "./routes/auth.routes";
import { env } from "./config/env";

// Initialize Express app
const app = express();

// ======================
// 1. Middleware Setup
// ======================
app.use(
  cors({
    origin: ["https://grocerygo-microservice-api-gateway.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies

// ======================
// 2. Database Connection
// ======================
mongoose
  .connect(env.MONGODB_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ======================
// 3. Routes
// ======================

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use("/api/v1", AuthRouter);

// ======================
// 4. Health Check
// ======================
app.get("/health", (req: Request, res: Response) => {
  res.send("Auth Service OK");
});

// ======================
// 4. Server Startup
// ======================
const PORT = env.AUTH_SERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
});

// Export for testing
export default app;
