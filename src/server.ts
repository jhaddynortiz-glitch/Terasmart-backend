import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { AppDataSource } from "./config/data-source";
import apiRoutes from "./routes";

dotenv.config();

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

// Función para asegurar que la base de datos exista antes de conectar TypeORM
async function ensureDatabaseExists() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = parseInt(process.env.DB_PORT || "3306");
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "ecommerce_db";

  const connection = await mysql.createConnection({ host, port, user, password });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.end();
}

// Inicializar Base de Datos MySQL y Servidor Express
async function bootstrap() {
  try {
    await ensureDatabaseExists();
    await AppDataSource.initialize();
    console.log("Conexión exitosa a la Base de Datos MySQL (ecommerce_db) con TypeORM.");
    
    app.listen(PORT, () => {
      console.log(`Servidor REST API ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar la Base de Datos MySQL:", error);
  }
}

bootstrap();
