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
import { PhotoKegiatan } from "./PhotoKegiatan";

@Entity("tb_kegiatan")
export class Kegiatan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column({ type: "varchar", length: 100 })
  nama_kegiiatan: string | undefined;

  @Column({ type: "varchar", length: 225, unique: true })
  deskripsi_singkat: string | undefined;

  @CreateDateColumn({ name: "tanggal_kegiatan" })
  tanggal_kegiatan: Date | undefined;

  @Column({ type: "varchar", length: 100, unique: true })
  lokasi_kegiatan: string | undefined;

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

  @OneToMany(() => PhotoKegiatan, (photo) => photo.kegiatan, {
    cascade: ["insert", "update"],
    onDelete: "CASCADE",
  })
  photos: PhotoKegiatan[] | undefined;
}
