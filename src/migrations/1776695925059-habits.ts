import { MigrationInterface, QueryRunner } from "typeorm";

export class Habits1776695925059 implements MigrationInterface {
    name = 'Habits1776695925059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" ADD "lastCompletedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "lastCompletedAt"`);
    }

}
