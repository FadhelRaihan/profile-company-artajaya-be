import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";

@Entity("testimoni")
export class Testimoni {
  @PrimaryColumn('varchar', { length: 36 })
  id: string | undefined;

  @Column({ type: "varchar", length: 100 })
  nama_tester: string | undefined;

  @Column({ type: "varchar", length: 225, unique: true })
  testimoni: string | undefined;

  @Column({ type: "boolean", default: "1" })
  is_active: boolean | undefined;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "created_by" })
  createdByUser!: User;

  @Column({ name: "created_by" })
  created_by!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date | undefined;
}
