import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  BeforeInsert,
} from "typeorm";
import { Laporan } from "./Laporan";
import { v4 as uuidv4 } from "uuid";

@Entity("tb_photo_laporan")
export class PhotoLaporan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column("varchar", { length: 36 })
  id_laporan: string | undefined;

  @Column({ type: "varchar", length: 255 })
  photo_name: string | undefined;

  @Column({ type: "varchar", length: 255 })
  url: string | undefined;

  @ManyToOne(() => Laporan, (laporan) => laporan.photos, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_laporan" }) // Sesuaikan dengan nama kolom di atas
  Laporan: Laporan | undefined;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
