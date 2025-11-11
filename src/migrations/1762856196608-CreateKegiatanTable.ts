import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateKegiatanTable1762856196608 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create testimoni table
    await queryRunner.createTable(
      new Table({
        name: "tb_kegiatan",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
          {
            name: "nama_kegiatan",
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
            name: "tanggal_kegiatan",
            type: "date",
            isNullable: false,
          },
          {
            name: "lokasi_kegiatan",
            type: "varchar",
            length: "225",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
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
            onUpdate: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      "tb_kegiatan",
      new TableForeignKey({
        columnNames: ["created_by"],
        referencedColumnNames: ["id"],
        referencedTableName: "tb_users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        name: "FK_tb_kegiatan_created_by",
      })
    );

    // Create index for better query performance
    await queryRunner.query(
      `CREATE INDEX IDX_tb_kegiatan_is_active ON tb_kegiatan(is_active)`
    );
    await queryRunner.query(
      `CREATE INDEX IDX_tb_kegiatan_created_by ON tb_kegiatan(created_by)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("tb_kegiatan");
    if (!table) {
      // Table doesn't exist, nothing to rollback
      return;
    }

    // Drop foreign key jika ada
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("created_by") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("tb_kegiatan", foreignKey);
    }

    // // Drop indexes jika ada
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_tb_kegiatan_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_tb_kegiatan_created_by`);

    // Drop table
    await queryRunner.dropTable("tb_kegiatan");
  }
}
