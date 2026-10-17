#!/usr/bin/env bash
# Build the site on this server and upload it to the live hosting over SFTP.
#   ./server/deploy-production.sh              build, show what would change, ask, back up the live site, upload
#   ./server/deploy-production.sh --prune      also delete live files that no longer exist locally (keeps .well-known and cgi-bin)
#   ./server/deploy-production.sh --no-backup  skip the backup download
#   ./server/deploy-production.sh --dir PATH   upload an existing folder instead of building (use a backup folder to roll back)
#   ./server/deploy-production.sh --yes        do not ask for confirmation
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
CONF="${DEPLOY_ENV:-$HOME/.balkanwings-deploy.env}"
KNOWN="${DEPLOY_KNOWN_HOSTS:-$HOME/.balkanwings-known_hosts}"
[ -f "$CONF" ]  || { echo "Missing $CONF. Copy server/deploy.env.example there and fill it in."; exit 1; }
[ -f "$KNOWN" ] || { echo "Missing $KNOWN. Create it with: ssh-keyscan -p PORT HOST > $KNOWN  (then confirm the fingerprint with superhosting)"; exit 1; }
set -a; . "$CONF"; set +a
: "${SFTP_HOST:?}" "${SFTP_USER:?}" "${SFTP_PASSWORD:?}" "${SFTP_PATH:?}"
SFTP_PORT="${SFTP_PORT:-22}"
command -v lftp >/dev/null || { echo "Install lftp first: sudo apt install lftp"; exit 1; }

YES=0; PRUNE=0; BACKUP=1; SRC="dist"; BUILD=1
while [ $# -gt 0 ]; do case "$1" in
  --yes) YES=1;; --prune) PRUNE=1;; --no-backup) BACKUP=0;;
  --dir) SRC="${2:?--dir needs a folder}"; BUILD=0; shift;;
  *) echo "Unknown option: $1"; exit 1;; esac; shift; done

# Credentials go through a temporary private script file (never on the command line); quotes and backslashes are escaped.
ESC="$(printf '%s' "$SFTP_PASSWORD" | sed 's/[\\"]/\\&/g')"
lf() {
  local f rc=0; f="$(mktemp)"; chmod 600 "$f"
  {
    echo "set sftp:connect-program \"ssh -a -x -p $SFTP_PORT -o UserKnownHostsFile=$KNOWN -o StrictHostKeyChecking=yes\""
    echo "set cmd:fail-exit yes"; echo "set net:max-retries 2"; echo "set net:timeout 20"
    echo "open -u \"$SFTP_USER\",\"$ESC\" sftp://$SFTP_HOST"
    echo "$1"; echo "bye"
  } > "$f"
  lftp -f "$f" || rc=$?
  rm -f "$f"; return $rc
}

if [ "$BUILD" -eq 1 ]; then
  [ -d node_modules ] || npm install --no-audit --no-fund
  npm run build
  N=$( (grep -rhoE '"\[[^]"]+\]"' src/content --include=*.json; grep -rhE '^(title|summary|requirements|duration|price): "\[' src/content/programs) | wc -l )
  [ "$N" -eq 0 ] || echo "WARNING: about $N texts are still [placeholders] in the content."
fi
[ -f "$SRC/index.html" ] || { echo "ERROR: $SRC/index.html not found, nothing to deploy."; exit 1; }

# The live hosting only needs the finished site: the editor (admin/) and login helper (oauth/) stay on the lab server.
OPTS="--no-perms --parallel=3 --exclude ^admin/ --exclude ^oauth/"
[ "$PRUNE" -eq 1 ] && OPTS="$OPTS --delete --exclude ^\\.well-known/ --exclude ^cgi-bin/"

echo "== Checking the connection =="
lf "cd \"$SFTP_PATH\"; pwd" || { echo "Cannot log in or open $SFTP_PATH. Nothing was changed."; exit 1; }
echo "== Changes that would be uploaded to $SFTP_HOST:$SFTP_PATH =="
lf "mirror -R $OPTS --dry-run --verbose \"$SRC\" \"$SFTP_PATH\""
if [ "$YES" -ne 1 ]; then
  read -r -p "Type DEPLOY to upload to the LIVE site: " A
  [ "$A" = "DEPLOY" ] || { echo "Cancelled."; exit 1; }
fi
if [ "$BACKUP" -eq 1 ]; then
  BK="$HOME/balkanwings-backups/$(date +%F-%H%M%S)"; mkdir -p "$BK"
  echo "== Backing up the live site to $BK =="
  lf "mirror --parallel=3 \"$SFTP_PATH\" \"$BK\""
fi
echo "== Uploading =="
lf "mirror -R $OPTS --verbose \"$SRC\" \"$SFTP_PATH\""
echo "Done $(date '+%F %T'). Open https://balkanwings.eu/ and check the pages in both languages."
