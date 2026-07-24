#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
LOG=/tmp/decozr_deploy.log
exec > >(tee -a "$LOG") 2>&1

if [ -z "${SUDO_PASS:-}" ]; then
  echo "Set SUDO_PASS"
  exit 1
fi

sudo_run() {
  echo "$SUDO_PASS" | sudo -S -p '' "$@"
}

cd /opt/decozr
export DECOZR_PUBLIC_URL="${DECOZR_PUBLIC_URL:-http://173.212.245.85:82}"
export DECOZR_JWT_SECRET="${DECOZR_JWT_SECRET:-$(openssl rand -hex 24)}"
export DECOZR_JWT_REFRESH_SECRET="${DECOZR_JWT_REFRESH_SECRET:-$(openssl rand -hex 24)}"

echo "==> Building and starting decozr ($(date -Is))"
sudo_run -E docker compose -p decozr -f deploy/vps/docker-compose.yml up -d --build

echo "==> nginx port 82"
sudo_run tee /etc/nginx/sites-available/decozr >/dev/null <<'NGINX'
server {
    listen 82;
    server_name _;

    client_max_body_size 40m;

    location / {
        proxy_pass http://127.0.0.1:18080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
NGINX

sudo_run ln -sf /etc/nginx/sites-available/decozr /etc/nginx/sites-enabled/decozr
sudo_run nginx -t
sudo_run systemctl reload nginx

sleep 8
echo "==> status"
sudo_run docker compose -p decozr -f deploy/vps/docker-compose.yml ps
curl -sI http://127.0.0.1:18080 | head -8 || true
curl -sI http://127.0.0.1:82 | head -8 || true
curl -s http://127.0.0.1:18080/api/v1/health || true
echo
echo DEPLOY_OK
