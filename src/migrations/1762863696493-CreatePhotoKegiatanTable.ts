import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreatePhotoKegiatanTable1762863696493
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create testimoni table
    await queryRunner.createTable(
      new Table({
        name: "tb_photo_kegiatan",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
          },
          {
            name: "id_kegiatan",
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

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      "tb_photo_kegiatan",
      new TableForeignKey({
        columnNames: ["id_kegiatan"],
        referencedColumnNames: ["id"],
        referencedTableName: "tb_kegiatan",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        name: "FK_tb_photo_kegiatan_created_by",
      })
    );

    await queryRunner.query(
      `CREATE INDEX IDX_tb_photo_kegiatan_created_by ON tb_photo_kegiatan(id_kegiatan)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("tb_photo_kegiatan");
    if (!table) {
      // Table doesn't exist, nothing to rollback
      return;
    }

    // Drop foreign key jika ada
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("id_kegiatan") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("tb_photo_kegiatan", foreignKey);
    }

    // // Drop indexes jika ada
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_tb_photo_kegiatan_id_kegiatan`);

    // Drop table
    await queryRunner.dropTable("tb_photo_kegiatan");
  }
}
