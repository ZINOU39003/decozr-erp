#!/bin/bash
# Run on Contabo VPS as admin. Isolates DecoZR from zinoutv (ports 80/81/3000/3001).
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

if [ -z "${SUDO_PASS:-}" ]; then
  echo "Set SUDO_PASS env var"
  exit 1
fi

sudo_run() {
  echo "$SUDO_PASS" | sudo -S -p '' "$@"
}

echo "==> Installing Docker if needed"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo_run sh /tmp/get-docker.sh
  sudo_run usermod -aG docker admin || true
fi

sudo_run systemctl enable --now docker

echo "==> Docker version"
# new group may not apply in this shell — use sudo docker
sudo_run docker --version
sudo_run docker compose version

echo "==> Preparing /opt/decozr"
sudo_run mkdir -p /opt/decozr
sudo_run chown admin:admin /opt/decozr

if [ ! -d /opt/decozr/.git ]; then
  git clone https://github.com/ZINOU39003/decozr-erp.git /opt/decozr
else
  cd /opt/decozr && git fetch origin && git reset --hard origin/main
fi

cd /opt/decozr
export DECOZR_PUBLIC_URL="${DECOZR_PUBLIC_URL:-http://173.212.245.85:82}"
# deploy.sh uses docker without sudo — wrap via sudo for first login before re-login
if ! docker info >/dev/null 2>&1; then
  echo "==> Using sudo docker for compose (admin not yet in active docker group)"
  export DECOZR_JWT_SECRET="${DECOZR_JWT_SECRET:-$(openssl rand -hex 24)}"
  export DECOZR_JWT_REFRESH_SECRET="${DECOZR_JWT_REFRESH_SECRET:-$(openssl rand -hex 24)}"
  sudo_run -E docker compose -p decozr -f deploy/vps/docker-compose.yml up -d --build
else
  bash deploy/vps/deploy.sh
fi

echo "==> Writing nginx site on port 82 (isolated from zinoutv 80/81)"
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

echo "==> Health checks"
sleep 5
curl -sI http://127.0.0.1:18080 | head -8 || true
curl -sI http://127.0.0.1:82 | head -8 || true
sudo_run docker compose -p decozr -f /opt/decozr/deploy/vps/docker-compose.yml ps

echo "DEPLOY_OK"
