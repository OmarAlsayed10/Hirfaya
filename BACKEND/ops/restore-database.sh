set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${RESTORE_FILE:?RESTORE_FILE is required}"

if [ ! -f "$RESTORE_FILE" ]; then
  printf 'Backup not found: %s\n' "$RESTORE_FILE" >&2
  exit 1
fi

pg_restore --list "$RESTORE_FILE" >/dev/null

if [ "${CONFIRM_DATABASE_RESTORE:-}" != "restore" ]; then
  printf '%s\n' 'Set CONFIRM_DATABASE_RESTORE=restore to continue.' >&2
  exit 1
fi

pg_restore --dbname "$DATABASE_URL" --clean --if-exists --no-owner --no-acl --exit-on-error "$RESTORE_FILE"
