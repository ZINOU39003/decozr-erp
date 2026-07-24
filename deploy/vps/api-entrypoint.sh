#!/bin/sh
set -e
cd /app
export DATABASE_URL="${DATABASE_URL:-file:/data/decozr.db}"

echo "[decozr-api] prisma db push..."
npx prisma db push --skip-generate

if [ "${DECOZR_SKIP_SEED}" != "1" ]; then
  echo "[decozr-api] seeding (safe upserts)..."
  npx ts-node --transpile-only src/prisma/seed.ts || echo "[decozr-api] seed skipped/failed (continuing)"
fi

echo "[decozr-api] starting..."
exec node dist/main
