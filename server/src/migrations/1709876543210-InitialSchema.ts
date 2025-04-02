import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1709876543210 implements MigrationInterface {
    name = 'InitialSchema1709876543210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create drivers table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "drivers" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "status" varchar(20) NOT NULL DEFAULT ('OFFLINE'),
                "currentLocation" text,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);

        // Create jobs table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "jobs" (
                "id" varchar PRIMARY KEY NOT NULL,
                "title" varchar NOT NULL,
                "description" text,
                "status" varchar(20) NOT NULL DEFAULT ('PENDING'),
                "driverId" varchar,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("driverId") REFERENCES "drivers"("id")
            )
        `);

        // Create payments table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "payments" (
                "id" varchar PRIMARY KEY NOT NULL,
                "amount" decimal NOT NULL,
                "status" varchar(20) NOT NULL DEFAULT ('PENDING'),
                "jobId" varchar NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("jobId") REFERENCES "jobs"("id")
            )
        `);

        // Create activities table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "activities" (
                "id" varchar PRIMARY KEY NOT NULL,
                "type" varchar(20) NOT NULL,
                "description" text,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order of creation
        await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "jobs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "drivers"`);
    }
} 