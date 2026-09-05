# Database migrations

Plain `.sql` files, applied in filename order (`0001_...`, `0002_...`, ...).
Each file must be idempotent (`CREATE TABLE IF NOT EXISTS`, guarded
`ALTER TABLE`, etc.) because the runner does not currently support
rollbacks — see the technical debt note below.

## How migrations are applied

- **CI**: `.github/workflows/db-migrate.yml` runs `scripts/migrate.sh`
  against the database identified by the `DB_HOST` / `DB_PORT` /
  `DB_NAME` / `DB_USER` / `DB_PASSWORD` repository secrets. It runs
  automatically before every deploy (called from `deploy-ftp.yml`) and
  can also be triggered manually from the Actions tab.
- **Locally**: copy `.env.example` to `.env`, fill in your MariaDB
  credentials, then run `bash scripts/migrate.sh`.

## Adding a migration

1. Create a new file: `database/migrations/000N_short_description.sql`.
2. Write idempotent SQL (safe to re-run).
3. Test it locally against a scratch database before pushing.
4. Add a line to `docs/DEV_LOG.md` describing what changed and why.

## Known technical debt

`public/api/bootstrap.php` still creates/alters tables inline on every
API request (`CREATE TABLE IF NOT EXISTS ...`). `0001_baseline.sql`
mirrors that schema so it can be tracked and applied through this
pipeline too. Until bootstrap.php's inline DDL is removed, this
migrations folder and bootstrap.php are two sources of truth for the
same schema — **always update both** when you change a table, and
track fully decommissioning the bootstrap.php DDL as a technical debt
item (see docs/PRIORITIES.md).
