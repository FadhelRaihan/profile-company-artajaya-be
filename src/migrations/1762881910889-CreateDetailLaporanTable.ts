import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateDetailLaporanTable1762881910889 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Buat tabel
        await queryRunner.createTable(
        new Table({
            name: "tb_detail_laporan",
            columns: [
            {
                name: "id",
                type: "varchar",
                length: "36",
                isPrimary: true,
            },
            {
                name: "id_laporan",
                type: "varchar",
                length: "36",
                isNullable: false,
            },
            {
                name: "deskripsi_detail",
                type: "text",
                isNullable: false,
            },
            {
                name: "tanggal_mulai",
                type: "timestamp",
                isNullable: false, // ubah ke true kalau mau opsional
            },
            {
                name: "tanggal_selesai",
                type: "timestamp",
                isNullable: false, // true kalau bisa diisi belakangan; set false kalau wajib
            },
            {
                name: "lokasi",
                type: "varchar",
                length: "255",
                isNullable: false,
            },
            {
                name: "client",
                type: "varchar",
                length: "255",
                isNullable: false,
            },
            {
                name: "pelayanan",
                type: "varchar",
                length: "255",
                isNullable: false,
            },
            {
                name: "industri",
                type: "varchar",
                length: "255",
                isNullable: false,
            },
            ],
            indices: [
            {
                name: "IDX_tb_detail_laporan_id_laporan",
                columnNames: ["id_laporan"],
            },
            ],
        }),
        true
        );

        // Foreign key ke tb_laporan(id)
        await queryRunner.createForeignKey(
        "tb_detail_laporan",
        new TableForeignKey({
            name: "FK_tb_detail_laporan_id_laporan",
            columnNames: ["id_laporan"],
            referencedTableName: "tb_laporan",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop FK jika ada
        const table = await queryRunner.getTable("tb_detail_laporan");
        if (table) {
        const fk = table.foreignKeys.find(
            (f) => f.name === "FK_tb_detail_laporan_id_laporan"
        );
        if (fk) {
            await queryRunner.dropForeignKey("tb_detail_laporan", fk);
        }
        }

        // Drop index
        await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_tb_detail_laporan_id_laporan"`
        );

        // Drop table
        await queryRunner.dropTable("tb_detail_laporan", true);
    }

}
