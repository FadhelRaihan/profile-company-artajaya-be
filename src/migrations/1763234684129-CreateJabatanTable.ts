import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateJabatanTable1763234684129 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create testimoni table
        await queryRunner.createTable(
          new Table({
            name: "tb_jabatan",
            columns: [
              {
                name: "id",
                type: "varchar",
                length: "36",
                isPrimary: true,
              },
              {
                name: "nama_jabatan",
                type: "varchar",
                length: "100",
                isNullable: false,
              },
              {
                name: "urutan",
                type: "int",
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
          "tb_jabatan",
          new TableForeignKey({
            columnNames: ["created_by"],
            referencedColumnNames: ["id"],
            referencedTableName: "tb_users",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            name: "FK_tb_jabatan_created_by",
          })
        );
    
        // Create index for better query performance
        await queryRunner.query(
          `CREATE INDEX IDX_tb_jabatan_is_active ON tb_jabatan(is_active)`
        );
        await queryRunner.query(
          `CREATE INDEX IDX_tb_jabatan_created_by ON tb_jabatan(created_by)`
        );
      }

    public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("tb_jabatan");
    if (!table) {
      // Table doesn't exist, nothing to rollback
      return;
    }

    // Drop foreign key jika ada
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("created_by") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("tb_jabatan", foreignKey);
    }

    // // Drop indexes jika ada
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_tb_jabatan_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_tb_jabatan_created_by`);

    // Drop table
    await queryRunner.dropTable("tb_jabatan");
  }

}
