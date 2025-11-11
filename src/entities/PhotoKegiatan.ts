import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  BeforeInsert,
} from "typeorm";
import { Kegiatan } from "./Kegiatan";
import { v4 as uuidv4 } from "uuid";

@Entity("tb_photo_kegiatan")
export class PhotoKegiatan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column("varchar", { length: 36 })
  id_kegiatan: string | undefined;

  @Column({ type: "varchar", length: 255 })
  photo_name: string | undefined;

  @Column({ type: "varchar", length: 255 })
  url: string | undefined;

  @ManyToOne(() => Kegiatan, (kegiatan) => kegiatan.photos, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_kegiatan" }) // Sesuaikan dengan nama kolom di atas
  kegiatan: Kegiatan | undefined;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
