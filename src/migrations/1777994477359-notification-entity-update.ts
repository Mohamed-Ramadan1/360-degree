import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationEntityUpdate1777994477359 implements MigrationInterface {
    name = 'NotificationEntityUpdate1777994477359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "sourceType"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_sourcetype_enum" AS ENUM('auth', 'system', 'security', 'todos', 'habits')`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "sourceType" "public"."notifications_sourcetype_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "sourceType"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_sourcetype_enum"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "sourceType" character varying(100)`);
    }

}
