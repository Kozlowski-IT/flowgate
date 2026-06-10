import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRequestEvents1781111454830 implements MigrationInterface {
  name = 'CreateRequestEvents1781111454830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "request_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "request_id" uuid NOT NULL, "actor_id" uuid NOT NULL, "action" character varying NOT NULL, "from_status" "public"."request_status", "to_status" "public"."request_status" NOT NULL, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bf9333ddb0c34f1533239fc9cb0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8b717bcc3e01fbd300f4e97e5" ON "request_events"  ("request_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8b717bcc3e01fbd300f4e97e5"`,
    );
    await queryRunner.query(`DROP TABLE "request_events"`);
  }
}
