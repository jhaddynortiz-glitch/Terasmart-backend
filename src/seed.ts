import { AppDataSource } from "./config/data-source";
import { User } from "./entities/User";
import { Warehouse } from "./entities/Warehouse";
import { Category } from "./entities/Category";
import { Brand } from "./entities/Brand";
import { Product } from "./entities/Product";
import { ProductVariant } from "./entities/ProductVariant";
import { Inventory } from "./entities/Inventory";

async function seed() {
  console.log("Conectando a Neon PostgreSQL...");
  await AppDataSource.initialize();
  console.log("¡Conexión a Neon PostgreSQL establecida y esquema sincronizado!");

  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);
  const brandRepo = AppDataSource.getRepository(Brand);
  const warehouseRepo = AppDataSource.getRepository(Warehouse);
  const productRepo = AppDataSource.getRepository(Product);
  const variantRepo = AppDataSource.getRepository(ProductVariant);
  const inventoryRepo = AppDataSource.getRepository(Inventory);

  // 1. Crear Usuarios de Prueba
  let admin = await userRepo.findOne({ where: { email: "admin@ecommerce.com" } });
  if (!admin) {
    admin = userRepo.create({
      firebaseUid: "dev-admin-uid-123",
      email: "admin@ecommerce.com",
      name: "SuperAdmin TeraSmart",
      role: "SUPERADMIN"
    });
    await userRepo.save(admin);
    console.log("Usuario SuperAdmin creado.");
  }

  let vendor = await userRepo.findOne({ where: { email: "techstore@vendedor.com" } });
  if (!vendor) {
    vendor = userRepo.create({
      firebaseUid: "dev-vendor-uid-456",
      email: "techstore@vendedor.com",
      name: "TechStore Bolivia",
      role: "VENDEDOR"
    });
    await userRepo.save(vendor);
    console.log("Usuario Vendedor creado.");
  }

  // 2. Crear Almacenes
  let warehouseCentral = await warehouseRepo.findOne({ where: { name: "Almacén Central Santa Cruz" } });
  if (!warehouseCentral) {
    warehouseCentral = warehouseRepo.create({
      name: "Almacén Central Santa Cruz",
      address: "Av. Cristo Redentor 4to Anillo",
      city: "Santa Cruz",
      vendorId: vendor.id
    });
    await warehouseRepo.save(warehouseCentral);
  }

  let warehouseLaPaz = await warehouseRepo.findOne({ where: { name: "Sucursal La Paz Tech" } });
  if (!warehouseLaPaz) {
    warehouseLaPaz = warehouseRepo.create({
      name: "Sucursal La Paz Tech",
      address: "Calle Sagárnaga 123",
      city: "La Paz",
      vendorId: vendor.id
    });
    await warehouseRepo.save(warehouseLaPaz);
  }

  // 3. Crear Categorías
  let catLaptops = await categoryRepo.findOne({ where: { name: "Laptops & Computadoras" } });
  if (!catLaptops) {
    catLaptops = categoryRepo.create({
      name: "Laptops & Computadoras",
      description: "Equipos portátiles para trabajo, estudio y gaming de alta gama."
    });
    await categoryRepo.save(catLaptops);
  }

  let catSmartphones = await categoryRepo.findOne({ where: { name: "Smartphones & Celulares" } });
  if (!catSmartphones) {
    catSmartphones = categoryRepo.create({
      name: "Smartphones & Celulares",
      description: "Dispositivos móviles Android y iOS de última generación."
    });
    await categoryRepo.save(catSmartphones);
  }

  let catAudio = await categoryRepo.findOne({ where: { name: "Audio & Auriculares" } });
  if (!catAudio) {
    catAudio = categoryRepo.create({
      name: "Audio & Auriculares",
      description: "Auriculares inalámbricos, parlantes Bluetooth y sonido profesional."
    });
    await categoryRepo.save(catAudio);
  }

  // 4. Crear Marcas
  let brandAsus = await brandRepo.findOne({ where: { name: "ASUS" } });
  if (!brandAsus) {
    brandAsus = brandRepo.create({ name: "ASUS" });
    await brandRepo.save(brandAsus);
  }

  let brandSamsung = await brandRepo.findOne({ where: { name: "Samsung" } });
  if (!brandSamsung) {
    brandSamsung = brandRepo.create({ name: "Samsung" });
    await brandRepo.save(brandSamsung);
  }

  let brandSony = await brandRepo.findOne({ where: { name: "Sony" } });
  if (!brandSony) {
    brandSony = brandRepo.create({ name: "Sony" });
    await brandRepo.save(brandSony);
  }

  // 5. Crear Productos y Variantes
  let prodS24 = await productRepo.findOne({ where: { sku: "PHONE-SAMSUNG-S24U" } });
  if (!prodS24) {
    prodS24 = productRepo.create({
      categoryId: catSmartphones.id,
      brandId: brandSamsung.id,
      name: "Smartphone Samsung Galaxy S24 Ultra",
      slug: "smartphone-samsung-galaxy-s24-ultra",
      sku: "PHONE-SAMSUNG-S24U",
      barcode: "7891234567890",
      description: "Smartphone Galaxy AI con cámara de 200MP, S-Pen integrado y pantalla Dynamic AMOLED 2X.",
      basePrice: 1199.00,
      mainImageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE"
    });
    await productRepo.save(prodS24);

    const var1 = variantRepo.create({
      productId: prodS24.id,
      sku: "PHONE-S24U-TIT-512GB",
      variantName: "Titanium Gray 512GB",
      color: "Gris Titanio",
      size: "512GB",
      price: 1199.00,
      imageUrl: prodS24.mainImageUrl
    });
    await variantRepo.save(var1);

    await inventoryRepo.save(inventoryRepo.create({
      warehouseId: warehouseCentral.id,
      variantId: var1.id,
      stock: 15
    }));
  }

  let prodLaptop = await productRepo.findOne({ where: { sku: "LAP-ASUS-ROG16" } });
  if (!prodLaptop) {
    prodLaptop = productRepo.create({
      categoryId: catLaptops.id,
      brandId: brandAsus.id,
      name: "Laptop Gaming ASUS ROG Strix G16",
      slug: "laptop-gaming-asus-rog-strix-g16",
      sku: "LAP-ASUS-ROG16",
      barcode: "7899876543210",
      description: "Laptop gamer con procesador Intel Core i9 de 13ra generación, tarjeta RTX 4070 y pantalla 240Hz.",
      basePrice: 1650.00,
      mainImageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE"
    });
    await productRepo.save(prodLaptop);

    const varLaptop = variantRepo.create({
      productId: prodLaptop.id,
      sku: "LAP-ROG16-I9-32RAM",
      variantName: "Core i9 / 32GB RAM / 1TB SSD",
      color: "Eclipse Gray",
      size: "16 Pulgadas",
      price: 1650.00,
      imageUrl: prodLaptop.mainImageUrl
    });
    await variantRepo.save(varLaptop);

    await inventoryRepo.save(inventoryRepo.create({
      warehouseId: warehouseCentral.id,
      variantId: varLaptop.id,
      stock: 8
    }));
  }

  let prodSony = await productRepo.findOne({ where: { sku: "AUD-SONY-WH1000XM5" } });
  if (!prodSony) {
    prodSony = productRepo.create({
      categoryId: catAudio.id,
      brandId: brandSony.id,
      name: "Auriculares Sony WH-1000XM5 Noise Cancelling",
      slug: "auriculares-sony-wh-1000xm5",
      sku: "AUD-SONY-WH1000XM5",
      barcode: "4905524987654",
      description: "Auriculares inalámbricos de diadema con la mejor cancelación de ruido de la industria y micrófono HD.",
      basePrice: 380.00,
      mainImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE"
    });
    await productRepo.save(prodSony);

    const varSony = variantRepo.create({
      productId: prodSony.id,
      sku: "AUD-WH5-BLACK",
      variantName: "Negro Mate Premium",
      color: "Negro",
      price: 380.00,
      imageUrl: prodSony.mainImageUrl
    });
    await variantRepo.save(varSony);

    await inventoryRepo.save(inventoryRepo.create({
      warehouseId: warehouseLaPaz.id,
      variantId: varSony.id,
      stock: 20
    }));
  }

  console.log("¡Datos iniciales sembrados en Neon PostgreSQL con éxito!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error al sembrar la base de datos:", err);
  process.exit(1);
});
