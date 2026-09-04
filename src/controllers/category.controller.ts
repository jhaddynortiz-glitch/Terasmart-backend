import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";

export class CategoryController {
  public static async getCategories(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Category);
      const categories = await repo.find();
      return res.json(categories);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async createCategory(req: Request, res: Response) {
    try {
      const { name, description, imageUrl } = req.body;
      const repo = AppDataSource.getRepository(Category);
      const newCat = repo.create({ name, description, imageUrl });
      await repo.save(newCat);
      return res.status(201).json(newCat);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, imageUrl } = req.body;
      const repo = AppDataSource.getRepository(Category);
      const cat = await repo.findOne({ where: { id } });
      if (!cat) return res.status(404).json({ message: "Categoría no encontrada." });

      if (name !== undefined) cat.name = name;
      if (description !== undefined) cat.description = description;
      if (imageUrl !== undefined) cat.imageUrl = imageUrl;

      await repo.save(cat);
      return res.json({ message: "Categoría actualizada con éxito.", category: cat });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Category);
      const cat = await repo.findOne({ where: { id } });
      if (!cat) return res.status(404).json({ message: "Categoría no encontrada." });

      await repo.remove(cat);
      return res.json({ message: "Categoría eliminada exitosamente." });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
