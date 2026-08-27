import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

@Entity("productos")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  categoryId: string;

  @Column({ nullable: true })
  brandId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true })
  sku: string;

  @Column({ nullable: true })
  barcode: string;

  @Column("text")
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  basePrice: number;

  @Column("decimal", { precision: 6, scale: 2, default: 0.00 })
  weightKg: number;

  @Column()
  mainImageUrl: string;

  @Column({
    type: "enum",
    enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
    default: "ACTIVE"
  })
  status: ProductStatus;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
