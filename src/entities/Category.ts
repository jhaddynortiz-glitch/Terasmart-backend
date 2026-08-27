import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("categorias")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;
}
