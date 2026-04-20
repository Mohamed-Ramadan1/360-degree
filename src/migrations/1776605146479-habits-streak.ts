import { MigrationInterface, QueryRunner } from "typeorm";

export class HabitsStreak1776605146479 implements MigrationInterface {
    name = 'HabitsStreak1776605146479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "habit_streaks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "habitId" uuid NOT NULL, "count" integer NOT NULL DEFAULT '1', "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "endedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bdbd605be05f1ee184cf89f9cf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_57662b64d69b54c6599803b316" ON "habit_streaks" ("habitId") `);
        await queryRunner.query(`ALTER TABLE "habits" ADD "currentStreak" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "habits" ADD "longestStreak" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "habits" ADD "completionCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "habit_streaks" ADD CONSTRAINT "FK_57662b64d69b54c6599803b3164" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit_streaks" DROP CONSTRAINT "FK_57662b64d69b54c6599803b3164"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "completionCount"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "longestStreak"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "currentStreak"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57662b64d69b54c6599803b316"`);
        await queryRunner.query(`DROP TABLE "habit_streaks"`);
    }

}
