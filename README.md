# Balkan Wings website (Astro + Decap CMS)

Static bilingual site (English at `/`, Bulgarian at `/bg/`). Text in `[square brackets]` is a placeholder.

## How it works
```
Editors ──► CMS on the lab server ──► files in this repo ──► nginx (lab preview)
                                                         └─► ./server/deploy-production.sh ──► SFTP ──► live hosting
```
The live hosting only receives finished HTML/CSS/images. It needs no Node, git or PHP. GitHub is an optional backup/history, not part of publishing.

## 1. Test on a Mac
```bash
./setup-mac.sh
```
Site: http://localhost:4321 (Bulgarian: /bg/). CMS: http://localhost:4321/admin/ (local mode: no login, edits write into `src/content/`).

## 2. Where things are
- `src/content/{en,bg}/*.json`: page text (one file per CMS entry)
- `src/content/programs/{en,bg}/*.md`: one file per training program (file name = web address, must match in both languages; `draft: true` hides it)
- `src/assets/uploads/`: uploaded photos (converted to WebP at several sizes on build)
- Colours: top of `src/styles/global.css`. Logo/favicon: `public/logo.png`, `public/favicon.png`
- CMS configuration: `public/admin/config.js`

## 3. Lab server (Ubuntu + nginx)
`./server/setup-server.sh` installs nginx, builds the site and starts two services: the local CMS file server and a watcher that rebuilds after every CMS save. Reach the CMS from your computer with:
```bash
ssh -N -L 8080:localhost:80 -L 8081:localhost:8081 youruser@LAB_SERVER_IP    # then open http://localhost:8080/admin/
```
Other scripts: `deploy-test.sh` (rebuild lab site), `save-to-github.sh` (commit and push).

## 4. Publish to the live hosting
One-time setup on the lab server:
1. `sudo apt install lftp`
2. `cp server/deploy.env.example ~/.balkanwings-deploy.env && chmod 600 ~/.balkanwings-deploy.env`, then fill in the SFTP host, port, user, password and web-root folder (`SFTP_PATH`, e.g. `/public_html`; confirm with superhosting).
3. Trust the hosting's SSH key: `ssh-keyscan -p PORT SFTP_HOST > ~/.balkanwings-known_hosts` and confirm the fingerprint with superhosting.

To publish:
```bash
./server/deploy-production.sh
```
It builds, warns if `[placeholders]` remain, shows what would be uploaded, asks you to type DEPLOY, downloads a backup of the live site to `~/balkanwings-backups/<date>/`, then uploads. The editor (`/admin/`) and `oauth/` are never uploaded.
- `--prune` also deletes live files that no longer exist locally (keeps `.well-known/` and `cgi-bin/`). Use it only after checking the preview list.
- Roll back: `./server/deploy-production.sh --dir ~/balkanwings-backups/<date>`
- Without `--prune`, deleted pages stay on the live site until you prune or delete them by SFTP.

## 5. GitHub as backup
Create a private repo, add the lab server's SSH key as a deploy key with write access, then `./server/save-to-github.sh "message"` after changes. Pushing to GitHub does not publish anything.

## 6. Optional: live CMS at balkanwings.eu/admin/
Not needed for the lab workflow above. It requires GitHub login (PHP helper in `public/oauth/`, `oauth-server/config.example.php`) and the GitHub Action in `server/optional/github-action-deploy.yml.example` (copy to `.github/workflows/deploy.yml`, set `GITHUB_REPO` in `public/admin/config.js`). Untested end to end.

## Not yet verified
The CMS screens in a browser, the lab-server systemd services, and the deploy script against the real superhosting account. Run the first production deploy as a trial: check the dry-run list, then check the live pages.

## 7. Updating the code from a new zip (keeps your content)
```bash
cd ~/pilot-school && git add -A && git commit -m "Save before update"
rm -rf /tmp/new && unzip -q ~/pilot-school-stage3.zip -d /tmp/new
EXCL="--exclude=.git --exclude=node_modules --exclude=dist --exclude=.astro --exclude=src/content/ --exclude=src/assets/uploads/"
rsync -a --delete -n -v $EXCL /tmp/new/pilot-school/ ./     # preview (nothing changes)
rsync -a --delete $EXCL /tmp/new/pilot-school/ ./            # apply
node server/merge-new-content.mjs /tmp/new/pilot-school      # add new content fields, keep your text
npm install && ./server/deploy-test.sh
```
