import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateLaporanTable1762881191540 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tb_laporan",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
          {
            name: "nama_proyek",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "deskripsi_singkat",
            type: "varchar",
            length: "225",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            isNullable: false,
            default: true, // boolean Postgres, tanpa quote
          },
          {
            name: "created_by",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Foreign key ke tb_users(id)
    await queryRunner.createForeignKey(
      "tb_laporan",
      new TableForeignKey({
        name: "FK_tb_laporan_created_by",
        columnNames: ["created_by"],
        referencedColumnNames: ["id"],
        referencedTableName: "tb_users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );

    // Index
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_tb_laporan_is_active ON tb_laporan(is_active)`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_tb_laporan_created_by ON tb_laporan(created_by)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK kalau ada
    const table = await queryRunner.getTable("tb_laporan");
    if (table) {
      const fk = table.foreignKeys.find(
        (f) => f.name === "FK_tb_laporan_created_by" || f.columnNames.includes("created_by")
      );
      if (fk) {
        await queryRunner.dropForeignKey("tb_laporan", fk);
      }
    }

    // Drop index
    await queryRunner.query(
      `DROP INDEX IF EXISTS IDX_tb_laporan_is_active`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS IDX_tb_laporan_created_by`
    );

    // Drop table
    await queryRunner.dropTable("tb_laporan", true);
  }
}
