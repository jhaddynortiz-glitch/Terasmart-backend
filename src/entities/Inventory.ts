import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("inventario")
@Unique(["warehouseId", "variantId"])
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  warehouseId: string;

  @Column()
  variantId: string;

  @Column("int", { default: 0 })
  stock: number;
}
