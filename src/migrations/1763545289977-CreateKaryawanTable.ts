import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateKaryawanTable1763545289977 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
        new Table({
            name: "tb_karyawan",
            columns: [
            {
                name: "id",
                type: "varchar",
                length: "36",
                isPrimary: true,
            },
            {
                name: "nama_karyawan",
                type: "varchar",
                length: "100",
                isNullable: false,
            },
            {
                name: "no_telepon",
                type: "varchar",
                length: "15",
                isNullable: false,
            },
            {
                name: "email",
                type: "varchar",
                length: "255",
                isUnique: true,
                isNullable: false,
            },
            {
                name: "tanggal_masuk",
                type: "date",
                isNullable: false,
            },
            {
                name: "id_jabatan",
                type: "varchar",
                length: "36",
                isNullable: false,
            },
            {
                name: "photo_url",
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

        // ✅ Foreign Key ke tb_users (created_by)
        await queryRunner.createForeignKey(
        "tb_karyawan",
        new TableForeignKey({
            name: "FK_karyawan_created_by",
            columnNames: ["created_by"],
            referencedTableName: "tb_users", // Sesuaikan dengan nama table User
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT", // Tidak bisa hapus user jika masih ada karyawan yang dibuat olehnya
            onUpdate: "CASCADE",
        })
        );

        // ✅ Foreign Key ke tb_jabatan (id_jabatan)
        await queryRunner.createForeignKey(
        "tb_karyawan",
        new TableForeignKey({
            name: "FK_karyawan_jabatan",
            columnNames: ["id_jabatan"],
            referencedTableName: "tb_jabatan", // Sesuaikan dengan nama table Jabatan
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT", // Tidak bisa hapus jabatan jika masih ada karyawan dengan jabatan tersebut
            onUpdate: "CASCADE",
        })
        );

        // ✅ Index untuk performa query
        await queryRunner.query(
        `CREATE INDEX idx_karyawan_is_active ON tb_karyawan(is_active)`
        );
        await queryRunner.query(
        `CREATE INDEX idx_karyawan_id_jabatan ON tb_karyawan(id_jabatan)`
        );
        await queryRunner.query(
        `CREATE INDEX idx_karyawan_created_by ON tb_karyawan(created_by)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX idx_karyawan_created_by ON tb_karyawan`);
        await queryRunner.query(`DROP INDEX idx_karyawan_id_jabatan ON tb_karyawan`);
        await queryRunner.query(`DROP INDEX idx_karyawan_is_active ON tb_karyawan`);

        // Drop foreign keys
        await queryRunner.dropForeignKey("tb_karyawan", "FK_karyawan_jabatan");
        await queryRunner.dropForeignKey("tb_karyawan", "FK_karyawan_created_by");

        // Drop table
        await queryRunner.dropTable("tb_karyawan");
    }

}
