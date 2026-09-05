#!/usr/bin/env bash
# Applies pending SQL migrations in database/migrations/ to the
# MariaDB/MySQL database identified by DB_HOST/DB_PORT/DB_NAME/DB_USER/
# DB_PASSWORD env vars. Tracks what has already run in a
# `schema_migrations` table so it is safe to run repeatedly (e.g. on
# every deploy).
#
# Usage:
#   DB_HOST=... DB_PORT=3306 DB_NAME=... DB_USER=... DB_PASSWORD=... \
#     bash scripts/migrate.sh

set -euo pipefail

: "${DB_HOST:?DB_HOST is required}"
: "${DB_PORT:=3306}"
: "${DB_NAME:?DB_NAME is required}"
: "${DB_USER:?DB_USER is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"

MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/database/migrations"

MYSQL=(mysql --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --password="$DB_PASSWORD" --database="$DB_NAME" --batch --skip-column-names)

echo "Connecting to ${DB_HOST}:${DB_PORT}/${DB_NAME} ..."
"${MYSQL[@]}" -e "SELECT 1" >/dev/null
echo "Connection OK."

"${MYSQL[@]}" -e "
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) PRIMARY KEY,
    applied_at DATETIME NOT NULL
)"

applied_count=0
skipped_count=0

for migration in "$MIGRATIONS_DIR"/*.sql; do
  name="$(basename "$migration")"
  already_applied=$("${MYSQL[@]}" -e "SELECT COUNT(*) FROM schema_migrations WHERE filename = '${name}'")

  if [ "$already_applied" = "0" ]; then
    echo "Applying ${name} ..."
    "${MYSQL[@]}" < "$migration"
    "${MYSQL[@]}" -e "INSERT INTO schema_migrations (filename, applied_at) VALUES ('${name}', NOW())"
    applied_count=$((applied_count + 1))
    echo "  done."
  else
    skipped_count=$((skipped_count + 1))
  fi
done

echo "Migrations complete: ${applied_count} applied, ${skipped_count} already up to date."
