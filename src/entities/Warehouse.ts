import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("almacenes")
export class Warehouse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  vendorId: string;

  @Column()
  name: string;

  @Column()
  location: string;
}
