# DecoZR VPS (isolated)

This stack runs **beside** another project without sharing its database, containers, or public ports.

## Isolation guarantees

| Item | DecoZR | Typical other app |
|------|--------|-------------------|
| Compose project | `decozr` | different name |
| Containers | `decozr-api`, `decozr-web` | untouched |
| DB | SQLite volume `decozr_sqlite` | untouched |
| Host port | `127.0.0.1:18080` only | 80/443 stay for existing site |
| Network | `decozr_net` | separate |

Stopping DecoZR never stops the other app:

```bash
docker compose -p decozr -f deploy/vps/docker-compose.yml down
```

## Deploy on VPS

```bash
# 1) clone into its own folder (not inside the other project)
sudo mkdir -p /opt/decozr
sudo chown $USER:$USER /opt/decozr
git clone https://github.com/ZINOU39003/decozr-erp.git /opt/decozr
cd /opt/decozr

# 2) build & start (isolated)
bash deploy/vps/deploy.sh
```

## Public URL without harming the other site

Add a **new** nginx site (subdomain), e.g. `decozr.yourdomain.com` → `127.0.0.1:18080`.

Copy example:

```bash
sudo cp deploy/vps/host-nginx-decozr.conf.example /etc/nginx/sites-available/decozr.conf
# edit server_name
sudo ln -sf /etc/nginx/sites-available/decozr.conf /etc/nginx/sites-enabled/decozr.conf
sudo nginx -t && sudo systemctl reload nginx
```

Then (optional) HTTPS with certbot for that subdomain only.

## Default login

- Email: `admin@decozr.local`
- Password: `admin123`

## Required from you to finish remote deploy

Send (privately):

1. VPS IP / hostname  
2. SSH user (e.g. `root` or `ubuntu`)  
3. Subdomain you want (e.g. `decozr.yourdomain.com`)  
4. How you connect (password or SSH key)

We will only write under `/opt/decozr` and a new nginx site file — never overwrite the other project's files.
