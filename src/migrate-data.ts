import mysql from "mysql2/promise";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const neonUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_FPe7X0tulxno@ep-green-meadow-ayk2qj3j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function runMigration() {
  console.log("=== INICIANDO MIGRACIÓN DE MYSQL LOCAL A NEON POSTGRESQL CLOUD ===");

  // 1. Conexión a MySQL Local
  let mysqlConn;
  try {
    mysqlConn = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ecommerce_db"
    });
    console.log("✅ Conectado a MySQL Local (ecommerce_db)");
  } catch (err: any) {
    console.log("⚠️ No se pudo conectar a MySQL local:", err.message);
    console.log("Finalizando intento de migración.");
    return;
  }

  // 2. Conexión a Neon PostgreSQL Cloud
  const pgClient = new Client({
    connectionString: neonUrl,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log("✅ Conectado a Neon PostgreSQL Cloud DB");

  // Helper para insertar con comillas en columnas para PostgreSQL
  const safeInsert = async (table: string, columns: string[], rows: any[]) => {
    if (rows.length === 0) return 0;
    let inserted = 0;
    const colNames = columns.map(c => `"${c}"`).join(", ");
    
    for (const row of rows) {
      const values = columns.map((col) => row[col] === undefined ? null : row[col]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const query = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
      try {
        await pgClient.query(query, values);
        inserted++;
      } catch (err: any) {
        console.error(`Error insertando en ${table}:`, err.message);
      }
    }
    return inserted;
  };

  try {
    // 3. Migrar Usuarios
    try {
      const [users]: any = await mysqlConn.query("SELECT * FROM usuarios");
      if (users.length > 0) {
        const cols = ["id", "firebaseUid", "email", "name", "role", "createdAt"];
        const count = await safeInsert("usuarios", cols, users);
        console.log(`👤 Migrados ${count} usuarios a Neon DB.`);
      }
    } catch (e: any) { console.error("Error usuarios:", e.message); }

    // 4. Migrar Categorías
    try {
      const [categories]: any = await mysqlConn.query("SELECT * FROM categorias");
      if (categories.length > 0) {
        const cols = ["id", "name", "description", "imageUrl", "createdAt"];
        const count = await safeInsert("categorias", cols, categories);
        console.log(`🏷️ Migradas ${count} categorías a Neon DB.`);
      }
    } catch (e: any) { console.error("Error categorias:", e.message); }

    // 5. Migrar Marcas
    try {
      const [brands]: any = await mysqlConn.query("SELECT * FROM marcas");
      if (brands.length > 0) {
        const cols = ["id", "name", "logoUrl", "createdAt"];
        const count = await safeInsert("marcas", cols, brands);
        console.log(`🏢 Migradas ${count} marcas a Neon DB.`);
      }
    } catch (e: any) { console.error("Error marcas:", e.message); }

    // 6. Migrar Almacenes
    try {
      const [warehouses]: any = await mysqlConn.query("SELECT * FROM almacenes");
      if (warehouses.length > 0) {
        const cols = ["id", "vendorId", "name", "address", "city", "createdAt"];
        const count = await safeInsert("almacenes", cols, warehouses);
        console.log(`🏬 Migrados ${count} almacenes a Neon DB.`);
      }
    } catch (e: any) { console.error("Error almacenes:", e.message); }

    // 7. Migrar Productos
    try {
      const [products]: any = await mysqlConn.query("SELECT * FROM productos");
      if (products.length > 0) {
        const cols = ["id", "categoryId", "brandId", "name", "slug", "sku", "barcode", "description", "basePrice", "weightKg", "mainImageUrl", "status", "createdAt"];
        const count = await safeInsert("productos", cols, products);
        console.log(`📦 Migrados ${count} productos a Neon DB.`);
      }
    } catch (e: any) { console.error("Error productos:", e.message); }

    // 8. Migrar Variantes de Producto
    try {
      const [variants]: any = await mysqlConn.query("SELECT * FROM variantes_producto");
      if (variants.length > 0) {
        const cols = ["id", "productId", "sku", "barcode", "variantName", "color", "size", "attributesJson", "price", "imageUrl", "createdAt"];
        const count = await safeInsert("variantes_producto", cols, variants);
        console.log(`🎨 Migradas ${count} variantes de productos a Neon DB.`);
      }
    } catch (e: any) { console.error("Error variantes:", e.message); }

    console.log("=== 🚀 MIGRACIÓN COMPLETADA EXITOSAMENTE DE MYSQL A NEON DB ===");
  } catch (e: any) {
    console.error("Error durante el proceso de migración:", e);
  } finally {
    await mysqlConn.end();
    await pgClient.end();
  }
}

runMigration();
