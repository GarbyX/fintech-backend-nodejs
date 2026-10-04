-- Guardrail: Add PostgreSQL Database Constraint
-- To enforce zero-balance protection directly at the database engine level, add a migration with a CHECK constraint:

-- npx prisma migrate dev --create-only --name add_balance_check_constraint

-- TERMINAL OUTPUT
-- Environment variables loaded from .env
-- Prisma schema loaded from prisma/schema.prisma
-- Datasource "db": PostgreSQL database "fintech_nodejs_db", schema "public" at "localhost:5432"

-- Prisma Migrate created the following migration without applying it 20261004054818_add_balance_check_constraint
-- In the generated SQL file inside prisma/migrations/, append:

ALTER TABLE "Account" ADD CONSTRAINT "check_balance_non_negative" CHECK (balance >= 0);

-- terminal output: npx prisma migrate dev
-- Environment variables loaded from .env
-- Prisma schema loaded from prisma/schema.prisma
-- Datasource "db": PostgreSQL database "fintech_nodejs_db", schema "public" at "localhost:5432"

-- Applying migration `20261004054818_add_balance_check_constraint`

-- The following migration(s) have been applied:

-- migrations/
--   └─ 20261004054818_add_balance_check_constraint/
--     └─ migration.sql

-- Your database is now in sync with your schema.

-- ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 
-- 49ms