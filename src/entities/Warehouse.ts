import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("almacenes")
export class Warehouse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  vendorId?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;
}
