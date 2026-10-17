#!/usr/bin/env bash
# Rebuild and redeploy whenever content or uploaded photos change (e.g. after a CMS save).
cd "$(dirname "${BASH_SOURCE[0]}")/.."
while true; do
  inotifywait -r -q -e close_write,create,delete,moved_to src/content src/assets/uploads
  sleep 3   # let a multi-file save finish
  ./server/deploy-test.sh || echo "Build failed; keeping the previous site online."
done
