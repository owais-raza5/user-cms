import "dotenv/config";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { Sequelize } from "sequelize";
import { initUserModel } from "./models/User";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isLocal = (process.env.DB_HOST || "localhost") === "localhost";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    dialect: "postgres",
    logging: false,
    dialectOptions: isLocal
      ? {}
      : { ssl: { require: true, rejectUnauthorized: false } },
    pool: { max: 2, min: 0, acquire: 30000, idle: 10000 },
  },
);

initUserModel(sequelize);

let dbReady = false;
let dbError: Error | null = null;

sequelize
  .authenticate()
  .then(() => {
    dbReady = true;
    console.log("[db] Connected");
  })
  .catch((err: Error) => {
    dbError = err;
    console.error("[db] Connection failed:", err.message);
  });

app.use((_req: Request, res: Response, next: NextFunction) => {
  if (dbReady) return next();
  if (dbError) {
    res
      .status(503)
      .json({
        success: false,
        message: "Database unavailable",
        error: dbError.message,
      });
    return;
  }
  const start = Date.now();
  const interval = setInterval(() => {
    if (dbReady) {
      clearInterval(interval);
      next();
    } else if (dbError || Date.now() - start > 5000) {
      clearInterval(interval);
      res
        .status(503)
        .json({ success: false, message: "Database connection timeout" });
    }
  }, 100);
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "CMS API is running", db: dbReady });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[unhandled error]", err);
  res.status(500).json({ success: false, message: "Unexpected server error" });
});

export default app;
