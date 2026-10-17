#!/usr/bin/env bash
# Commit all changes (CMS edits, photos, code) and push them to GitHub on the current branch.
# Usage: ./server/save-to-github.sh "optional message"
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
MSG="${1:-Content update $(date '+%F %T')}"
git add -A
if git diff --cached --quiet; then echo "Nothing to commit."; exit 0; fi
git commit -m "$MSG"
git push -u origin HEAD
