import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Inventory } from "../entities/Inventory";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class OrderController {
  public static async checkout(req: AuthenticatedRequest, res: Response) {
    try {
      const { paymentMethod, items } = req.body; // items: [{ variantId, warehouseId, quantity, unitPrice }]
      const clientId = req.user!.id;

      if (!items || !items.length) {
        return res.status(400).json({ message: "El carrito no contiene artículos." });
      }

      // Transacción atómica de orden y descuento de inventario
      const order = await AppDataSource.transaction(async (manager) => {
        let total = 0;

        for (const item of items) {
          const inv = await manager.findOne(Inventory, {
            where: { warehouseId: item.warehouseId, variantId: item.variantId }
          });
          if (!inv || inv.stock < item.quantity) {
            throw new Error(`Stock insuficiente para la variante ${item.variantId} en el almacén.`);
          }
          inv.stock -= item.quantity;
          await manager.save(inv);
          total += item.quantity * item.unitPrice;
        }

        const newOrder = manager.create(Order, {
          clientId,
          paymentMethod,
          total,
          paymentStatus: paymentMethod === "PAYPAL" ? "PAID" : "PENDING",
          shippingStatus: "PROCESSING"
        });
        const savedOrder = await manager.save(newOrder);

        for (const item of items) {
          const orderItem = manager.create(OrderItem, {
            orderId: savedOrder.id,
            productId: item.productId || item.variantId,
            variantId: item.variantId,
            warehouseId: item.warehouseId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          });
          await manager.save(orderItem);
        }

        return savedOrder;
      });

      return res.status(201).json({ message: "Orden procesada exitosamente.", order });
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  public static async getMyOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const clientId = req.user!.id;
      const orderRepo = AppDataSource.getRepository(Order);
      const orders = await orderRepo.find({ where: { clientId }, order: { createdAt: "DESC" } });
      return res.json(orders);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async getOrderDetail(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orderRepo = AppDataSource.getRepository(Order);
      const itemRepo = AppDataSource.getRepository(OrderItem);

      const order = await orderRepo.findOne({ where: { id } });
      if (!order) return res.status(404).json({ message: "Orden no encontrada." });

      const items = await itemRepo.find({ where: { orderId: id } });
      return res.json({ order, items });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
