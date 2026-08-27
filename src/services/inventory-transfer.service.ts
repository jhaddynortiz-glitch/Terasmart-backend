import { AppDataSource } from "../config/data-source";
import { Inventory } from "../entities/Inventory";
import { InventoryTransfer } from "../entities/InventoryTransfer";

export class InventoryTransferService {
  public static async executeStockTransfer(
    originWarehouseId: string,
    destWarehouseId: string,
    variantId: string,
    quantity: number,
    requestedBy: string
  ): Promise<InventoryTransfer> {
    if (quantity <= 0) {
      throw new Error("La cantidad a transferir debe ser mayor a cero.");
    }

    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Verificar stock disponible de la variante en el almacén de origen
      const originItem = await transactionalEntityManager.findOne(Inventory, {
        where: { warehouseId: originWarehouseId, variantId }
      });

      if (!originItem || originItem.stock < quantity) {
        throw new Error("Stock insuficiente de la variante en el almacén de origen.");
      }

      // 2. Descontar stock del origen
      originItem.stock -= quantity;
      await transactionalEntityManager.save(originItem);

      // 3. Incrementar o crear stock en el almacén de destino
      let destItem = await transactionalEntityManager.findOne(Inventory, {
        where: { warehouseId: destWarehouseId, variantId }
      });

      if (!destItem) {
        destItem = transactionalEntityManager.create(Inventory, {
          warehouseId: destWarehouseId,
          variantId,
          stock: 0
        });
      }
      destItem.stock += quantity;
      await transactionalEntityManager.save(destItem);

      // 4. Registrar la transferencia en estado APROBADO
      const transferRecord = transactionalEntityManager.create(InventoryTransfer, {
        originWarehouseId,
        destWarehouseId,
        variantId,
        quantity,
        status: "APPROVED",
        requestedBy
      });

      return await transactionalEntityManager.save(transferRecord);
    });
  }
}
