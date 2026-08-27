import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { User } from "./entities/User";
import { Warehouse } from "./entities/Warehouse";
import { Category } from "./entities/Category";
import { Brand } from "./entities/Brand";
import { Product } from "./entities/Product";
import { ProductVariant } from "./entities/ProductVariant";
import { Inventory } from "./entities/Inventory";
import { Review } from "./entities/Review";

async function runEnterpriseSeed() {
  try {
    console.log("=================================================");
    console.log("Cargando esquema ROBUSTO (Marcas, SKU, Variantes) en MySQL...");
    console.log("=================================================");

    // Limpiar base de datos para reconstrucción de esquema robusto
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || ""
    });
    await conn.query("DROP DATABASE IF EXISTS ecommerce_db;");
    await conn.query("CREATE DATABASE ecommerce_db;");
    await conn.end();

    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const warehouseRepo = AppDataSource.getRepository(Warehouse);
    const categoryRepo = AppDataSource.getRepository(Category);
    const brandRepo = AppDataSource.getRepository(Brand);
    const productRepo = AppDataSource.getRepository(Product);
    const variantRepo = AppDataSource.getRepository(ProductVariant);
    const inventoryRepo = AppDataSource.getRepository(Inventory);
    const reviewRepo = AppDataSource.getRepository(Review);

    // 1. USUARIOS Y ALMACENES
    let admin = await userRepo.findOne({ where: { email: "admin@ecommerce.com" } });
    if (!admin) {
      admin = await userRepo.save(userRepo.create({
        firebaseUid: "superadmin-uid-100", email: "admin@ecommerce.com", name: "Carlos Mendoza (SuperAdmin)", role: "SUPERADMIN"
      }));
    }

    let vendor1 = await userRepo.findOne({ where: { email: "techstore@vendedor.com" } });
    if (!vendor1) {
      vendor1 = await userRepo.save(userRepo.create({
        firebaseUid: "vendor1-uid-200", email: "techstore@vendedor.com", name: "TechStore Bolivia", role: "VENDEDOR"
      }));
    }

    let vendor2 = await userRepo.findOne({ where: { email: "electrohogar@vendedor.com" } });
    if (!vendor2) {
      vendor2 = await userRepo.save(userRepo.create({
        firebaseUid: "vendor2-uid-300", email: "electrohogar@vendedor.com", name: "ElectroHogar Sucursal Norte", role: "VENDEDOR"
      }));
    }

    let w1 = await warehouseRepo.findOne({ where: { vendorId: vendor1.id } });
    if (!w1) {
      w1 = await warehouseRepo.save(warehouseRepo.create({
        vendorId: vendor1.id, name: "Almacén Central Santa Cruz", location: "Av. Banzer 4to Anillo #450"
      }));
    }

    let w2 = await warehouseRepo.findOne({ where: { vendorId: vendor2.id } });
    if (!w2) {
      w2 = await warehouseRepo.save(warehouseRepo.create({
        vendorId: vendor2.id, name: "Almacén Sucursal Norte", location: "Av. Cristo Redentor 6to Anillo #120"
      }));
    }

    // 2. MARCAS (Brands)
    const brandData = [
      { name: "ASUS ROG", logoUrl: "https://logo.clearbit.com/asus.com" },
      { name: "Samsung", logoUrl: "https://logo.clearbit.com/samsung.com" },
      { name: "DeLonghi", logoUrl: "https://logo.clearbit.com/delonghi.com" },
      { name: "LG Electronics", logoUrl: "https://logo.clearbit.com/lg.com" },
      { name: "Nike", logoUrl: "https://logo.clearbit.com/nike.com" }
    ];
    const createdBrands: Record<string, Brand> = {};
    for (const b of brandData) {
      let brand = await brandRepo.findOne({ where: { name: b.name } });
      if (!brand) brand = await brandRepo.save(brandRepo.create(b));
      createdBrands[b.name] = brand;
    }

    // 3. CATEGORÍAS
    const catData = [
      { name: "Tecnología & Gadgets", description: "Laptops, smartphones y accesorios de última generación." },
      { name: "Electrodomésticos & Hogar", description: "Equipos de cocina, refrigeradores y confort." },
      { name: "Moda & Calzado Deportivo", description: "Calzado e indumentaria urbana." }
    ];
    const createdCats: Record<string, Category> = {};
    for (const c of catData) {
      let cat = await categoryRepo.findOne({ where: { name: c.name } });
      if (!cat) cat = await categoryRepo.save(categoryRepo.create(c));
      createdCats[c.name] = cat;
    }

    // 4. PRODUCTOS ROBUSTOS CON SKU, BARRAS, SLUG Y VARIANTES
    // Producto 1: Laptop Asus ROG
    let p1 = await productRepo.findOne({ where: { sku: "LAP-ASUS-ROG-01" } });
    if (!p1) {
      p1 = await productRepo.save(productRepo.create({
        categoryId: createdCats["Tecnología & Gadgets"].id,
        brandId: createdBrands["ASUS ROG"].id,
        name: "Laptop Asus ROG Strix G16",
        slug: "laptop-asus-rog-strix-g16",
        sku: "LAP-ASUS-ROG-01",
        barcode: "7891234567890",
        description: "Laptop Gamer pantalla 16 165Hz QHD, teclado RGB aura sync.",
        basePrice: 1450.00,
        weightKg: 2.50,
        mainImageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
        status: "ACTIVE",
        isFeatured: true
      }));
    }

    // Variantes de Laptop 1
    let v1_1 = await variantRepo.findOne({ where: { sku: "LAP-ASUS-ROG-16GB" } });
    if (!v1_1) {
      v1_1 = await variantRepo.save(variantRepo.create({
        productId: p1.id,
        sku: "LAP-ASUS-ROG-16GB",
        barcode: "7891234567891",
        variantName: "16GB RAM / 512GB SSD / RTX 4060",
        color: "Negro Eclipse",
        size: "16 Pulgadas",
        attributesJson: { ram: "16GB DDR5", storage: "512GB NVMe", gpu: "RTX 4060 8GB" },
        price: 1450.00,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302"
      }));
    }

    let v1_2 = await variantRepo.findOne({ where: { sku: "LAP-ASUS-ROG-32GB" } });
    if (!v1_2) {
      v1_2 = await variantRepo.save(variantRepo.create({
        productId: p1.id,
        sku: "LAP-ASUS-ROG-32GB",
        barcode: "7891234567892",
        variantName: "32GB RAM / 1TB SSD / RTX 4080",
        color: "Gris Titanio",
        size: "16 Pulgadas",
        attributesJson: { ram: "32GB DDR5", storage: "1TB NVMe", gpu: "RTX 4080 12GB" },
        price: 1850.00,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302"
      }));
    }

    // Producto 2: Samsung Galaxy S24 Ultra
    let p2 = await productRepo.findOne({ where: { sku: "PHONE-SAMSUNG-S24U" } });
    if (!p2) {
      p2 = await productRepo.save(productRepo.create({
        categoryId: createdCats["Tecnología & Gadgets"].id,
        brandId: createdBrands["Samsung"].id,
        name: "Smartphone Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        sku: "PHONE-SAMSUNG-S24U",
        barcode: "8806091234567",
        description: "Smartphone Galaxy AI con cámara de 200MP y estructura de titanio.",
        basePrice: 1199.00,
        weightKg: 0.23,
        mainImageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
        status: "ACTIVE",
        isFeatured: true
      }));
    }

    let v2_1 = await variantRepo.findOne({ where: { sku: "PHONE-S24U-256GB-BLK" } });
    if (!v2_1) {
      v2_1 = await variantRepo.save(variantRepo.create({
        productId: p2.id,
        sku: "PHONE-S24U-256GB-BLK",
        barcode: "8806091234568",
        variantName: "Negro Titanio / 256GB",
        color: "Negro Titanio",
        size: "6.8 Pulgadas",
        attributesJson: { storage: "256GB", ram: "12GB" },
        price: 1199.00
      }));
    }

    let v2_2 = await variantRepo.findOne({ where: { sku: "PHONE-S24U-512GB-GRY" } });
    if (!v2_2) {
      v2_2 = await variantRepo.save(variantRepo.create({
        productId: p2.id,
        sku: "PHONE-S24U-512GB-GRY",
        barcode: "8806091234569",
        variantName: "Gris Titanio / 512GB",
        color: "Gris Titanio",
        size: "6.8 Pulgadas",
        attributesJson: { storage: "512GB", ram: "12GB" },
        price: 1349.00
      }));
    }

    // Producto 3: Zapatillas Nike Air Max 270
    let p3 = await productRepo.findOne({ where: { sku: "SHOES-NIKE-AIR270" } });
    if (!p3) {
      p3 = await productRepo.save(productRepo.create({
        categoryId: createdCats["Moda & Calzado Deportivo"].id,
        brandId: createdBrands["Nike"].id,
        name: "Zapatillas Nike Air Max 270",
        slug: "zapatillas-nike-air-max-270",
        sku: "SHOES-NIKE-AIR270",
        barcode: "0912019876543",
        description: "Calzado urbano deportivo con unidad Max Air de 270 grados.",
        basePrice: 140.00,
        weightKg: 0.85,
        mainImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        status: "ACTIVE"
      }));
    }

    let v3_1 = await variantRepo.findOne({ where: { sku: "SHOES-NIKE-270-T41" } });
    if (!v3_1) {
      v3_1 = await variantRepo.save(variantRepo.create({
        productId: p3.id,
        sku: "SHOES-NIKE-270-T41",
        barcode: "0912019876544",
        variantName: "Rojo Pasión / Talla 41 EU",
        color: "Rojo Pasión",
        size: "41 EU",
        price: 140.00
      }));
    }

    let v3_2 = await variantRepo.findOne({ where: { sku: "SHOES-NIKE-270-T43" } });
    if (!v3_2) {
      v3_2 = await variantRepo.save(variantRepo.create({
        productId: p3.id,
        sku: "SHOES-NIKE-270-T43",
        barcode: "0912019876545",
        variantName: "Rojo Pasión / Talla 43 EU",
        color: "Rojo Pasión",
        size: "43 EU",
        price: 140.00
      }));
    }

    // 5. POBLAR INVENTARIO DE VARIANTES POR ALMACÉN
    const stockItems = [
      { warehouseId: w1.id, variantId: v1_1.id, stock: 10 },
      { warehouseId: w2.id, variantId: v1_1.id, stock: 2 },
      { warehouseId: w1.id, variantId: v1_2.id, stock: 5 },
      { warehouseId: w2.id, variantId: v1_2.id, stock: 0 }, // Para transferencias
      { warehouseId: w1.id, variantId: v2_1.id, stock: 15 },
      { warehouseId: w2.id, variantId: v2_1.id, stock: 8 },
      { warehouseId: w1.id, variantId: v3_1.id, stock: 20 },
      { warehouseId: w2.id, variantId: v3_2.id, stock: 12 }
    ];

    for (const st of stockItems) {
      let inv = await inventoryRepo.findOne({ where: { warehouseId: st.warehouseId, variantId: st.variantId } });
      if (!inv) {
        await inventoryRepo.save(inventoryRepo.create(st));
      } else {
        inv.stock = st.stock;
        await inventoryRepo.save(inv);
      }
    }

    console.log("=================================================");
    console.log("¡ÉXITO! BASE DE DATOS ACTUALIZADA A NIVELES ROBUSTOS:");
    console.log(" 🏢  5 Marcas registradas con logo");
    console.log(" 🏷️  3 Categorías registradas");
    console.log(" 📦  Productos con SKU único, Códigos EAN-13, Slug y Peso");
    console.log(" 🎨  Variantes de Producto (RAM/Almacenamiento/Color/Talla)");
    console.log(" 📊  Control de Stock por Variante en cada Almacén");
    console.log("=================================================");
    process.exit(0);
  } catch (error) {
    console.error("Error al actualizar la base de datos robusta:", error);
    process.exit(1);
  }
}

runEnterpriseSeed();
