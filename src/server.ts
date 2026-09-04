import dotenv from "dotenv";
dotenv.config();

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { AppDataSource } from "./config/data-source";
import apiRoutes from "./routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Montar Rutas REST API
app.use("/api", apiRoutes);
// Documentación Interactiva Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ message: "Servidor Backend E-Commerce TypeORM + JWT Activo" });
});

// Función para asegurar que la base de datos MySQL exista localmente si no hay Neon DB
async function ensureDatabaseExists() {
  if (process.env.DATABASE_URL) return;

  const host = process.env.DB_HOST || "127.0.0.1";
  const port = parseInt(process.env.DB_PORT || "3306");
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "ecommerce_db";

  const connection = await mysql.createConnection({ host, port, user, password });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.end();
}

// Inicializar Base de Datos y Servidor Express
async function bootstrap() {
  try {
    await ensureDatabaseExists();
    await AppDataSource.initialize();
    
    const dbType = process.env.DATABASE_URL ? "Neon PostgreSQL (Cloud)" : "MySQL (Local)";
    console.log(`¡Conexión exitosa a la Base de Datos ${dbType} con TypeORM!`);
    
    app.listen(PORT, () => {
      console.log(`Servidor REST API ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar la Base de Datos:", error);
  }
}

bootstrap();
