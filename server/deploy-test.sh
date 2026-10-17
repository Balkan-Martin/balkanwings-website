#!/usr/bin/env bash
# Build the site and publish it to the nginx web root.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
WEBROOT="${WEBROOT:-/var/www/balkanwings}"
[ -d node_modules ] || npm install --no-audit --no-fund
npm run build
rsync -a --delete dist/ "$WEBROOT"/
echo "Deployed $(date '+%F %T')"
