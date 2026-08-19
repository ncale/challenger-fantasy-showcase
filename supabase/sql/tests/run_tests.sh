#!/usr/bin/env bash
# Read DB_URL from .env file
SCRIPT_DIR="$(dirname "$0")"

if [ -f "${SCRIPT_DIR}/../../.env" ]; then
  export $(grep -v '^#' "${SCRIPT_DIR}/../../.env" | xargs)
else
  echo "Error: .env file not found in root directory" >&2
  exit 1
fi

# Verify DB_URL was loaded
if [ -z "${DB_URL:-}" ]; then
  echo "Error: DB_URL not found in .env file" >&2
  exit 1
fi

set -euo pipefail
shopt -s nullglob
for f in "$SCRIPT_DIR"/*.sql; do
  echo "running test $f"
  psql "$DB_URL" -v ON_ERROR_STOP=1 -t -A -f "$f"
done
