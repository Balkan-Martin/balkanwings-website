#!/usr/bin/env bash
# One-step local test environment for macOS: website + CMS (edits files directly, no GitHub login needed).
set -e
if ! command -v node >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then echo "Installing Node.js via Homebrew..."; brew install node
  else echo "Node.js not found. Install it from https://nodejs.org (LTS) or install Homebrew first, then re-run."; exit 1; fi
fi
echo "Node $(node -v) / npm $(npm -v)"
npm install
npm run cms &            # local CMS file server
CMS_PID=$!
trap 'kill $CMS_PID 2>/dev/null' EXIT
echo "Site:  http://localhost:4321   CMS: http://localhost:4321/admin/   (Ctrl+C to stop)"
npm run dev -- --open
