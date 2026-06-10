import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRequests1781099494156 implements MigrationInterface {
  name = 'CreateRequests1781099494156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."request_status" AS ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected', 'changes_requested')`,
    );
    await queryRunner.query(
      `CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "payload" jsonb NOT NULL, "status" "public"."request_status" NOT NULL DEFAULT 'draft', "requester_id" uuid NOT NULL, "reviewer_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_394fe48b64d0de79ad6159ed28" ON "requests"  ("requester_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_394fe48b64d0de79ad6159ed28"`,
    );
    await queryRunner.query(`DROP TABLE "requests"`);
    await queryRunner.query(`DROP TYPE "public"."request_status"`);
  }
}
