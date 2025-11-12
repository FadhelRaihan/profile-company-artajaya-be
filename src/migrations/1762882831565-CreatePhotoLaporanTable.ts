import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreatePhotoLaporanTable1762882831565 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
        new Table({
            name: "tb_photo_laporan",
            columns: [
            {
                name: "id",
                type: "varchar",
                length: "36",
                isPrimary: true,
                isNullable: false,
            },
            {
                name: "id_laporan",
                type: "varchar",
                length: "36",
                isNullable: false,
            },
            {
                name: "photo_name",
                type: "varchar",
                length: "255",
                isNullable: false,
            },
            {
                name: "url",
                type: "varchar",
                length: "255",
                isNullable: false,
            },
            ],
        }),
        true
        );

        // Foreign key ke tb_laporan(id)
        await queryRunner.createForeignKey(
        "tb_photo_laporan",
        new TableForeignKey({
            name: "FK_tb_photo_laporan_id_laporan",
            columnNames: ["id_laporan"],
            referencedTableName: "tb_laporan",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        })
        );

        // Index untuk mempercepat pencarian berdasarkan id_laporan
        await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS IDX_tb_photo_laporan_id_laporan ON tb_photo_laporan(id_laporan)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("tb_photo_laporan");
        if (!table) return;

        // Drop FK jika ada
        const fk = table.foreignKeys.find((f) =>
        f.columnNames.includes("id_laporan")
        );
        if (fk) {
        await queryRunner.dropForeignKey("tb_photo_laporan", fk);
        }

        // Drop index
        await queryRunner.query(
        `DROP INDEX IF EXISTS IDX_tb_photo_laporan_id_laporan`
        );

        // Drop table
        await queryRunner.dropTable("tb_photo_laporan");
    }

}
