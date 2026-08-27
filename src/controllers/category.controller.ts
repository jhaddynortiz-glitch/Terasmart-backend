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
}
