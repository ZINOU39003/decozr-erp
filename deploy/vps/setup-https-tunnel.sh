#!/bin/bash
# Install cloudflared + systemd tunnel → HTTPS for real Android WebAPK
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

if [ -z "${SUDO_PASS:-}" ]; then
  echo "SUDO_PASS required"
  exit 1
fi

sudo_run() { echo "$SUDO_PASS" | sudo -S -p '' "$@"; }

echo "==> Install cloudflared"
if ! command -v cloudflared >/dev/null 2>&1; then
  curl -fsSL -o /tmp/cloudflared \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  sudo_run install -m 755 /tmp/cloudflared /usr/local/bin/cloudflared
fi
cloudflared --version

echo "==> systemd unit"
sudo_run tee /etc/systemd/system/decozr-tunnel.service >/dev/null <<'UNIT'
[Unit]
Description=DecoZR Cloudflare HTTPS tunnel (WebAPK)
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel --no-autoupdate --url http://127.0.0.1:18080
Restart=always
RestartSec=5
StandardOutput=append:/var/log/decozr-tunnel.log
StandardError=append:/var/log/decozr-tunnel.log

[Install]
WantedBy=multi-user.target
UNIT

sudo_run bash -c ': > /var/log/decozr-tunnel.log'
sudo_run chmod 644 /var/log/decozr-tunnel.log
sudo_run systemctl daemon-reload
sudo_run systemctl enable --now decozr-tunnel.service
sudo_run systemctl restart decozr-tunnel.service

echo "==> Wait for trycloudflare URL"
URL=""
for i in $(seq 1 45); do
  sleep 2
  URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' /var/log/decozr-tunnel.log 2>/dev/null | tail -1 || true)
  if [ -n "$URL" ]; then
    break
  fi
done

if [ -z "$URL" ]; then
  echo "TUNNEL_URL_MISSING"
  tail -60 /var/log/decozr-tunnel.log || true
  exit 1
fi

echo "$URL" | sudo_run tee /opt/decozr/public-https-url.txt >/dev/null
printf 'DECOZR_PUBLIC_HTTPS_URL=%s\nDECOZR_PUBLIC_URL=http://173.212.245.85:82\n' "$URL" \
  | sudo_run tee /opt/decozr/deploy/vps/.env.https >/dev/null

# Save URL into SQLite settings used by storefront API
sudo_run docker exec -e HTTPS_URL="$URL" decozr-api node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
const U=process.env.HTTPS_URL;
p.systemSettings.upsert({
  where:{key:'public_https_url'},
  update:{value:U},
  create:{key:'public_https_url',value:U}
}).then(()=>p.\$disconnect()).then(()=>console.log('db_ok',U)).catch(e=>{console.error(e);process.exit(1)});
"

# Recreate API with HTTPS env for CORS + storefront
cd /opt/decozr
set -a
# shellcheck disable=SC1091
source deploy/vps/.env.https
set +a
sudo_run -E docker compose -p decozr -f deploy/vps/docker-compose.yml up -d api

echo "PUBLIC_HTTPS_URL=$URL"
echo "TUNNEL_OK"
