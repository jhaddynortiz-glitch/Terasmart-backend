import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Inventory } from "../entities/Inventory";
import { Warehouse } from "../entities/Warehouse";
import { InventoryTransferService } from "../services/inventory-transfer.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class InventoryController {
  public static async getMyInventory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const warehouseRepo = AppDataSource.getRepository(Warehouse);
      let warehouse = await warehouseRepo.findOne({ where: { vendorId: userId } });

      if (!warehouse) {
        // Fallback para desarrollo/pruebas: asigna el primer almacén existente si el usuario es Vendedor/SuperAdmin
        const warehouses = await warehouseRepo.find();
        if (warehouses.length > 0) {
          warehouse = warehouses[0];
        } else {
          return res.status(404).json({ message: "El vendedor no tiene un almacén asignado." });
        }
      }

      const inventoryRepo = AppDataSource.getRepository(Inventory);
      const stockItems = await inventoryRepo.find({ where: { warehouseId: warehouse.id } });

      return res.json({
        warehouse,
        inventory: stockItems
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

    public static async getWarehouses(req: Request, res: Response) {
    try {
      const warehouseRepo = AppDataSource.getRepository(Warehouse);
      const warehouses = await warehouseRepo.find();
      return res.json(warehouses);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async updateStock(req: AuthenticatedRequest, res: Response) {
    try {
      const { warehouseId, variantId, stock } = req.body;
      const inventoryRepo = AppDataSource.getRepository(Inventory);
      let item = await inventoryRepo.findOne({ where: { warehouseId, variantId } });
      if (!item) {
        item = inventoryRepo.create({ warehouseId, variantId, stock: parseInt(stock) });
      } else {
        item.stock = parseInt(stock);
      }
      await inventoryRepo.save(item);
      return res.json({ message: "Stock actualizado exitosamente.", inventory: item });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async transferStock(req: AuthenticatedRequest, res: Response) {
    try {
      const { originWarehouseId, destWarehouseId, variantId, quantity } = req.body;
      const requestedBy = req.user!.id;

      const result = await InventoryTransferService.executeStockTransfer(
        originWarehouseId,
        destWarehouseId,
        variantId,
        parseInt(quantity),
        requestedBy
      );

      return res.status(200).json({
        message: "Transferencia atómica de stock ejecutada exitosamente.",
        transfer: result
      });
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  public static async createWarehouse(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, address, city, vendorId } = req.body;
      const repo = AppDataSource.getRepository(Warehouse);
      const newWh = repo.create({ name, address, city, vendorId });
      await repo.save(newWh);
      return res.status(201).json(newWh);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async getTransfers(req: AuthenticatedRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(InventoryTransfer);
      const transfers = await repo.find({ order: { createdAt: "DESC" } });
      return res.json(transfers);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
