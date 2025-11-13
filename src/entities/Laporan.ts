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
import { PhotoLaporan } from "./PhotoLaporan";

@Entity("tb_laporan")
export class Laporan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column({ type: "varchar", length: 100 })
  nama_proyek: string | undefined;

  @Column({ type: "varchar", length: 225,})
  deskripsi_singkat: string | undefined;

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

  @OneToMany(() => PhotoLaporan, (photo) => photo.Laporan, {
    cascade: ["insert", "update"],
    onDelete: "CASCADE",
  })
  photos: PhotoLaporan[] | undefined;
}
