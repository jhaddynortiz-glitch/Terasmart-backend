import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export type UserRole = "CLIENTE" | "VENDEDOR" | "SUPERADMIN";

@Entity("usuarios")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  firebaseUid: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: ["CLIENTE", "VENDEDOR", "SUPERADMIN"],
    default: "CLIENTE"
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}
