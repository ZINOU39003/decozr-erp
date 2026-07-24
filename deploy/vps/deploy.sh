#!/usr/bin/env bash
# Deploy DecoZR on a VPS WITHOUT touching other projects.
# Usage on VPS:
#   cd /opt/decozr && bash deploy/vps/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> Project: decozr (isolated compose project name)"
echo "==> Bind: 127.0.0.1:18080 only (safe beside other apps)"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker first."
  exit 1
fi

export DECOZR_JWT_SECRET="${DECOZR_JWT_SECRET:-$(openssl rand -hex 24)}"
export DECOZR_JWT_REFRESH_SECRET="${DECOZR_JWT_REFRESH_SECRET:-$(openssl rand -hex 24)}"
export DECOZR_PUBLIC_URL="${DECOZR_PUBLIC_URL:-http://127.0.0.1:18080}"

docker compose -p decozr -f deploy/vps/docker-compose.yml up -d --build

echo ""
echo "DecoZR is up (isolated)."
echo "Local check:  curl -I http://127.0.0.1:18080"
echo "Login:        admin@decozr.local / admin123"
echo ""
echo "Next: point a subdomain nginx/caddy to 127.0.0.1:18080"
echo "See: deploy/vps/host-nginx-decozr.conf.example"
echo ""
echo "Useful:"
echo "  docker compose -p decozr -f deploy/vps/docker-compose.yml ps"
echo "  docker compose -p decozr -f deploy/vps/docker-compose.yml logs -f --tail=100"
echo "  docker compose -p decozr -f deploy/vps/docker-compose.yml down   # stops ONLY decozr"
