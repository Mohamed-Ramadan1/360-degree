import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationEntity1777712910058 implements MigrationInterface {
    name = 'NotificationEntity1777712910058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_channel_enum" AS ENUM('in_app', 'push')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying(255) NOT NULL, "body" text NOT NULL, "payload" jsonb, "channel" "public"."notifications_channel_enum" NOT NULL DEFAULT 'in_app', "sourceType" character varying(100), "sourceId" uuid, "read" boolean NOT NULL DEFAULT false, "readAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d60c47e715847c8aa792ba6d1e" ON "notifications" ("userId", "read") `);
        await queryRunner.query(`CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications" ("userId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d60c47e715847c8aa792ba6d1e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_channel_enum"`);
    }

}
