import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export type TransferStatus = "PENDING" | "APPROVED" | "REJECTED";

@Entity("transferencias_inventario")
export class InventoryTransfer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  originWarehouseId: string;

  @Column()
  destWarehouseId: string;

  @Column()
  variantId: string;

  @Column("int")
  quantity: number;

  @Column({
    type: "enum",
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  })
  status: TransferStatus;

  @Column()
  requestedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
