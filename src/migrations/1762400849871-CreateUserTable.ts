import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1234567890122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tb_users",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "name", type: "varchar", length: "100", isNullable: false },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("tb_users");
  }
}
