import "dotenv/config";
import { Sequelize } from "sequelize";
import app from "./app";
import { initUserModel } from "./models/User";

const PORT = parseInt(process.env.PORT || "5000", 10);

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

async function boot(): Promise<void> {
  try {
    initUserModel(sequelize);

    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("Models synced");

    app.listen(PORT, () => {
      console.log(`Server running on PORT:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

boot();
