import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Inventory } from "../entities/Inventory";
import { User } from "../entities/User";
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
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const orderRepo = AppDataSource.getRepository(Order);
      const userRepo = AppDataSource.getRepository(User);

      let orders: Order[] = [];
      if (userRole === "CLIENTE") {
        orders = await orderRepo.find({ where: { clientId: userId }, order: { createdAt: "DESC" } });
      } else {
        // VENDEDOR o SUPERADMIN
        orders = await orderRepo.find({ order: { createdAt: "DESC" } });
      }

      const ordersWithDetails = await Promise.all(
        orders.map(async (ord) => {
          const client = await userRepo.findOne({ where: { id: ord.clientId } });
          return {
            ...ord,
            clientName: client ? client.name : "Cliente Registrado",
            clientEmail: client ? client.email : "cliente@terasmart.com",
            address: "Dirección Registrada",
            city: "Cochabamba",
            status: ord.shippingStatus === "PROCESSING" ? "PENDIENTE" : ord.shippingStatus === "SHIPPED" ? "ENVIADO" : "ENTREGADO"
          };
        })
      );

      return res.json(ordersWithDetails);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async getAllOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const orderRepo = AppDataSource.getRepository(Order);
      const userRepo = AppDataSource.getRepository(User);
      const orders = await orderRepo.find({ order: { createdAt: "DESC" } });

      const ordersWithDetails = await Promise.all(
        orders.map(async (ord) => {
          const client = await userRepo.findOne({ where: { id: ord.clientId } });
          return {
            ...ord,
            clientName: client ? client.name : "Cliente Registrado",
            clientEmail: client ? client.email : "cliente@terasmart.com",
            address: "Dirección Registrada",
            city: "Cochabamba",
            status: ord.shippingStatus === "PROCESSING" ? "PENDIENTE" : ord.shippingStatus === "SHIPPED" ? "ENVIADO" : "ENTREGADO"
          };
        })
      );

      return res.json(ordersWithDetails);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async updateOrderStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, shippingStatus, paymentStatus } = req.body;
      const orderRepo = AppDataSource.getRepository(Order);

      const order = await orderRepo.findOne({ where: { id } });
      if (!order) return res.status(404).json({ message: "Orden no encontrada." });

      if (shippingStatus) {
        order.shippingStatus = shippingStatus;
      } else if (status) {
        if (status === "PENDIENTE" || status === "EN PREPARACIÓN") order.shippingStatus = "PROCESSING";
        else if (status === "ENVIADO") order.shippingStatus = "SHIPPED";
        else if (status === "ENTREGADO") order.shippingStatus = "DELIVERED";
      }

      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }

      await orderRepo.save(order);
      return res.json({ message: "Estado de orden actualizado con éxito.", order });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async getOrderDetail(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orderRepo = AppDataSource.getRepository(Order);
      const itemRepo = AppDataSource.getRepository(OrderItem);
      const userRepo = AppDataSource.getRepository(User);

      const order = await orderRepo.findOne({ where: { id } });
      if (!order) return res.status(404).json({ message: "Orden no encontrada." });

      const client = await userRepo.findOne({ where: { id: order.clientId } });
      const items = await itemRepo.find({ where: { orderId: id } });

      return res.json({
        order: {
          ...order,
          clientName: client ? client.name : "Cliente Registrado",
          clientEmail: client ? client.email : "cliente@terasmart.com"
        },
        items
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
