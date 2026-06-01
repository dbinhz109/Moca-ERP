#!/usr/bin/env bash
# Chạy toàn bộ migration .up.sql theo thứ tự lên database trỏ bởi $DATABASE_URL.
# Dùng cho DB cloud (Neon/Supabase): export DATABASE_URL=... ; ./scripts/migrate.sh
set -euo pipefail

: "${DATABASE_URL:?Hãy export DATABASE_URL trước (postgres://...?sslmode=require)}"

DIR="$(cd "$(dirname "$0")/migrations" && pwd)"
for f in "$DIR"/*.up.sql; do
  echo ">> Áp dụng $(basename "$f")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
echo "✓ Hoàn tất migration."
