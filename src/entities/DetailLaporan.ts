import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  PrimaryColumn,
  BeforeInsert,
} from "typeorm";
import { Laporan } from "./Laporan";
import { v4 as uuidv4 } from "uuid";

@Entity("tb_detail_laporan")
export class DetailLaporan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column("varchar", { length: 36 })
  id_laporan: string | undefined;

  @Column({ type: "text" })
  deskripsi_detail: string | undefined;

  @Column({ type: 'timestamp', name: 'tanggal_mulai', nullable: false })
  tanggal_mulai!: Date;

  @Column({ type: 'timestamp', name: 'tanggal_selesai', nullable: false })
  tanggal_selesai!: Date;

  @Column({ type: "varchar", length: 255 })
  lokasi: string | undefined;

  @Column({ type: "varchar", length: 255 })
  client: string | undefined;

  @Column({ type: "varchar", length: 255 })
  pelayanan: string | undefined;

  @Column({ type: "varchar", length: 255 })
  industri: string | undefined;

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
