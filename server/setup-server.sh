#!/usr/bin/env bash
# One-time setup of the Ubuntu test server: nginx + automatic rebuilds. Run as your normal user (it calls sudo).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ "$(id -u)" -ne 0 ] || { echo "Run as your normal user, not root."; exit 1; }
USER_NAME="$(id -un)"
command -v node >/dev/null || { echo "Install Node.js 20.3+ first."; exit 1; }
node -e 'process.exit(+process.versions.node.split(".")[0] >= 20 ? 0 : 1)' || { echo "Node 20.3 or newer is required."; exit 1; }

sudo apt-get update
sudo apt-get install -y nginx rsync inotify-tools git
sudo mkdir -p /var/www/balkanwings && sudo chown "$USER_NAME": /var/www/balkanwings

cd "$DIR"
if [ ! -d .git ]; then git init -q && git add -A && git -c user.name=local -c user.email=local@localhost commit -qm "Initial import"; fi
npm install --no-audit --no-fund
./server/deploy-test.sh

sudo cp server/nginx-balkanwings.conf /etc/nginx/sites-available/balkanwings
sudo ln -sf /etc/nginx/sites-available/balkanwings /etc/nginx/sites-enabled/balkanwings
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx

sudo systemctl disable --now balkanwings-dev 2>/dev/null || true   # old dev-server service, if you created it
for u in balkanwings-cms balkanwings-watch; do
  sed "s#__USER__#$USER_NAME#g; s#__DIR__#$DIR#g" "server/$u.service" | sudo tee "/etc/systemd/system/$u.service" >/dev/null
done
sudo systemctl daemon-reload
sudo systemctl enable --now balkanwings-cms balkanwings-watch

if command -v ufw >/dev/null; then sudo ufw allow 80/tcp; fi
echo "Done. Open http://$(hostname -I | awk '{print $1}')/"
