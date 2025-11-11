import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTestimoniTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create testimoni table
    await queryRunner.createTable(
      new Table({
        name: 'testimoni',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'nama_tester',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'testimoni',
            type: 'varchar',
            length: '225',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'testimoni',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_testimoni_created_by',
      })
    );

    // Create index for better query performance
    await queryRunner.query(
      `CREATE INDEX IDX_testimoni_is_active ON testimoni(is_active)`
    );
    await queryRunner.query(
      `CREATE INDEX IDX_testimoni_created_by ON testimoni(created_by)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('testimoni', 'FK_testimoni_created_by');

    // Drop indexes
    await queryRunner.query(`DROP INDEX IDX_testimoni_is_active ON testimoni`);
    await queryRunner.query(`DROP INDEX IDX_testimoni_created_by ON testimoni`);

    // Drop table
    await queryRunner.dropTable('testimoni');
  }
}