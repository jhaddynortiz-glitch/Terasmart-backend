import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Review } from "../entities/Review";
import { Inventory } from "../entities/Inventory";
import { Brand } from "../entities/Brand";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class ProductController {
  public static async getProducts(req: Request, res: Response) {
    try {
      const { categoryId, brandId, search, sku } = req.query;
      const productRepo = AppDataSource.getRepository(Product);
      let query = productRepo.createQueryBuilder("product");

      if (categoryId) {
        query = query.andWhere("product.categoryId = :categoryId", { categoryId });
      }
      if (brandId) {
        query = query.andWhere("product.brandId = :brandId", { brandId });
      }
      if (sku) {
        query = query.andWhere("(product.sku = :sku OR product.barcode = :sku)", { sku });
      }
      if (search) {
        query = query.andWhere("(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)", {
          search: `%${(search as string).toLowerCase()}%`
        });
      }

      const products = await query.getMany();
      return res.json(products);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async getProductDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productRepo = AppDataSource.getRepository(Product);
      const variantRepo = AppDataSource.getRepository(ProductVariant);
      const reviewRepo = AppDataSource.getRepository(Review);
      const inventoryRepo = AppDataSource.getRepository(Inventory);
      const brandRepo = AppDataSource.getRepository(Brand);

      const product = await productRepo.findOne({ where: { id } });
      if (!product) return res.status(404).json({ message: "Producto no encontrado." });

      const brand = product.brandId ? await brandRepo.findOne({ where: { id: product.brandId } }) : null;
      const variants = await variantRepo.find({ where: { productId: id } });
      const reviews = await reviewRepo.find({ where: { productId: id } });

      const variantsWithStock = await Promise.all(
        variants.map(async (v) => {
          const invList = await inventoryRepo.find({ where: { variantId: v.id } });
          const totalStock = invList.reduce((sum, item) => sum + item.stock, 0);
          return {
            ...v,
            totalStock,
            stockByWarehouse: invList
          };
        })
      );

      return res.json({
        product,
        brand,
        variants: variantsWithStock,
        reviews
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { categoryId, brandId, name, slug, sku, barcode, description, basePrice, weightKg, mainImageUrl, stock } = req.body;
      const repo = AppDataSource.getRepository(Product);

      const newProd = repo.create({
        categoryId,
        brandId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        sku,
        barcode,
        description,
        basePrice,
        stock: stock !== undefined ? parseInt(stock) : 10,
        weightKg: weightKg || 0,
        mainImageUrl,
        status: "ACTIVE"
      });
      await repo.save(newProd);

      return res.status(201).json(newProd);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async createVariant(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: productId } = req.params;
      const { sku, barcode, variantName, color, size, attributesJson, price, imageUrl } = req.body;
      const variantRepo = AppDataSource.getRepository(ProductVariant);
      const newVariant = variantRepo.create({
        productId,
        sku,
        barcode,
        variantName,
        color,
        size,
        attributesJson,
        price,
        imageUrl
      });
      await variantRepo.save(newVariant);
      return res.status(201).json(newVariant);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async addReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: productId } = req.params;
      const { rating, comment } = req.body;
      const clientId = req.user!.id;

      const reviewRepo = AppDataSource.getRepository(Review);
      const newReview = reviewRepo.create({
        productId,
        clientId,
        rating: parseInt(rating),
        comment
      });

      await reviewRepo.save(newReview);
      return res.status(201).json({ message: "Reseña registrada con éxito.", review: newReview });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { categoryId, brandId, name, slug, sku, barcode, description, basePrice, weightKg, mainImageUrl, status } = req.body;
      const repo = AppDataSource.getRepository(Product);
      
      const product = await repo.findOne({ where: { id } });
      if (!product) return res.status(404).json({ message: "Producto no encontrado." });

      if (categoryId !== undefined) product.categoryId = categoryId;
      if (brandId !== undefined) product.brandId = brandId;
      if (name !== undefined) {
        product.name = name;
        product.slug = slug || name.toLowerCase().replace(/\s+/g, '-');
      }
      if (sku !== undefined) product.sku = sku;
      if (barcode !== undefined) product.barcode = barcode;
      if (description !== undefined) product.description = description;
      if (basePrice !== undefined) product.basePrice = basePrice;
      if (stock !== undefined) product.stock = parseInt(stock);
      if (weightKg !== undefined) product.weightKg = weightKg;
      if (mainImageUrl !== undefined) product.mainImageUrl = mainImageUrl;
      if (status !== undefined) product.status = status;

      await repo.save(product);
      return res.json({ message: "Producto actualizado con éxito.", product });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Product);
      const product = await repo.findOne({ where: { id } });
      if (!product) return res.status(404).json({ message: "Producto no encontrado." });

      await repo.remove(product);
      return res.json({ message: "Producto eliminado exitosamente." });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
