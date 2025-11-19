import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Karyawan } from "./Karyawan";

@Entity("tb_jabatan")
export class Jabatan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column({ type: "varchar", length: 100 })
  nama_jabatan: string | undefined;

  @Column({ type: "int", unique: true })
  urutan: number | undefined;

  @Column({ type: "boolean", default: "1" })
  is_active: boolean | undefined;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "created_by" })
  createdByUser!: User;

  @Column({ name: "created_by" })
  created_by!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date | undefined;

  @OneToMany(() => Karyawan, (karyawan) => karyawan.jabatan)
  karyawan: Karyawan[] | undefined;
}
