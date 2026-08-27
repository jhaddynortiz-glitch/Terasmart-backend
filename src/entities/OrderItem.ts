import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("detalle_orden")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  orderId: string;

  @Column()
  variantId: string;

  @Column()
  warehouseId: string;

  @Column("int")
  quantity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice: number;
}
