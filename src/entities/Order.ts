import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export type PaymentMethod = "PAYPAL" | "COD";
export type PaymentStatus = "PENDING" | "PAID";
export type ShippingStatus = "PROCESSING" | "SHIPPED" | "DELIVERED";

@Entity("ordenes")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  clientId: string;

  @Column({
    type: "enum",
    enum: ["PAYPAL", "COD"]
  })
  paymentMethod: PaymentMethod;

  @Column("decimal", { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: "enum",
    enum: ["PENDING", "PAID"],
    default: "PENDING"
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: "enum",
    enum: ["PROCESSING", "SHIPPED", "DELIVERED"],
    default: "PROCESSING"
  })
  shippingStatus: ShippingStatus;

  @CreateDateColumn()
  createdAt: Date;
}
