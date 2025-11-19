import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  BeforeInsert,
} from "typeorm";
import { User } from "./User";
import { Jabatan } from "./Jabatan";
import { v4 as uuidv4 } from "uuid";

@Entity("tb_karyawan")
export class Karyawan {
  @PrimaryColumn("varchar", { length: 36 })
  id: string | undefined;

  @Column({ type: "varchar", length: 100 })
  nama_karyawan: string | undefined;

  @Column({ type: "varchar", length: 15})
  no_telepon: string | undefined;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string | undefined;
  
  @Column({ type: "date", name: "tanggal_masuk" })
  tanggal_masuk: Date | undefined;
  
  @Column({ type: "varchar", length: 36, name: "id_jabatan" })
  id_jabatan: string | undefined;

  @Column({ type: "varchar", length: 255 })
  photo_url: string | undefined;
  
  @Column({ type: "boolean", default: true })
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
  
  @ManyToOne(() => Jabatan, { nullable: false })
  @JoinColumn({ name: "id_jabatan" })
  jabatan!: Jabatan;
  
  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
