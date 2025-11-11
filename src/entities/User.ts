import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Testimoni } from "./Testimoni";

@Entity("tb_users")
export class User {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @OneToMany(() => Testimoni, (testimoni) => testimoni.createdByUser)
  testimonis!: Testimoni[];

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at!: Date;
}
