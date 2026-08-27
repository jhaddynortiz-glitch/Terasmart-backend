import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Brand } from "../entities/Brand";

export class BrandController {
  public static async getBrands(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Brand);
      const brands = await repo.find();
      return res.json(brands);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async createBrand(req: Request, res: Response) {
    try {
      const { name, logoUrl } = req.body;
      const repo = AppDataSource.getRepository(Brand);
      const newBrand = repo.create({ name, logoUrl });
      await repo.save(newBrand);
      return res.status(201).json(newBrand);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
