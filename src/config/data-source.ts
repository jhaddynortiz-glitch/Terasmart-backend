import { RefreshToken } from "../entities/RefreshToken";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Warehouse } from "../entities/Warehouse";
import { Category } from "../entities/Category";
import { Brand } from "../entities/Brand";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Inventory } from "../entities/Inventory";
import { InventoryTransfer } from "../entities/InventoryTransfer";
import { Review } from "../entities/Review";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce_db",
  synchronize: true, // Sincronización automática de tablas relacionales
  logging: false,
  entities: [
    User,
    Warehouse,
    Category,
    Brand,
    Product,
    ProductVariant,
    Inventory,
    InventoryTransfer,
    Review,
    Order,
    OrderItem,
    RefreshToken
  ],
  subscribers: [],
  migrations: [],
});
