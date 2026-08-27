import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("resenas")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  productId: string;

  @Column()
  clientId: string;

  @Column("int")
  rating: number;

  @Column("text")
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
