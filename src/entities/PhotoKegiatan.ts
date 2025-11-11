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
import { Kegiatan } from "./Kegiatan";

@Entity("tb_photo_kegiatan")
export class PhotoKegiatan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @PrimaryColumn("varchar", { length: 36 })
  id_kegiatan: string | undefined;

  @Column({ type: "varchar", length: 255 })
  photo_name: string | undefined;

  @Column({ type: "varchar", length: 255 })
  url: string | undefined;

  @ManyToOne(() => Kegiatan, (kegiatan) => kegiatan.photos, {
    onDelete: "CASCADE",
  })
  
  @JoinColumn({ name: "kegiatan_id" })
  kegiatan: Kegiatan | undefined;
}
